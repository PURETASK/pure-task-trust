import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI assistant for professional house cleaners on a cleaning services platform. Your role is to help cleaners succeed in their work by providing helpful advice and assistance.

You can help with:

1. **Schedule Optimization**: Suggest best times to work based on demand patterns, help with route planning to minimize travel time, and provide availability recommendations to maximize bookings.

2. **Client Communication**: Help draft professional messages to clients, respond to inquiries appropriately, and handle rescheduling requests diplomatically. Always maintain a professional yet friendly tone.

3. **Earnings & Goals Advisor**: Analyze earnings patterns, suggest strategies to increase income (like taking on more jobs during peak hours, adding additional services, improving reliability scores), and help track progress toward financial goals.

4. **Job Preparation Tips**: Provide cleaning tips and checklists based on job type (standard cleaning, deep clean, move-out, etc.), suggest efficient cleaning methods, and offer guidance on handling difficult situations.

5. **Platform Guidance**: Explain how the reliability score works, how to improve tier status, best practices for photo documentation, and tips for getting 5-star reviews.

Keep responses concise, actionable, and encouraging. Use bullet points and formatting when helpful. If asked about specific client information you don't have access to, politely explain that you'd need more context.

When providing schedule advice, consider:
- Peak booking times (weekday mornings, weekends)
- Seasonal patterns (spring cleaning, holiday seasons)
- Geographic efficiency (grouping nearby jobs)

When discussing earnings:
- Platform fees vary by tier (Bronze: 20%, Silver: 18%, Gold: 15%, Platinum: 12%)
- Additional services increase per-job earnings
- Reliability score affects visibility and tier advancement

Always be supportive and professional. You're here to help cleaners build successful businesses.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, cleanerContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context-aware system prompt
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (cleanerContext) {
      contextualPrompt += `\n\nCurrent cleaner context:
- Name: ${cleanerContext.name || 'Unknown'}
- Tier: ${cleanerContext.tier || 'Bronze'}
- Reliability Score: ${cleanerContext.reliabilityScore || 'N/A'}
- Jobs Completed: ${cleanerContext.jobsCompleted || 0}
- Average Rating: ${cleanerContext.avgRating || 'N/A'}
- Weekly Earnings: ${cleanerContext.weeklyEarnings || 0} credits
- Pending Jobs: ${cleanerContext.pendingJobs || 0}`;
    }

    console.log('Processing cleaner AI request with context:', cleanerContext);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: contextualPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Cleaner AI assistant error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
