import { useMemo } from "react";
import { isToday, isTomorrow, differenceInHours } from "date-fns";
import { useClientJobs, type JobWithDetails } from "@/hooks/useJob";
import { useWallet } from "@/hooks/useWallet";
import { useMessageThreads } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";

export type HeroState =
  | "empty"
  | "future"
  | "urgent"
  | "needs_topup"
  | "on_the_way"
  | "in_progress"
  | "awaiting_approval";

export interface ClientHomeData {
  // Hero
  heroState: HeroState;
  heroJob: JobWithDetails | null;
  // Wallet
  availableBalance: number;
  heldBalance: number;
  walletState: "normal" | "low_balance" | "payment_issue";
  // Messages
  unreadCount: number;
  recentThreads: Array<{
    id: string;
    otherPartyName: string;
    lastMessagePreview: string;
    timestamp: string;
    unread: boolean;
  }>;
  // Alerts
  alerts: Alert[];
  // Rebook
  rebookCandidates: JobWithDetails[];
  // Flags
  isNewUser: boolean;
  isLoading: boolean;
}

export interface Alert {
  id: string;
  type: "approval" | "payment" | "reschedule" | "message" | "wallet" | "review";
  priority: number;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  timestamp?: string;
}

const LOW_BALANCE_THRESHOLD = 50;

export function useClientHome(): ClientHomeData {
  const { user } = useAuth();
  const { data: jobs, isLoading: jobsLoading } = useClientJobs();
  const { account, isLoadingAccount } = useWallet();
  const { data: threads, isLoading: threadsLoading } = useMessageThreads();

  const availableBalance = account?.current_balance ?? 0;
  const heldBalance = account?.held_balance ?? 0;

  // Determine hero state and job
  const { heroState, heroJob } = useMemo(() => {
    if (!jobs?.length) return { heroState: "empty" as HeroState, heroJob: null };

    // Highest priority: awaiting approval
    const awaitingApproval = jobs.find(
      (j) => j.status === "completed" && j.final_charge_credits == null
    );
    if (awaitingApproval) return { heroState: "awaiting_approval" as HeroState, heroJob: awaitingApproval };

    // In progress
    const inProgress = jobs.find((j) => j.status === "in_progress");
    if (inProgress) return { heroState: "in_progress" as HeroState, heroJob: inProgress };

    // On the way (confirmed + today + within 1 hour)
    const onTheWay = jobs.find((j) => {
      if (j.status !== "confirmed" || !j.scheduled_start_at) return false;
      const start = new Date(j.scheduled_start_at);
      return isToday(start) && differenceInHours(start, new Date()) <= 1;
    });
    if (onTheWay) return { heroState: "on_the_way" as HeroState, heroJob: onTheWay };

    // Upcoming jobs
    const upcoming = jobs
      .filter((j) => ["created", "pending", "confirmed"].includes(j.status))
      .sort((a, b) => {
        const aTime = a.scheduled_start_at ? new Date(a.scheduled_start_at).getTime() : Infinity;
        const bTime = b.scheduled_start_at ? new Date(b.scheduled_start_at).getTime() : Infinity;
        return aTime - bTime;
      });

    const nextJob = upcoming[0];
    if (!nextJob) return { heroState: "empty" as HeroState, heroJob: null };

    // Check if balance is too low for upcoming job
    const escrow = nextJob.escrow_credits_reserved ?? 0;
    if (escrow > 0 && availableBalance < escrow) {
      return { heroState: "needs_topup" as HeroState, heroJob: nextJob };
    }

    // Urgent if within 24 hours
    if (nextJob.scheduled_start_at) {
      const hoursUntil = differenceInHours(new Date(nextJob.scheduled_start_at), new Date());
      if (hoursUntil <= 24) return { heroState: "urgent" as HeroState, heroJob: nextJob };
    }

    return { heroState: "future" as HeroState, heroJob: nextJob };
  }, [jobs, availableBalance]);

  // Wallet state
  const walletState = useMemo(() => {
    if (availableBalance <= 0 && heldBalance > 0) return "payment_issue" as const;
    if (availableBalance < LOW_BALANCE_THRESHOLD) return "low_balance" as const;
    return "normal" as const;
  }, [availableBalance, heldBalance]);

  // Recent message threads (active bookings only)
  const { unreadCount, recentThreads } = useMemo(() => {
    if (!threads?.length) return { unreadCount: 0, recentThreads: [] };

    const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

    const recent = threads.slice(0, 3).map((t) => ({
      id: t.id,
      otherPartyName: t.otherParty
        ? `${t.otherParty.first_name || ""} ${t.otherParty.last_name || ""}`.trim() || "Cleaner"
        : "Cleaner",
      lastMessagePreview: t.lastMessage?.body?.slice(0, 80) || "No messages yet",
      timestamp: t.lastMessage?.created_at || t.updated_at,
      unread: (t.unreadCount || 0) > 0,
    }));

    return { unreadCount: totalUnread, recentThreads: recent };
  }, [threads]);

  // Alerts (prioritized, max 5)
  const alerts = useMemo(() => {
    const items: Alert[] = [];

    // 1. Approval needed
    const awaitingApprovalJobs = jobs?.filter(
      (j) => j.status === "completed" && j.final_charge_credits == null
    ) ?? [];
    awaitingApprovalJobs.forEach((job) => {
      items.push({
        id: `approval-${job.id}`,
        type: "approval",
        priority: 1,
        title: "Job awaiting approval",
        description: "Review photos and release payment.",
        actionLabel: "Review",
        actionHref: `/booking/${job.id}`,
        timestamp: job.updated_at ?? undefined,
      });
    });

    // 2. Payment/wallet warnings
    if (walletState === "payment_issue") {
      items.push({
        id: "payment-issue",
        type: "payment",
        priority: 1,
        title: "Payment issue",
        description: "Your last payment failed. Update your payment method.",
        actionLabel: "Fix",
        actionHref: "/wallet",
      });
    } else if (walletState === "low_balance") {
      items.push({
        id: "low-balance",
        type: "wallet",
        priority: 4,
        title: "Low balance",
        description: "Top up to avoid booking interruptions.",
        actionLabel: "Top Up",
        actionHref: "/wallet",
      });
    }

    // 3. Unread messages
    if (unreadCount > 0) {
      items.push({
        id: "unread-messages",
        type: "message",
        priority: 3,
        title: `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`,
        description: "You have messages from your cleaner.",
        actionLabel: "View",
        actionHref: "/messages",
      });
    }

    return items.sort((a, b) => a.priority - b.priority).slice(0, 5);
  }, [jobs, walletState, unreadCount]);

  // Rebook candidates (last 3 completed jobs with cleaners)
  const rebookCandidates = useMemo(() => {
    if (!jobs?.length) return [];
    const completed = jobs.filter(
      (j) => j.status === "completed" && j.cleaner_id && j.cleaner
    );
    const seen = new Set<string>();
    return completed
      .filter((j) => {
        if (!j.cleaner_id || seen.has(j.cleaner_id)) return false;
        seen.add(j.cleaner_id);
        return true;
      })
      .slice(0, 3);
  }, [jobs]);

  // New user detection
  const isNewUser = useMemo(() => {
    if (jobsLoading) return false;
    return !jobs?.length;
  }, [jobs, jobsLoading]);

  return {
    heroState,
    heroJob,
    availableBalance,
    heldBalance,
    walletState,
    unreadCount,
    recentThreads,
    alerts,
    rebookCandidates,
    isNewUser,
    isLoading: jobsLoading || isLoadingAccount,
  };
}
