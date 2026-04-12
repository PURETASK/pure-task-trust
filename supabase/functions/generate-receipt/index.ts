// @ts-nocheck - edge function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { type, jobId, transactionId } = await req.json();

    let receiptData: Record<string, unknown> = {};

    if (type === 'job_completion' && jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('*, cleaner:cleaner_profiles!jobs_cleaner_id_fkey(first_name, last_name), client:client_profiles!jobs_client_id_fkey(first_name, last_name)')
        .eq('id', jobId)
        .single();

      if (!job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      receiptData = {
        receiptNumber: `PT-JOB-${job.id.slice(0, 8).toUpperCase()}`,
        date: new Date(job.check_out_at || job.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        type: 'Job Completion',
        clientName: `${job.client?.first_name || ''} ${job.client?.last_name || ''}`.trim(),
        cleanerName: `${job.cleaner?.first_name || ''} ${job.cleaner?.last_name || ''}`.trim(),
        cleaningType: job.cleaning_type?.replace('_', ' ') || 'Standard',
        hours: job.estimated_hours || 0,
        actualMinutes: job.actual_minutes || null,
        totalCredits: job.escrow_credits_reserved || 0,
        finalCharge: job.final_charge_credits || job.escrow_credits_reserved || 0,
        status: job.status,
      };
    } else if (type === 'credit_purchase' && transactionId) {
      const { data: ledger } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!ledger) {
        return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      receiptData = {
        receiptNumber: `PT-CR-${ledger.id.slice(0, 8).toUpperCase()}`,
        date: new Date(ledger.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        type: 'Credit Purchase',
        customerName: profile?.full_name || user.email,
        customerEmail: profile?.email || user.email,
        credits: ledger.delta_credits,
        amount: `$${(ledger.delta_credits).toFixed(2)}`,
        reason: ledger.reason,
      };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid receipt type. Provide type and jobId or transactionId.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate a simple HTML receipt that can be printed/saved as PDF by the browser
    const html = generateReceiptHtml(receiptData);

    return new Response(JSON.stringify({ receipt: receiptData, html }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function generateReceiptHtml(data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .filter(([key]) => key !== 'type')
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      return `<tr><td style="padding:8px 16px;font-weight:600;color:#6b7280;border-bottom:1px solid #f3f4f6">${label}</td><td style="padding:8px 16px;border-bottom:1px solid #f3f4f6">${value}</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PureTask Receipt</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#1f2937">
  <div style="text-align:center;margin-bottom:32px">
    <h1 style="font-size:24px;color:#7c3aed;margin:0">PureTask</h1>
    <p style="color:#9ca3af;margin:4px 0 0">Receipt — ${data.type || 'Transaction'}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    ${rows}
  </table>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px">
    Thank you for using PureTask. This is an automatically generated receipt.<br>
    © ${new Date().getFullYear()} PureTask. All rights reserved.
  </p>
</body>
</html>`;
}
