// =============================================================================
// Provider-agnostic AI layer for ResumAI edge functions.
// =============================================================================
// This module is intentionally free of Deno-specific and remote imports so it
// can be unit-tested with Vitest (Node) as well as run inside Deno Edge
// Functions. It uses only web-standard APIs (fetch, AbortController).
//
// Supported providers (all speak the OpenAI /chat/completions schema):
//   - openai              (default)
//   - deepseek            (OpenAI-compatible)
//   - openai-compatible   (Groq, Together, Ollama, LM Studio, self-hosted, ...)
//   - mock                (deterministic, offline, zero-cost — for demos & tests)
//
// API keys are read from the environment and never leave the server.
// =============================================================================

export type AIProviderName = 'openai' | 'deepseek' | 'openai-compatible' | 'mock';

export interface AIProviderConfig {
  provider: AIProviderName;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
}

export interface ChatParams {
  system: string;
  user: string;
  /** Per-call overrides */
  temperature?: number;
  maxTokens?: number;
  /** Ask the provider for a JSON object response */
  json?: boolean;
  /**
   * Deterministic output used when provider === 'mock'. Lets each feature
   * provide a realistic offline response. Ignored for real providers.
   */
  mock?: string | ((p: { system: string; user: string }) => string);
}

/** Normalized error thrown by the AI layer. `status` maps to an HTTP-ish code. */
export class AIError extends Error {
  status: number;
  retryable: boolean;
  constructor(message: string, status = 502, retryable = false) {
    super(message);
    this.name = 'AIError';
    this.status = status;
    this.retryable = retryable;
  }
}

const PROVIDER_DEFAULTS: Record<
  Exclude<AIProviderName, 'openai-compatible' | 'mock'>,
  { baseUrl: string; model: string }
> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
};

function num(value: string | undefined, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Resolve the AI configuration from an environment map. Pure and side-effect
 * free, so it can be unit-tested and reused across functions.
 */
export function resolveAIConfig(env: Record<string, string | undefined>): AIProviderConfig {
  const provider = (env.AI_PROVIDER?.toLowerCase() || 'openai') as AIProviderName;

  // OPENAI_API_KEY is honored as a fallback for backwards compatibility.
  const apiKey = env.AI_API_KEY || env.OPENAI_API_KEY || '';

  const preset =
    provider === 'openai' || provider === 'deepseek'
      ? PROVIDER_DEFAULTS[provider]
      : { baseUrl: '', model: '' };

  const baseUrl = (env.AI_BASE_URL || preset.baseUrl || '').replace(/\/+$/, '');
  const model = env.AI_MODEL || preset.model || '';

  return {
    provider,
    apiKey,
    baseUrl,
    model,
    temperature: num(env.AI_TEMPERATURE, 0.7),
    maxTokens: num(env.AI_MAX_TOKENS, 1000),
    timeoutMs: num(env.AI_TIMEOUT_MS, 30_000),
    maxRetries: Math.max(0, num(env.AI_MAX_RETRIES, 2)),
  };
}

/** Validates that a real (non-mock) provider has the config it needs. */
export function assertUsableConfig(config: AIProviderConfig): void {
  if (config.provider === 'mock') return;
  if (!config.apiKey) {
    throw new AIError(
      'AI provider is not configured. Set AI_API_KEY (or OPENAI_API_KEY), or use AI_PROVIDER=mock.',
      503,
    );
  }
  if (!config.baseUrl || !config.model) {
    throw new AIError(
      'AI provider is missing AI_BASE_URL or AI_MODEL for the selected AI_PROVIDER.',
      503,
    );
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function renderMock(params: ChatParams): string {
  if (typeof params.mock === 'function') return params.mock({ system: params.system, user: params.user });
  if (typeof params.mock === 'string') return params.mock;
  // Generic deterministic fallback.
  return params.json
    ? JSON.stringify({ mock: true, echo: params.user.slice(0, 200) })
    : `[MOCK AI] ${params.user.slice(0, 280)}`;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/**
 * Run a chat completion against the configured provider and return the assistant
 * message content as a string. Applies timeout, bounded retries with exponential
 * backoff, and normalized errors. In mock mode it returns deterministic output
 * with no network access.
 *
 * `fetchImpl` is injectable for testing.
 */
export async function createChatCompletion(
  config: AIProviderConfig,
  params: ChatParams,
  fetchImpl: FetchLike = fetch,
): Promise<string> {
  if (config.provider === 'mock') {
    return renderMock(params);
  }

  assertUsableConfig(config);

  const body = {
    model: config.model,
    messages: [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ],
    temperature: params.temperature ?? config.temperature,
    max_tokens: params.maxTokens ?? config.maxTokens,
    ...(params.json ? { response_format: { type: 'json_object' } } : {}),
  };

  const url = `${config.baseUrl}/chat/completions`;
  let lastError: AIError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        // Do not leak the provider's raw body to the caller.
        lastError = new AIError(`AI provider returned ${response.status}`, 502, retryable);
        if (retryable && attempt < config.maxRetries) {
          await sleep(2 ** attempt * 500);
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      const content: unknown = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.trim() === '') {
        throw new AIError('AI provider returned an empty or malformed response', 502, false);
      }
      return content.trim();
    } catch (err) {
      if (err instanceof AIError) {
        if (err.retryable && attempt < config.maxRetries) {
          lastError = err;
          await sleep(2 ** attempt * 500);
          continue;
        }
        throw err;
      }
      // Network error or abort (timeout): retryable.
      const isAbort = (err as { name?: string })?.name === 'AbortError';
      lastError = new AIError(
        isAbort ? 'AI provider request timed out' : 'AI provider request failed',
        504,
        true,
      );
      if (attempt < config.maxRetries) {
        await sleep(2 ** attempt * 500);
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new AIError('AI provider request failed', 502, false);
}
