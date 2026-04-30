import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatformConfig } from "./usePlatformConfig";

/**
 * useJobAuthorization — single source of truth for "what can this user do
 * with this job?" Replaces ad-hoc `status === 'X' && role === 'Y'` checks
 * scattered across CleaningDetail, BookingStatus, JobInProgress,
 * CleanerJobDetail, MyCleanings, JobApproval, etc.
 *
 * Rules (mirror the DB guard `guard_jobs_financial_writes` + product policy):
 *  - Cancel:        client owner, status in {created, pending, confirmed}
 *  - Reschedule:    client owner OR assigned cleaner, status in {pending, confirmed}
 *  - Start:         assigned cleaner, status === 'confirmed', within window
 *  - Complete:      assigned cleaner, status === 'in_progress', has check_in
 *  - Approve:       client owner, status in {in_progress, completed},
 *                   inside escrow review window (config-driven)
 *  - Dispute:       client owner OR assigned cleaner, status in
 *                   {in_progress, completed, disputed}, inside review window
 *  - Tip / Review:  client owner, status === 'completed' & approved
 *  - View Photos:   any party on the job
 */

type JobStatus =
  | "created" | "pending" | "confirmed"
  | "in_progress" | "completed"
  | "cancelled" | "disputed" | "no_show";

export interface JobAuthInput {
  id?: string;
  status?: JobStatus | string | null;
  /** client_profiles.user_id (NOT client_profiles.id) */
  client_user_id?: string | null;
  /** cleaner_profiles.user_id (NOT cleaner_profiles.id) */
  cleaner_user_id?: string | null;
  scheduled_start_at?: string | null;
  check_in_at?: string | null;
  check_out_at?: string | null;
  actual_end_at?: string | null;
  final_charge_credits?: number | null;
  approved_at?: string | null;
}

export interface JobAuthorization {
  /** Relationship */
  isClient: boolean;
  isCleaner: boolean;
  isParty: boolean;
  /** Action permissions */
  canCancel: boolean;
  canReschedule: boolean;
  canStart: boolean;
  canComplete: boolean;
  canApprove: boolean;
  canDispute: boolean;
  canTip: boolean;
  canReview: boolean;
  canViewPhotos: boolean;
  canRebook: boolean;
  /** Reasons (for tooltips / disabled-state copy) */
  reasons: Partial<Record<keyof Omit<JobAuthorization, "reasons" | "isClient" | "isCleaner" | "isParty">, string>>;
}

const TERMINAL: JobStatus[] = ["cancelled", "no_show"];

