// Shared auth + quota helpers for edge functions (Deno runtime).
//
// getAuthedUser derives the caller from their verified JWT and returns a
// Supabase client bound to that JWT, so Row Level Security applies to every
// query. This is the secure alternative to trusting a userId from the request
// body while using the service-role client.

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export interface AuthedContext {
  userId: string;
  email: string | null;
  /** Supabase client scoped to the caller's JWT — RLS applies. */
  supabase: SupabaseClient;
}

export async function getAuthedUser(
  req: Request,
  env: Record<string, string | undefined>,
): Promise<AuthedContext> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new HttpError('Missing Authorization header', 401);

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new HttpError('Server is misconfigured (missing Supabase env)', 500);
  }

  // Bind the client to the caller's JWT so RLS is enforced on all queries.
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new HttpError('Invalid or expired token', 401);

  return { userId: data.user.id, email: data.user.email ?? null, supabase };
}

/**
 * Server-side quota enforcement. Throws HttpError(429) when the user is over the
 * monthly limit for a feature. Fails open on RPC errors (e.g. transient DB
 * issues) so the product keeps working, but fails closed on an explicit "false".
 */
export async function enforceQuota(
  ctx: AuthedContext,
  feature: 'ai_improvements' | 'job_matcher_advanced' | 'cv_creation' | 'pdf_export',
): Promise<void> {
  const { data, error } = await ctx.supabase.rpc('can_use_feature', {
    p_user_id: ctx.userId,
    p_feature_type: feature,
  });
  if (error) {
    console.warn(`[quota] can_use_feature failed, allowing: ${error.message}`);
    return;
  }
  if (data === false) {
    throw new HttpError('Monthly limit reached for this feature. Upgrade to Pro for more.', 429);
  }
}

/** Records one unit of usage for a feature (best-effort). */
export async function recordUsage(
  ctx: AuthedContext,
  feature: 'ai_improvements' | 'job_matcher_advanced' | 'cv_creation' | 'pdf_export',
): Promise<void> {
  const { error } = await ctx.supabase.rpc('increment_feature_usage', {
    p_user_id: ctx.userId,
    p_feature_type: feature,
  });
  if (error) console.warn(`[quota] increment_feature_usage failed: ${error.message}`);
}
