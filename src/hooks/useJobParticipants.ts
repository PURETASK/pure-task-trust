/**
 * Wave 2 / Primitive #7 — useJobParticipants()
 * ----------------------------------------------------------------------------
 * Single source of truth for "who is on this job?" — name stitching, avatar
 * fallbacks, initials, role-aware "you/them" labels.
 *
 * Why this exists (P0s retired):
 *   - 10+ files duplicate `${first_name} ${last_name}.trim() || 'Cleaner'`
 *     with subtle differences ('Cleaner' vs 'Your Cleaner' vs 'Assigned
 *     Cleaner' vs 'Finding cleaner…').
 *   - Avatar initial logic is repeated (`name.charAt(0)`) with no fallback
 *     for empty names → renders blank circles.
 *   - "Your" vs "Their" copy was decided ad-hoc per page; cleaner-side and
 *     client-side cards used different conventions.
 *
 * Inputs: a job-shaped object with optional `cleaner` and `client` joins
 *         (matches `JobWithDetails` from useJob).
 *
 * Output: a normalized `Participants` object with computed names, initials,
 *         and a `you`/`them` mapping based on the current auth user.
 */
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ParticipantInput {
  cleaner?: {
    id?: string | null;
    user_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
  client?: {
    id?: string | null;
    user_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
  cleaner_id?: string | null;
  client_id?: string | null;
}

export interface Participant {
  /** True when the join row is present (i.e. assigned & resolvable). */
  isAssigned: boolean;
  /** Profile id (cleaner_profiles.id or client_profiles.id). */
  profileId: string | null;
  /** Auth user id. */
  userId: string | null;
  /** First name only, falls back to role default. */
  firstName: string;
  /** Full name, falls back to role default. */
  fullName: string;
  /** Single-letter initial, never empty (defaults to role letter). */
  initial: string;
  /** Two-letter initials when last name available, else just `initial`. */
  initials: string;
  /** Optional avatar url. */
  avatarUrl: string | null;
}

export interface JobParticipants {
  cleaner: Participant;
  client: Participant;
  /** The current auth user, mapped to whichever side they are on. */
  you: Participant | null;
  /** The other party from the current user's perspective. */
  them: Participant | null;
  /** "client" | "cleaner" | null when viewer isn't a party. */
  viewerRole: 'client' | 'cleaner' | null;
}

function pick(name?: string | null): string {
  const s = (name ?? '').trim();
  return s;
}

function buildParticipant(
  party: ParticipantInput['cleaner'] | ParticipantInput['client'],
  fallbackId: string | null | undefined,
  defaults: { firstName: string; fullName: string; initial: string },
): Participant {
  const isAssigned = !!party || !!fallbackId;
  const first = pick(party?.first_name);
  const last = pick(party?.last_name);
  const fullName = `${first} ${last}`.trim();
  const firstName = first || defaults.firstName;
  const resolvedFull = fullName || defaults.fullName;
  const initial = (first || defaults.initial).charAt(0).toUpperCase() || defaults.initial;
  const initials = (first.charAt(0) + last.charAt(0)).toUpperCase() || initial;
  return {
    isAssigned,
    profileId: party?.id ?? fallbackId ?? null,
    userId: party?.user_id ?? null,
    firstName,
    fullName: resolvedFull,
    initial,
    initials,
    avatarUrl: party?.avatar_url ?? null,
  };
}

export function useJobParticipants(job?: ParticipantInput | null): JobParticipants {
  const { user } = useAuth();

  return useMemo(() => {
    const cleaner = buildParticipant(
      job?.cleaner,
      job?.cleaner_id,
      { firstName: 'Cleaner', fullName: job?.cleaner_id ? 'Your Cleaner' : 'Finding cleaner…', initial: 'C' },
    );
    const client = buildParticipant(
      job?.client,
      job?.client_id,
      { firstName: 'Client', fullName: 'Client', initial: 'C' },
    );

    let viewerRole: 'client' | 'cleaner' | null = null;
    if (user?.id) {
      if (cleaner.userId === user.id) viewerRole = 'cleaner';
      else if (client.userId === user.id) viewerRole = 'client';
    }

    const you = viewerRole === 'cleaner' ? cleaner : viewerRole === 'client' ? client : null;
    const them = viewerRole === 'cleaner' ? client : viewerRole === 'client' ? cleaner : null;

    return { cleaner, client, you, them, viewerRole };
  }, [job, user?.id]);
}

/** Static variant for non-React (table rows, CSV export). */
export function getJobParticipants(job?: ParticipantInput | null): Pick<JobParticipants, 'cleaner' | 'client'> {
  const cleaner = buildParticipant(
    job?.cleaner,
    job?.cleaner_id,
    { firstName: 'Cleaner', fullName: job?.cleaner_id ? 'Your Cleaner' : 'Finding cleaner…', initial: 'C' },
  );
  const client = buildParticipant(
    job?.client,
    job?.client_id,
    { firstName: 'Client', fullName: 'Client', initial: 'C' },
  );
  return { cleaner, client };
}