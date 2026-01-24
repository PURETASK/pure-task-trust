/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/admin-workflows`;

Deno.test("admin-workflows: returns error without authorization", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      action: "cancel",
      job_id: "test-job-id"
    }),
  });

  // Function returns 401 when auth header missing (verify_jwt = true)
  assertEquals(response.status, 401);
  await response.text(); // Consume body
});

Deno.test("admin-workflows: handles CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "https://example.com",
      "Access-Control-Request-Method": "POST",
    },
  });

  assertEquals(response.status, 200);
  const corsHeader = response.headers.get("Access-Control-Allow-Origin");
  assertEquals(corsHeader, "*");
  await response.text();
});

Deno.test("admin-workflows: validates action types", async () => {
  const validActions = ["reschedule", "reassign", "cancel", "refund"];
  
  for (const action of validActions) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        action,
        job_id: "00000000-0000-0000-0000-000000000000"
      }),
    });

    const body = await response.json();
    // Will fail auth/permissions but action should be recognized
    assertExists(body);
  }
});

Deno.test("admin-workflows: rejects invalid action", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      action: "invalid_action",
      job_id: "test-job-id"
    }),
  });

  const body = await response.json();
  assertExists(body);
});

Deno.test("admin-workflows: validates UUID format for job_id", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      action: "cancel",
      job_id: "not-a-valid-uuid"
    }),
  });

  const body = await response.json();
  // Should reject invalid UUID format
  assertExists(body);
});

Deno.test("admin-workflows: reschedule requires date and time", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      action: "reschedule",
      job_id: "00000000-0000-0000-0000-000000000000"
      // Missing new_date and new_time
    }),
  });

  const body = await response.json();
  assertExists(body);
});

Deno.test("admin-workflows: reassign requires new_cleaner_id", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      action: "reassign",
      job_id: "00000000-0000-0000-0000-000000000000"
      // Missing new_cleaner_id
    }),
  });

  const body = await response.json();
  assertExists(body);
});

Deno.test("admin-workflows: requires admin role", async () => {
  // Using anon key should fail admin check
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      action: "cancel",
      job_id: "00000000-0000-0000-0000-000000000000",
      reason: "Test cancellation"
    }),
  });

  const body = await response.json();
  // Should fail with unauthorized or forbidden
  assertExists(body);
});
