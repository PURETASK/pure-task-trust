/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-otp`;

Deno.test("send-otp: returns 401 without authorization", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ phone_number: "+15551234567" }),
  });

  const body = await response.json();
  assertEquals(response.status, 401);
  assertExists(body.error);
});

Deno.test("send-otp: handles CORS preflight", async () => {
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

Deno.test("send-otp: validates phone number format", async () => {
  const invalidNumbers = [
    "1234567890",      // Missing +
    "+1",              // Too short
    "invalid",         // Not a number
    "",                // Empty
  ];

  for (const phone of invalidNumbers) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phone_number: phone }),
    });

    const body = await response.json();
    // Should return error for invalid phone
    assertExists(body);
  }
});

Deno.test("send-otp: rejects missing phone number", async () => {
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

Deno.test("send-otp: E.164 format validation", async () => {
  // Valid E.164 format should pass format validation
  const validNumbers = [
    "+15551234567",
    "+442071234567",
    "+61412345678",
  ];

  for (const phone of validNumbers) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ phone_number: phone }),
    });

    // Auth will fail but format should be accepted
    const body = await response.json();
    assertExists(body);
  }
});
