/**
 * Shared authentication guard helpers for edge functions.
 *
 * Usage:
 *   import { requireCronSecret, requireInternalSecret } from "../_shared/auth.ts";
 *
 *   const unauthorized = requireCronSecret(req, corsHeaders);
 *   if (unauthorized) return unauthorized;
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Returns a 401 Response if the request does not carry a valid CRON_SECRET bearer token.
 * Returns null if auth passes — caller should continue.
 */
export function requireCronSecret(
  req: Request,
  headers: Record<string, string> = corsHeaders
): Response | null {
  const secret = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonUnauthorized(headers);
  }
  return null;
}

/**
 * Returns a 401 Response if the request does not carry a valid INTERNAL_FUNCTION_SECRET bearer token.
 * Returns null if auth passes — caller should continue.
 */
export function requireInternalSecret(
  req: Request,
  headers: Record<string, string> = corsHeaders
): Response | null {
  const secret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonUnauthorized(headers);
  }
  return null;
}

/**
 * Builds a standard 401 Unauthorized JSON response.
 */
export function jsonUnauthorized(
  headers: Record<string, string> = corsHeaders
): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
