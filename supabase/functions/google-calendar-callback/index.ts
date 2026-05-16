import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// This function is hit by Google's redirect — it must respond with HTML
// that closes the popup or redirects back to the app.

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function resultPage(success: boolean, message: string, returnTo: string) {
  const safeReturn = returnTo.startsWith("/") ? returnTo : "/cleaner/calendar-sync";
  return htmlResponse(`<!doctype html>
<html><head><meta charset="utf-8"><title>${success ? "Connected" : "Connection failed"}</title>
<style>
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
       background:linear-gradient(135deg,#0A3B78,#169AF5);color:#fff;
       min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
  .card{background:rgba(255,255,255,.1);backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:40px;max-width:420px}
  h1{margin:0 0 8px;font-size:24px}
  p{margin:0 0 20px;opacity:.85;line-height:1.5}
  .icon{font-size:48px;margin-bottom:16px}
  a{display:inline-block;background:#fff;color:#0A3B78;padding:12px 24px;border-radius:12px;
    text-decoration:none;font-weight:600}
</style></head>
<body><div class="card">
  <div class="icon">${success ? "✅" : "⚠️"}</div>
  <h1>${success ? "Calendar connected!" : "Connection failed"}</h1>
  <p>${message}</p>
  <a href="${safeReturn}">Return to PureTask</a>
</div>
<script>setTimeout(()=>{window.location.href=${JSON.stringify(safeReturn)}},2500)</script>
</body></html>`);
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");

    let returnTo = "/cleaner/calendar-sync";
    let userId: string | null = null;

    if (stateRaw) {
      try {
        const parsed = JSON.parse(atob(stateRaw));
        returnTo = parsed.return_to || returnTo;
        userId = parsed.user_id || null;
      } catch {
        return resultPage(false, "Invalid state. Please try connecting again.", returnTo);
      }
    }

    if (errorParam) {
      return resultPage(false, `Google denied access: ${errorParam}`, returnTo);
    }
    if (!code || !userId) {
      return resultPage(false, "Missing authorization code.", returnTo);
    }

    const clientId = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return resultPage(false, "Google credentials not configured on the server.", returnTo);
    }

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-calendar-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Google token exchange failed:", tokenData);
      return resultPage(false, tokenData.error_description || "Token exchange failed.", returnTo);
    }

    const accessToken: string = tokenData.access_token;
    const refreshToken: string | null = tokenData.refresh_token ?? null;
    const expiresIn: number = tokenData.expires_in ?? 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Fetch user info to get email
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const email: string | null = profile.email ?? null;
    const externalId: string = profile.id ?? email ?? `google_${userId}`;

    // Store via service role
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert manually: delete existing google connection for this user, then insert
    await admin.from("calendar_connections")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "google");

    const { error: insertErr } = await admin.from("calendar_connections").insert({
      user_id: userId,
      provider: "google",
      external_id: externalId,
      email,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt,
      sync_enabled: true,
    });

    if (insertErr) {
      console.error("Insert calendar_connections failed:", insertErr);
      return resultPage(false, insertErr.message, returnTo);
    }

    return resultPage(true, `Connected ${email ?? "your Google Calendar"}. Redirecting back…`, returnTo);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("google-calendar-callback error:", err);
    return resultPage(false, msg, "/cleaner/calendar-sync");
  }
});