export function useJobAuthorization(job?: JobAuthInput | null): JobAuthorization {
  const { user } = useAuth();
  const { escrowReviewWindowHours } = usePlatformConfig();

  return useMemo(() => {
    const empty: JobAuthorization = {
      isClient: false, isCleaner: false, isParty: false,
      canCancel: false, canReschedule: false, canStart: false,
      canComplete: false, canApprove: false, canDispute: false,
      canTip: false, canReview: false, canViewPhotos: false, canRebook: false,
      reasons: {},
    };
    if (!user || !job) return empty;

    const status = (job.status ?? "") as JobStatus;
    const isClient = !!job.client_user_id && job.client_user_id === user.id;
    const isCleaner = !!job.cleaner_user_id && job.cleaner_user_id === user.id;
    const isParty = isClient || isCleaner;
    const reasons: JobAuthorization["reasons"] = {};

    const isTerminal = TERMINAL.includes(status);
    const approved = !!job.approved_at || (status === "completed" && (job.final_charge_credits ?? 0) > 0);

    // Escrow window: anchor on check_out_at -> actual_end_at -> scheduled_start_at
    const anchor =
      job.check_out_at || job.actual_end_at ||
      (status === "completed" ? job.scheduled_start_at : null);
    const windowMs = escrowReviewWindowHours * 60 * 60 * 1000;
    const inReviewWindow = anchor
      ? Date.now() - new Date(anchor).getTime() < windowMs
      : status === "in_progress";

    // Cancel
    const canCancel = isClient && ["created", "pending", "confirmed"].includes(status);
    if (!canCancel) {
      if (!isClient) reasons.canCancel = "Only the client can cancel";
      else if (isTerminal) reasons.canCancel = "Job already closed";
      else reasons.canCancel = "Job already started";
    }

    // Reschedule
    const canReschedule = isParty && ["pending", "confirmed"].includes(status);
    if (!canReschedule) reasons.canReschedule = isParty ? "Cannot reschedule once started" : "Not your job";

    // Start
    const canStart = isCleaner && status === "confirmed";
    if (!canStart) reasons.canStart = !isCleaner ? "Only the assigned cleaner can start" : `Cannot start from "${status}"`;

    // Complete
    const canComplete = isCleaner && status === "in_progress" && !!job.check_in_at;
    if (!canComplete) {
      if (!isCleaner) reasons.canComplete = "Only the assigned cleaner can complete";
      else if (status !== "in_progress") reasons.canComplete = "Start the job first";
      else if (!job.check_in_at) reasons.canComplete = "Check-in required before completing";
    }

    // Approve
    const canApprove = isClient && ["in_progress", "completed"].includes(status) && !approved && inReviewWindow;
    if (!canApprove) {
      if (!isClient) reasons.canApprove = "Only the client can approve";
      else if (approved) reasons.canApprove = "Already approved";
      else if (!inReviewWindow) reasons.canApprove = "Review window expired";
      else reasons.canApprove = "Job not ready for approval";
    }

    // Dispute
    const canDispute = isParty && ["in_progress", "completed", "disputed"].includes(status) && inReviewWindow;
    if (!canDispute) reasons.canDispute = inReviewWindow ? "Not eligible for dispute" : "Dispute window expired";

    // Tip / Review (client, post-approval)
    const canTip = isClient && status === "completed" && approved;
    if (!canTip) reasons.canTip = approved ? "Only the client can tip" : "Approve the job first";
    const canReview = canTip;
    if (!canReview) reasons.canReview = reasons.canTip;

    // Photos: any party
    const canViewPhotos = isParty;
    if (!canViewPhotos) reasons.canViewPhotos = "Not your job";

    // Rebook (client, after approval or terminal-without-fault)
    const canRebook = isClient && (approved || status === "cancelled" || status === "completed");
    if (!canRebook) reasons.canRebook = isClient ? "Job not ready to rebook" : "Only the client can rebook";

    return {
      isClient, isCleaner, isParty,
      canCancel, canReschedule, canStart, canComplete,
      canApprove, canDispute, canTip, canReview,
      canViewPhotos, canRebook,
      reasons,
    };
  }, [user, job, escrowReviewWindowHours]);
}

/** Static variant for non-React contexts (e.g. table row filtering). */
export function getJobAuthorization(
  job: JobAuthInput | null | undefined,
  userId: string | null | undefined,
  escrowReviewWindowHours = 24,
): Pick<JobAuthorization, "canCancel" | "canReschedule" | "canStart" | "canComplete" | "canApprove" | "canDispute"> {
  if (!job || !userId) {
    return { canCancel: false, canReschedule: false, canStart: false, canComplete: false, canApprove: false, canDispute: false };
  }
  const status = (job.status ?? "") as JobStatus;
  const isClient = job.client_user_id === userId;
  const isCleaner = job.cleaner_user_id === userId;
  const anchor = job.check_out_at || job.actual_end_at;
  const inReviewWindow = anchor
    ? Date.now() - new Date(anchor).getTime() < escrowReviewWindowHours * 3600_000
    : status === "in_progress";
  const approved = !!job.approved_at;
  return {
    canCancel: isClient && ["created", "pending", "confirmed"].includes(status),
    canReschedule: (isClient || isCleaner) && ["pending", "confirmed"].includes(status),
    canStart: isCleaner && status === "confirmed",
    canComplete: isCleaner && status === "in_progress" && !!job.check_in_at,
    canApprove: isClient && ["in_progress", "completed"].includes(status) && !approved && inReviewWindow,
    canDispute: (isClient || isCleaner) && ["in_progress", "completed", "disputed"].includes(status) && inReviewWindow,
  };
}