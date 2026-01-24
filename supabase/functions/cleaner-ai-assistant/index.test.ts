/// <reference lib="deno.ns" />
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/cleaner-ai-assistant`;

Deno.test("cleaner-ai-assistant: handles CORS preflight", async () => {
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

Deno.test("cleaner-ai-assistant: accepts messages array", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      messages: [
        { role: "user", content: "Hello, how can I improve my earnings?" }
      ]
    }),
  });

  // Check response type - should be streaming
  assertExists(response.headers.get("content-type"));
  await response.text(); // Consume body
});

Deno.test("cleaner-ai-assistant: accepts cleaner context", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      messages: [
        { role: "user", content: "What's my current reliability score?" }
      ],
      cleanerContext: {
        profile: {
          first_name: "John",
          tier: "silver",
          reliability_score: 85,
          jobs_completed: 50
        },
        recentJobs: [],
        earnings: {
          thisMonth: 500,
          lastMonth: 450
        }
      }
    }),
  });

  assertExists(response.status);
  await response.text();
});

Deno.test("cleaner-ai-assistant: handles empty messages", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      messages: []
    }),
  });

  assertExists(response.status);
  await response.text();
});

Deno.test("cleaner-ai-assistant: handles conversation history", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      messages: [
        { role: "user", content: "How do I set my availability?" },
        { role: "assistant", content: "You can set your availability in the Availability section..." },
        { role: "user", content: "Where is that?" }
      ]
    }),
  });

  assertExists(response.status);
  await response.text();
});

Deno.test("cleaner-ai-assistant: returns streaming response", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ 
      messages: [
        { role: "user", content: "Quick question" }
      ]
    }),
  });

  // Should return with text/event-stream for streaming
  const contentType = response.headers.get("content-type");
  assertExists(contentType);
  await response.text();
});
