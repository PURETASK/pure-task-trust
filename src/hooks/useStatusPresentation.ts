/**
 * Wave 2 / Primitive #8 — useStatusPresentation()
 * ----------------------------------------------------------------------------
 * Single source of truth for mapping a `job_status` enum value to its UI
 * presentation: label, tone (semantic color group), pill className, badge
 * variant, and an optional emoji/icon hint.
 *
 * Why this exists (P0s retired):
 *   - 6+ pages duplicate a `statusMap` object with subtle drift
 *     (`'Pending'` vs `'Awaiting cleaner'` vs `'Created'` for the same
 *     status).
 *   - Color choices for `in_progress` differ across surfaces (success on
 *     one page, primary on another, accent in admin).
 *   - When a new status is introduced server-side, only some pages got
 *     updated → unknown statuses rendered as raw enum strings.
 *
 * Output is a `StatusPresentation` object — pages choose which fields to
 * render. The `tone` triplet (`bg`, `text`, `border`) uses semantic tokens
 * only (no raw color literals).
 */
import { useMemo } from 'react';

export type JobStatusKey =
  | 'created' | 'pending' | 'confirmed'
  | 'on_way' | 'arrived'
  | 'in_progress' | 'completed'
  | 'cancelled' | 'disputed' | 'no_show'
  | (string & {});

export type StatusTone =
  | 'neutral' | 'info' | 'primary' | 'success' | 'warning' | 'destructive';

export interface StatusPresentation {
  /** Raw enum (passthrough). */
  status: string;
  /** Title-cased human label. */
  label: string;
  /** Semantic tone bucket. */
  tone: StatusTone;
  /** Tailwind classes for a pill chip (semantic tokens only). */
  pillClass: string;
  /** shadcn Badge `variant` prop value. */
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  /** Brand "palette-pill-*" class for the pages using the palette helper. */
  palettePillClass: string;
  /** Optional emoji hint. Empty string when none. */
  emoji: string;
  /** True when the status is terminal (no further transitions in product flow). */
  isTerminal: boolean;
  /** True when work is actively happening. */
  isActive: boolean;
  /** True when escrow / approval phase is open. */
  isReviewable: boolean;
}

const TABLE: Record<string, Omit<StatusPresentation, 'status'>> = {
  created:     { label: 'Pending',       tone: 'warning', pillClass: 'bg-warning/10 text-warning border border-warning/30',         badgeVariant: 'outline',     palettePillClass: 'palette-pill-amber', emoji: '⏳', isTerminal: false, isActive: false, isReviewable: false },
  pending:     { label: 'Pending',       tone: 'warning', pillClass: 'bg-warning/10 text-warning border border-warning/30',         badgeVariant: 'outline',     palettePillClass: 'palette-pill-amber', emoji: '⏳', isTerminal: false, isActive: false, isReviewable: false },
  confirmed:   { label: 'Confirmed',     tone: 'primary', pillClass: 'bg-primary/10 text-primary border border-primary/30',         badgeVariant: 'default',     palettePillClass: 'palette-pill-blue',  emoji: '✅', isTerminal: false, isActive: false, isReviewable: false },
  on_way:      { label: 'On the Way',    tone: 'primary', pillClass: 'bg-primary/10 text-primary border border-primary/30',         badgeVariant: 'default',     palettePillClass: 'palette-pill-blue',  emoji: '🚗', isTerminal: false, isActive: true,  isReviewable: false },
  arrived:     { label: 'Arrived',       tone: 'info',    pillClass: 'bg-accent/10 text-accent-foreground border border-accent/30', badgeVariant: 'secondary',   palettePillClass: 'palette-pill-blue',  emoji: '📍', isTerminal: false, isActive: true,  isReviewable: false },
  in_progress: { label: 'In Progress',   tone: 'success', pillClass: 'bg-success/10 text-success border border-success/30',         badgeVariant: 'success',     palettePillClass: 'palette-pill-green', emoji: '🧹', isTerminal: false, isActive: true,  isReviewable: true  },
  completed:   { label: 'Completed',     tone: 'success', pillClass: 'bg-success/10 text-success border border-success/30',         badgeVariant: 'success',     palettePillClass: 'palette-pill-green', emoji: '✨', isTerminal: false, isActive: false, isReviewable: true  },
  cancelled:   { label: 'Cancelled',     tone: 'destructive', pillClass: 'bg-destructive/10 text-destructive border border-destructive/30', badgeVariant: 'destructive', palettePillClass: 'palette-pill-amber', emoji: '🚫', isTerminal: true,  isActive: false, isReviewable: false },
  disputed:    { label: 'Disputed',      tone: 'warning', pillClass: 'bg-warning/10 text-warning border border-warning/30',         badgeVariant: 'outline',     palettePillClass: 'palette-pill-amber', emoji: '⚠️', isTerminal: false, isActive: false, isReviewable: true  },
  no_show:     { label: 'No Show',       tone: 'destructive', pillClass: 'bg-destructive/10 text-destructive border border-destructive/30', badgeVariant: 'destructive', palettePillClass: 'palette-pill-amber', emoji: '👻', isTerminal: true,  isActive: false, isReviewable: false },
};

function fallback(status: string): Omit<StatusPresentation, 'status'> {
  const label = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    || 'Unknown';
  return {
    label,
    tone: 'neutral',
    pillClass: 'bg-muted text-muted-foreground border border-border/40',
    badgeVariant: 'secondary',
    palettePillClass: 'palette-pill-blue',
    emoji: '',
    isTerminal: false,
    isActive: false,
    isReviewable: false,
  };
}

export function getStatusPresentation(status?: string | null): StatusPresentation {
  const s = (status ?? '').toLowerCase();
  const entry = TABLE[s] ?? fallback(s);
  return { status: s, ...entry };
}

export function useStatusPresentation(status?: string | null): StatusPresentation {
  return useMemo(() => getStatusPresentation(status), [status]);
}