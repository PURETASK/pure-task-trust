/**
 * Shared Sentry initialisation for Supabase Edge Functions (Deno runtime).
 *
 * Usage in any cron / background edge function:
 *
 *   import { Sentry, withCronMonitor } from "../_shared/sentry.ts";
 *
 *   Deno.serve(async (req) => {
 *     // ... auth guard ...
 *     return await withCronMonitor("my-function-slug", async () => {
 *       // your job logic
 *       return new Response(JSON.stringify({ ok: true }), { status: 200 });
 *     });
 *   });
 *
 * withCronMonitor sends a check-in at start (IN_PROGRESS) and a final
 * check-in (OK or ERROR) when the job finishes, exactly as denoCronIntegration
 * does for native Deno.cron() jobs.
 *
 * NOTE: We use npm:@sentry/deno (the official, non-deprecated SDK) but with
 * defaultIntegrations:false to prevent Node.js-only transitive deps (call-bound
 * etc.) from being bundled by the Supabase edge runtime.  Only the lightweight
 * denoCronIntegration is added back explicitly.
 */

// deno-lint-ignore-file no-explicit-any
import * as Sentry from "npm:@sentry/deno@8.55.0";

let initialised = false;

function init() {
  if (initialised) return;
  initialised = true;

  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) {
    console.warn("[Sentry] SENTRY_DSN not set — monitoring disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: Deno.env.get("SENTRY_ENVIRONMENT") ?? "production",

    // defaultIntegrations:false prevents Node.js-only integrations from loading.
    // These pull in transitive deps (call-bound, side-channel, etc.) that use
    // syntax the Supabase edge runtime cannot parse.
    defaultIntegrations: false,

    // denoCronIntegration is pure Deno — safe to add explicitly.
    // Our edge functions are HTTP-triggered (pg_cron → net.http_post),
    // so we pair it with manual withCronMonitor() wrappers below.
    integrations: [Sentry.denoCronIntegration()],

    tracesSampleRate: 1.0,
  });
}

/** Re-export so callers can capture extra events without re-importing. */
export { Sentry };

/**
 * Wraps a cron job handler with Sentry Cron Monitoring check-ins.
 *
 * @param monitorSlug  The slug shown in Sentry Crons (use kebab-case).
 * @param fn           The async job handler. Should return a Response.
 */
export async function withCronMonitor(
  monitorSlug: string,
  fn: () => Promise<Response>,
): Promise<Response> {
  init();

  const checkInId = Sentry.captureCheckIn(
    { monitorSlug, status: "in_progress" },
    {
      schedule: { type: "interval", value: 1, unit: "hour" }, // override per-function if needed
      checkinMargin: 5,
      maxRuntime: 10,
      timezone: "UTC",
    },
  );

  const startTime = Date.now();

  try {
    const response = await fn();

    Sentry.captureCheckIn({
      checkInId,
      monitorSlug,
      status: response.ok ? "ok" : "error",
      duration: (Date.now() - startTime) / 1000,
    });

    return response;
  } catch (err) {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug,
      status: "error",
      duration: (Date.now() - startTime) / 1000,
    });

    Sentry.captureException(err);

    // Re-throw so the calling function can still return a 500
    throw err;
  }
}
