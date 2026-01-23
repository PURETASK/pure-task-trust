import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // First, verify the user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify their identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('[admin-workflows] Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has admin role using the service client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      console.error('[admin-workflows] User is not admin:', user.id, roleData?.role);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[admin-workflows] Admin ${user.email} executing action`);

    const body = await req.json();
    const { action, job_id, ...data } = body;

    console.log(`[admin-workflows] Action: ${action}, Job ID: ${job_id}`);

    // Validate action
    const validActions = ['reschedule', 'reassign', 'cancel', 'refund'];
    if (!action || !validActions.includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate job_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!job_id || !uuidRegex.test(job_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid job_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      console.error('[admin-workflows] Job not found:', jobError);
      return new Response(
        JSON.stringify({ success: false, error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      case 'reschedule': {
        const { new_date, new_time, reason } = data;
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!new_date || !dateRegex.test(new_date)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate time format (HH:MM)
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!new_time || !timeRegex.test(new_time)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid time format. Use HH:MM' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const newScheduledStart = new Date(`${new_date}T${new_time}`);
        
        // Validate date is valid and in the future
        if (isNaN(newScheduledStart.getTime())) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid date/time combination' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const now = new Date();
        if (newScheduledStart <= now) {
          return new Response(
            JSON.stringify({ success: false, error: 'Scheduled date must be in the future' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Limit to 90 days in the future
        const maxFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        if (newScheduledStart > maxFuture) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cannot schedule more than 90 days in advance' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Sanitize reason (max 500 chars)
        const sanitizedReason = reason ? String(reason).slice(0, 500) : 'No reason provided';

        const estimatedHours = job.estimated_hours || 2;
        const newScheduledEnd = new Date(newScheduledStart.getTime() + estimatedHours * 60 * 60 * 1000);

        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            scheduled_start_at: newScheduledStart.toISOString(),
            scheduled_end_at: newScheduledEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job_id);

        if (updateError) {
          console.error('[admin-workflows] Reschedule error:', updateError);
          throw updateError;
        }

        // Log the action
        await supabase.from('job_status_history').insert({
          job_id,
          from_status: job.status,
          to_status: job.status,
          reason: `Admin reschedule: ${sanitizedReason}`,
          changed_by_type: 'admin'
        });

        console.log(`[admin-workflows] Job ${job_id} rescheduled to ${new_date} ${new_time}`);
        result = { success: true, message: `Booking rescheduled to ${new_date} at ${new_time}` };
        break;
      }

      case 'reassign': {
        const { new_cleaner_id, reason } = data;

        if (!new_cleaner_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing new_cleaner_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify new cleaner exists
        const { data: cleaner, error: cleanerError } = await supabase
          .from('cleaner_profiles')
          .select('id, first_name, last_name')
          .eq('id', new_cleaner_id)
          .single();

        if (cleanerError || !cleaner) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cleaner not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const oldCleanerId = job.cleaner_id;

        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            cleaner_id: new_cleaner_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', job_id);

        if (updateError) {
          console.error('[admin-workflows] Reassign error:', updateError);
          throw updateError;
        }

        // Log the action
        await supabase.from('job_status_history').insert({
          job_id,
          from_status: job.status,
          to_status: job.status,
          reason: `Admin reassign from ${oldCleanerId} to ${new_cleaner_id}: ${reason || 'No reason provided'}`,
          changed_by_type: 'admin'
        });

        console.log(`[admin-workflows] Job ${job_id} reassigned to cleaner ${new_cleaner_id}`);
        result = { success: true, message: `Booking reassigned to ${cleaner.first_name} ${cleaner.last_name}` };
        break;
      }

      case 'cancel': {
        const { reason } = data;

        if (!reason) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing cancellation reason' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job_id);

        if (updateError) {
          console.error('[admin-workflows] Cancel error:', updateError);
          throw updateError;
        }

        // Log the action
        await supabase.from('job_status_history').insert({
          job_id,
          from_status: job.status,
          to_status: 'cancelled',
          reason: `Admin cancellation: ${reason}`,
          changed_by_type: 'admin'
        });

        // Refund credits to client if job was paid
        if (job.credit_charge_credits && job.credit_charge_credits > 0) {
          const { error: refundError } = await supabase.from('credit_ledger').insert({
            user_id: job.client_id,
            delta_credits: job.credit_charge_credits,
            reason: 'refund',
            job_id
          });

          if (refundError) {
            console.error('[admin-workflows] Refund ledger error:', refundError);
          }
        }

        console.log(`[admin-workflows] Job ${job_id} cancelled`);
        result = { success: true, message: 'Booking cancelled and credits refunded' };
        break;
      }

      case 'refund': {
        const { refund_amount, reason } = data;

        if (!refund_amount || !reason) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing refund_amount or reason' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const amount = parseInt(refund_amount);
        if (isNaN(amount) || amount <= 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid refund amount' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update job refund credits
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            refund_credits: (job.refund_credits || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', job_id);

        if (updateError) {
          console.error('[admin-workflows] Refund update error:', updateError);
          throw updateError;
        }

        // Add to credit ledger
        const { error: ledgerError } = await supabase.from('credit_ledger').insert({
          user_id: job.client_id,
          delta_credits: amount,
          reason: 'refund',
          job_id
        });

        if (ledgerError) {
          console.error('[admin-workflows] Refund ledger error:', ledgerError);
        }

        // Log the action
        await supabase.from('job_status_history').insert({
          job_id,
          from_status: job.status,
          to_status: job.status,
          reason: `Admin refund of ${amount} credits: ${reason}`,
          changed_by_type: 'admin'
        });

        console.log(`[admin-workflows] Refunded ${amount} credits for job ${job_id}`);
        result = { success: true, message: `Refunded ${amount} credits to client` };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[admin-workflows] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
