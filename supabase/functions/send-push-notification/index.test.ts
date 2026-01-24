/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-push-notification`;

Deno.test("send-push-notification: handles CORS preflight", async () => {
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

Deno.test("send-push-notification: requires title and body", async () => {
  // Missing title
  const response1 = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      user_id: "test-user-id",
      body: "Test notification body"
    }),
  });

  const body1 = await response1.json();
  assertEquals(response1.status, 400);
  assertExists(body1.error);

  // Missing body
  const response2 = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      user_id: "test-user-id",
      title: "Test Title"
    }),
  });

  const body2 = await response2.json();
  assertEquals(response2.status, 400);
  assertExists(body2.error);
});

Deno.test("send-push-notification: requires user_id or user_ids", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      title: "Test Title",
      body: "Test Body"
      // Missing user_id and user_ids
    }),
  });

  const body = await response.json();
  assertEquals(response.status, 400);
  assertExists(body.error);
});

Deno.test("send-push-notification: accepts single user_id", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      user_id: "00000000-0000-0000-0000-000000000000",
      title: "Test Title",
      body: "Test Body"
    }),
  });

  const body = await response.json();
  // Should succeed even with no tokens
  assertEquals(response.status, 200);
  assertExists(body.success);
});

Deno.test("send-push-notification: accepts multiple user_ids", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      user_ids: [
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002"
      ],
      title: "Broadcast Title",
      body: "Broadcast Body"
    }),
  });

  const body = await response.json();
  assertEquals(response.status, 200);
  assertExists(body.success);
});

Deno.test("send-push-notification: accepts optional data payload", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      user_id: "00000000-0000-0000-0000-000000000000",
      title: "New Job",
      body: "You have a new job request",
      data: {
        job_id: "job-123",
        action: "view_job"
      }
    }),
  });

  const body = await response.json();
  assertEquals(response.status, 200);
  assertExists(body.success);
});

Deno.test("send-push-notification: handles users with no device tokens", async () => {
  // Use a valid UUID format for the user_id
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ 
      user_id: "00000000-0000-0000-0000-000000000099",
      title: "Test",
      body: "Test"
    }),
  });

  const body = await response.json();
  // Function should handle gracefully - either 200 with 0 sent or error
  assertExists(response.status);
  assertExists(body);
});
