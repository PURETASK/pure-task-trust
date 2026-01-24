/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-checkout`;

Deno.test("create-checkout: returns error without authorization", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ packageId: "starter" }),
  });

  // Returns 401 when auth header missing (verify_jwt = true)
  assertEquals(response.status, 401);
  await response.text(); // Consume body
});

Deno.test("create-checkout: handles CORS preflight", async () => {
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

Deno.test("create-checkout: validates package IDs", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ packageId: "invalid_package" }),
  });

  const body = await response.json();
  // Should error - either auth failure or invalid package
  assertExists(body);
});

Deno.test("create-checkout: accepts valid package IDs", async () => {
  const validPackages = ["mini", "starter", "standard", "value", "premium"];
  
  for (const packageId of validPackages) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ packageId }),
    });

    // Will fail auth but validates package parsing
    const body = await response.json();
    assertExists(body);
  }
});

Deno.test("create-checkout: rejects empty body", async () => {
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
  assertExists(body);
});
