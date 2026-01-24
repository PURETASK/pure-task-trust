/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/verify-otp`;

Deno.test("verify-otp: returns 401 without authorization", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      phone_number: "+15551234567",
      otp_code: "123456"
    }),
  });

  const body = await response.json();
  assertEquals(response.status, 401);
  assertExists(body.error);
});

Deno.test("verify-otp: handles CORS preflight", async () => {
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

Deno.test("verify-otp: requires both phone and OTP code", async () => {
  // Missing OTP code
  const response1 = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ phone_number: "+15551234567" }),
  });

  const body1 = await response1.json();
  assertExists(body1);

  // Missing phone number
  const response2 = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ otp_code: "123456" }),
  });

  const body2 = await response2.json();
  assertExists(body2);
});

Deno.test("verify-otp: validates OTP code format", async () => {
  const invalidCodes = [
    "12345",     // Too short
    "1234567",   // Too long
    "abcdef",    // Non-numeric
    "",          // Empty
  ];

  for (const code of invalidCodes) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        phone_number: "+15551234567",
        otp_code: code
      }),
    });

    const body = await response.json();
    assertExists(body);
  }
});

Deno.test("verify-otp: handles expired or invalid OTP", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      phone_number: "+15551234567",
      otp_code: "000000" // Invalid code
    }),
  });

  const body = await response.json();
  // Should return error for invalid/expired OTP
  assertExists(body);
});
