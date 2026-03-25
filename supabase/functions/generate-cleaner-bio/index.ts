import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function calculateBioScore(data: {
  years_experience: number;
  jobs_completed: number;
  avg_rating: number;
  specialties: string[];
  on_time_rate: number;
  work_style: string[];
  personality: string[];
}): number {
  let score = 0;
  if (data.years_experience >= 1) score += 15;
  if (data.jobs_completed > 10) score += 15;
  if (data.avg_rating >= 4.5) score += 15;
  if (data.specialties.length >= 2) score += 15;
  if (data.on_time_rate >= 90) score += 20;
  if (data.work_style.length >= 1) score += 10;
  if (data.personality.length >= 1) score += 10;
  return Math.min(100, score);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const body = await req.json();
    const {
      years_experience = 0,
      cleaning_types = [],
      specialties = [],
      jobs_completed = 0,
      avg_rating = 0,
      on_time_rate = 0,
      supplies_provided = false,
      has_vehicle = false,
      pet_friendly = false,
      languages = ["English"],
      work_style = [],
      personality = [],
    } = body;

    const bioScore = calculateBioScore({ years_experience, jobs_completed, avg_rating, specialties, on_time_rate, work_style, personality });

    const prompt = `You are generating a high-converting cleaner profile bio for a home service marketplace.

GOALS: Maximize trust, be clear and concise, highlight reliability and professionalism, sound natural and human.

RULES:
- Keep under 120 words total
- Use exactly these 6 short labeled sections with emojis
- No fluff or generic phrases
- Emphasize experience, results, and process

INPUT DATA:
- Years of experience: ${years_experience}
- Cleaning types: ${cleaning_types.join(", ") || "general cleaning"}
- Specialties: ${specialties.join(", ") || "general"}
- Jobs completed: ${jobs_completed}
- Average rating: ${avg_rating > 0 ? avg_rating.toFixed(1) + "★" : "New cleaner"}
- On-time rate: ${on_time_rate > 0 ? on_time_rate + "%" : "building track record"}
- Brings own supplies: ${supplies_provided ? "Yes" : "No"}
- Has vehicle: ${has_vehicle ? "Yes" : "No"}
- Pet friendly: ${pet_friendly ? "Yes" : "No"}
- Languages: ${languages.join(", ")}
- Work style: ${work_style.join(", ") || "professional"}
- Personality: ${personality.join(", ") || "friendly"}

OUTPUT FORMAT (use exactly this):
🧼 Experience:
[1-2 sentences]

⭐ Track Record:
[1 sentence with numbers]

✨ What I Do Best:
[1 sentence]

🕒 Reliability:
[1 sentence]

📸 My Process:
[1 sentence]

💬 Communication:
[1 sentence]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You write concise, high-converting cleaner bios. Always follow the exact output format requested." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error ${aiResponse.status}: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const generatedBio = aiData.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ bio: generatedBio, bio_score: bioScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-cleaner-bio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
