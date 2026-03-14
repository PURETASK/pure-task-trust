import { useState, useCallback } from 'react';
import { useCleanerProfile, useCleanerJobs } from './useCleanerProfile';
import { useCleanerStats } from './useCleanerEarnings';
import { useReliabilityScore } from './useReliabilityScore';
import { useAvailabilityBlocks } from './useAvailability';
import { useCleanerReviews } from './useReviews';
import { useMarketplaceJobs } from './useMarketplaceJobs';
import { format, addDays, isAfter, isBefore } from 'date-fns';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleaner-ai-assistant`;

export function useCleanerAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { profile } = useCleanerProfile();
  const { stats } = useCleanerStats();
  const { jobs } = useCleanerJobs();
  const { score, scoreBreakdown, events } = useReliabilityScore(profile?.id);
  const { blocks: availability } = useAvailabilityBlocks();
  const { jobs: marketplaceJobs } = useMarketplaceJobs('all');
  const { data: reviews } = useCleanerReviews(profile?.id || '');

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    let assistantSoFar = '';
    
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      // Get upcoming jobs (next 7 days)
      const now = new Date();
      const sevenDaysFromNow = addDays(now, 7);
      const upcomingJobs = jobs
        .filter(job => {
          if (!job.scheduled_start_at) return false;
          const startDate = new Date(job.scheduled_start_at);
          return isAfter(startDate, now) && isBefore(startDate, sevenDaysFromNow) &&
            ['created', 'pending', 'confirmed', 'in_progress'].includes(job.status);
        })
        .slice(0, 10)
        .map(job => ({
          id: job.id,
          type: job.cleaning_type,
          date: job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'EEE MMM d, h:mm a') : 'TBD',
          status: job.status,
          estimatedHours: job.estimated_hours,
          credits: job.escrow_credits_reserved,
          clientName: job.client ? `${job.client.first_name || ''} ${job.client.last_name || ''}`.trim() : 'Unknown',
        }));

      // Get recent reliability events
      const recentEvents = (events || []).slice(0, 5).map(e => ({
        type: e.event_type,
        date: format(new Date(e.created_at), 'MMM d'),
        weight: e.weight,
      }));

      // Get availability summary
      const availabilitySummary = (availability || []).map(a => ({
        day: a.day_of_week,
        startTime: a.start_time,
        endTime: a.end_time,
        isBlocked: !a.is_active,
      }));

      // Get top marketplace opportunities
      const topOpportunities = (marketplaceJobs || []).slice(0, 5).map(job => ({
        type: job.cleaning_type,
        date: job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'EEE MMM d, h:mm a') : 'TBD',
        estimatedHours: job.estimated_hours,
        credits: job.escrow_credits_reserved,
      }));

      // Get recent reviews
      const recentReviews = (reviews || []).slice(0, 5).map(r => ({
        rating: r.rating,
        comment: r.review_text,
        date: format(new Date(r.created_at), 'MMM d'),
      }));

      // Build comprehensive cleaner context for the AI
      const cleanerContext = {
        // Basic profile
        name: profile?.first_name || 'Cleaner',
        tier: profile?.tier || 'bronze',
        hourlyRate: profile?.hourly_rate_credits || 0,
        bio: profile?.bio || null,
        
        // Performance metrics
        reliabilityScore: score?.current_score || profile?.reliability_score || 75,
        reliabilityBreakdown: scoreBreakdown,
        recentReliabilityEvents: recentEvents,
        jobsCompleted: profile?.jobs_completed || 0,
        avgRating: profile?.avg_rating || null,
        
        // Financial data
        weeklyEarnings: stats?.earnedThisWeek || 0,
        totalEarnings: stats?.totalEarned || 0,
        availableBalance: stats?.availableBalance || 0,
        pendingBalance: stats?.pendingBalance || 0,
        hoursThisWeek: stats?.hoursThisWeek || 0,
        
        // Job data
        totalJobs: stats?.totalJobs || 0,
        completedJobs: stats?.completedJobs || 0,
        jobsThisWeek: stats?.jobsThisWeek || 0,
        upcomingJobs: upcomingJobs,
        pendingJobsCount: jobs.filter(j => ['pending', 'created'].includes(j.status)).length,
        
        // Availability
        availabilityBlocks: availabilitySummary,
        
        // Reviews
        recentReviews: recentReviews,
        
        // Marketplace opportunities
        marketplaceOpportunities: topOpportunities,
      };

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          cleanerContext,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }

    } catch (err) {
      console.error('AI chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
      // Remove the user message if we failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, profile, stats, jobs, score, scoreBreakdown, events, availability, marketplaceJobs, reviews]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
