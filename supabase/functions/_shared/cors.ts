// Shared CORS handling for edge functions.
//
// By default the browser origin is echoed back only when it matches the
// ALLOWED_ORIGINS allow-list (comma-separated env var). When ALLOWED_ORIGINS is
// unset, we fall back to "*" so local development keeps working — set it in
// production to lock functions to your app's origin.

export function getAllowedOrigins(env: Record<string, string | undefined>): string[] {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export function corsHeaders(requestOrigin: string | null, allowed: string[]): Record<string, string> {
  let allowOrigin = '*';
  if (allowed.length > 0) {
    allowOrigin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : allowed[0];
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

/** Build a JSON Response with CORS headers applied. */
export function jsonResponse(
  body: unknown,
  status: number,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
