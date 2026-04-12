/**
 * Edge Function API Versioning Helper
 *
 * Usage:
 *   import { getApiVersion, withVersionHeader } from "../_shared/versioning.ts";
 *
 *   const version = getApiVersion(req);          // "2026-04-12" | null
 *   return withVersionHeader(response, "2026-04-12");
 *
 * Convention:
 *   - Version is passed via `X-API-Version` header (date-based: YYYY-MM-DD)
 *   - Functions respond with `X-API-Version` in response headers
 *   - If no version header is sent, the latest version is assumed
 */

export const CURRENT_API_VERSION = "2026-04-12";

/**
 * Extract the requested API version from a request, or return null if unset.
 */
export function getApiVersion(req: Request): string | null {
  return req.headers.get("X-API-Version");
}

/**
 * Attach the served API version header to a Response.
 */
export function withVersionHeader(
  response: Response,
  version: string = CURRENT_API_VERSION
): Response {
  response.headers.set("X-API-Version", version);
  return response;
}

/**
 * Check if the request is for a specific API version or later.
 * Useful for conditional behaviour across versions.
 */
export function isVersionAtLeast(req: Request, minVersion: string): boolean {
  const v = getApiVersion(req);
  if (!v) return true; // no version means latest
  return v >= minVersion;
}
