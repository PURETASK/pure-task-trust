import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json();
    const {
      cleanerId, cleaningType, hours, totalCredits, scheduledDate, notes,
    } = body ?? {};

    if (!cleanerId || !cleaningType || !hours || !totalCredits) {
      return json({ error: "Missing required fields" }, 400);
    }
    if (typeof hours !== "number" || hours <= 0 || hours > 24) {
      return json({ error: "Invalid hours" }, 400);
    }
    if (typeof totalCredits !== "number" || totalCredits <= 0) {
      return json({ error: "Invalid totalCredits" }, 400);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await adminClient.rpc("create_booking_atomic", {
      _user_id: userId,
      _cleaner_id: cleanerId,
      _cleaning_type: cleaningType,
      _hours: hours,
      _total_credits: totalCredits,
      _scheduled_start: scheduledDate ?? null,
      _notes: notes ?? null,
    });
    if (error) return json({ error: error.message }, 400);

    return json({ jobId: data });
  } catch (e) {
    console.error("[create-booking]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}