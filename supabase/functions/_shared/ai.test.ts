import { describe, it, expect, vi } from 'vitest';
import {
  resolveAIConfig,
  createChatCompletion,
  assertUsableConfig,
  AIError,
  type AIProviderConfig,
} from './ai';

// A tiny fake Response so we don't need a real fetch/network in tests.
function fakeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const okCompletion = (content: string) =>
  fakeResponse({ choices: [{ message: { content } }] });

const baseConfig = (over: Partial<AIProviderConfig> = {}): AIProviderConfig => ({
  provider: 'openai',
  apiKey: 'test-key',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 500,
  timeoutMs: 1000,
  maxRetries: 2,
  ...over,
});

describe('resolveAIConfig', () => {
  it('defaults to the OpenAI provider and model', () => {
    const c = resolveAIConfig({ AI_API_KEY: 'k' });
    expect(c.provider).toBe('openai');
    expect(c.baseUrl).toBe('https://api.openai.com/v1');
    expect(c.model).toBe('gpt-4o');
    expect(c.temperature).toBe(0.7);
    expect(c.maxRetries).toBe(2);
  });

  it('applies DeepSeek provider preset', () => {
    const c = resolveAIConfig({ AI_PROVIDER: 'deepseek', AI_API_KEY: 'k' });
    expect(c.baseUrl).toBe('https://api.deepseek.com/v1');
    expect(c.model).toBe('deepseek-chat');
  });

  it('falls back to OPENAI_API_KEY when AI_API_KEY is unset', () => {
    const c = resolveAIConfig({ OPENAI_API_KEY: 'legacy-key' });
    expect(c.apiKey).toBe('legacy-key');
  });

  it('honors explicit overrides and trims trailing slashes from baseUrl', () => {
    const c = resolveAIConfig({
      AI_PROVIDER: 'openai-compatible',
      AI_API_KEY: 'k',
      AI_BASE_URL: 'http://localhost:11434/v1/',
      AI_MODEL: 'llama3',
      AI_TEMPERATURE: '0.1',
      AI_MAX_TOKENS: '256',
      AI_TIMEOUT_MS: '5000',
      AI_MAX_RETRIES: '0',
    });
    expect(c.baseUrl).toBe('http://localhost:11434/v1');
    expect(c.model).toBe('llama3');
    expect(c.temperature).toBe(0.1);
    expect(c.maxTokens).toBe(256);
    expect(c.maxRetries).toBe(0);
  });
});

describe('assertUsableConfig', () => {
  it('does not throw for the mock provider without a key', () => {
    expect(() => assertUsableConfig(baseConfig({ provider: 'mock', apiKey: '' }))).not.toThrow();
  });

  it('throws a 503 AIError when the API key is missing', () => {
    expect(() => assertUsableConfig(baseConfig({ apiKey: '' }))).toThrow(AIError);
  });
});

describe('createChatCompletion — mock provider', () => {
  it('returns deterministic output with no network access', async () => {
    const fetchSpy = vi.fn();
    const config = baseConfig({ provider: 'mock', apiKey: '' });
    const out = await createChatCompletion(
      config,
      { system: 's', user: 'u', mock: 'DETERMINISTIC' },
      fetchSpy as unknown as typeof fetch,
    );
    expect(out).toBe('DETERMINISTIC');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('supports a function mock derived from input', async () => {
    const config = baseConfig({ provider: 'mock', apiKey: '' });
    const out = await createChatCompletion(config, {
      system: 's',
      user: 'hello',
      mock: ({ user }) => `improved:${user}`,
    });
    expect(out).toBe('improved:hello');
  });
});

describe('createChatCompletion — real provider (injected fetch)', () => {
  it('parses the assistant message on success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okCompletion('  result text  '));
    const out = await createChatCompletion(
      baseConfig(),
      { system: 's', user: 'u' },
      fetchImpl as unknown as typeof fetch,
    );
    expect(out).toBe('result text');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('sends response_format when json is requested', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okCompletion('{"ok":true}'));
    await createChatCompletion(
      baseConfig(),
      { system: 's', user: 'u', json: true },
      fetchImpl as unknown as typeof fetch,
    );
    const body = JSON.parse((fetchImpl.mock.calls[0][1] as RequestInit).body as string);
    expect(body.response_format).toEqual({ type: 'json_object' });
  });

  it('throws a non-retryable AIError on a 400 without retrying', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse({ error: 'bad' }, false, 400));
    await expect(
      createChatCompletion(baseConfig(), { system: 's', user: 'u' }, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ name: 'AIError', status: 502 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse({ error: 'oops' }, false, 500))
      .mockResolvedValueOnce(okCompletion('recovered'));
    const out = await createChatCompletion(
      baseConfig({ maxRetries: 1 }),
      { system: 's', user: 'u' },
      fetchImpl as unknown as typeof fetch,
    );
    expect(out).toBe('recovered');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('retries on network error then throws after exhausting retries', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
    await expect(
      createChatCompletion(
        baseConfig({ maxRetries: 1 }),
        { system: 's', user: 'u' },
        fetchImpl as unknown as typeof fetch,
      ),
    ).rejects.toBeInstanceOf(AIError);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('treats an AbortError (timeout) as a retryable 504', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const fetchImpl = vi.fn().mockRejectedValue(abort);
    await expect(
      createChatCompletion(
        baseConfig({ maxRetries: 0 }),
        { system: 's', user: 'u' },
        fetchImpl as unknown as typeof fetch,
      ),
    ).rejects.toMatchObject({ status: 504 });
  });

  it('throws when the provider returns an empty/malformed message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse({ choices: [{ message: {} }] }));
    await expect(
      createChatCompletion(baseConfig(), { system: 's', user: 'u' }, fetchImpl as unknown as typeof fetch),
    ).rejects.toBeInstanceOf(AIError);
  });
});
