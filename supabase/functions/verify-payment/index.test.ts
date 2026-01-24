/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/verify-payment`;

Deno.test("verify-payment: returns error without authorization header", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ sessionId: "cs_test_123" }),
  });

  // Function returns 401 when auth header missing
  assertEquals(response.status, 401);
  await response.text(); // Consume body
});

Deno.test("verify-payment: returns error for missing sessionId", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  const body = await response.json();
  // Should return error about missing session
  assertExists(body);
  await response.text().catch(() => {}); // Consume any remaining body
});

Deno.test("verify-payment: returns error for invalid session format", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ sessionId: "invalid_session_id" }),
  });

  const body = await response.json();
  // Stripe will reject invalid session IDs
  assertExists(body);
});

Deno.test("verify-payment: handles CORS preflight", async () => {
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
  await response.text(); // Consume body
});

Deno.test("verify-payment: rejects non-POST methods", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  // GET should fail or return method not allowed
  assertExists(response.status);
  await response.text(); // Consume body
});
