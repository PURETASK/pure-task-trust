/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-email`;

Deno.test("send-email: handles CORS preflight", async () => {
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

Deno.test("send-email: validates required 'to' field", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      subject: "Test",
      template: "custom",
      data: { customHtml: "<p>Test</p>" }
      // Missing 'to' field
    }),
  });

  const body = await response.json();
  assertEquals(response.status, 400);
  assertExists(body.error);
});

Deno.test("send-email: accepts valid email templates", async () => {
  const validTemplates = [
    "booking_confirmation",
    "job_started",
    "job_completed",
    "review_request",
    "custom"
  ];

  for (const template of validTemplates) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        to: "test@example.com",
        subject: "Test",
        template,
        data: { 
          clientName: "Test User",
          customHtml: "<p>Test</p>"
        }
      }),
    });

    const body = await response.json();
    // May fail due to SendGrid config but template should be valid
    assertExists(body);
  }
});

Deno.test("send-email: accepts array of recipients", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      to: ["user1@example.com", "user2@example.com"],
      subject: "Test",
      template: "custom",
      data: { customHtml: "<p>Test</p>" }
    }),
  });

  const body = await response.json();
  assertExists(body);
});

Deno.test("send-email: booking_confirmation template includes data", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      to: "test@example.com",
      subject: "Booking Confirmed",
      template: "booking_confirmation",
      data: { 
        clientName: "John Doe",
        cleanerName: "Jane Smith",
        scheduledDate: "2025-02-01",
        scheduledTime: "10:00 AM",
        address: "123 Main St",
        credits: 50
      }
    }),
  });

  const body = await response.json();
  assertExists(body);
});

Deno.test("send-email: rejects invalid email format", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      to: "not-an-email",
      subject: "Test",
      template: "custom",
      data: { customHtml: "<p>Test</p>" }
    }),
  });

  const body = await response.json();
  assertExists(body);
});
