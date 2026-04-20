/**
 * Dev-only auth/role bypass system.
 *
 * Allows the project owner to preview ANY page without being redirected
 * by RequireAuth / RequireSetup / role guards.
 *
 * Activation requires BOTH:
 *   1. Running on localhost or *.lovableproject.com / *.lovable.app preview
 *   2. The logged-in user's email is in OWNER_EMAILS  (OR no user is logged in
 *      AND the URL has ?devPreview=1 — useful for previewing public/auth pages)
 *
 * State is stored in localStorage so it survives reloads.
 * Completely stripped from real production (puretask.co) builds at runtime.
 */

import { UserRole } from '@/contexts/AuthContext';

// ⬇️  EDIT THIS LIST with your owner email(s)
export const OWNER_EMAILS = [
  // add your email(s) here, e.g. 'you@example.com'
];

const STORAGE_KEY = 'puretask_dev_bypass_v1';
const URL_FLAG = 'devPreview';

export interface DevBypassState {
  enabled: boolean;
  /** Pretend to be this role for guard checks. null = use real role */
  roleOverride: UserRole | null;
  /** Skip RequireSetup redirect */
  skipSetup: boolean;
  /** Skip cleaner onboarding redirect */
  skipOnboarding: boolean;
  /** Skip role-selection redirect */
  skipRoleSelection: boolean;
  /** Skip wrong-role redirects (allow viewing any role's pages) */
  skipRoleGuard: boolean;
}

const DEFAULT_STATE: DevBypassState = {
  enabled: false,
  roleOverride: null,
  skipSetup: true,
  skipOnboarding: true,
  skipRoleSelection: true,
  skipRoleGuard: true,
};

/** Is the current host a dev/preview environment? */
export function isPreviewHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h.endsWith('.lovableproject.com') ||
    h.endsWith('.lovable.app') ||
    h.endsWith('.lovable.dev')
  );
}

/** Is the given email an authorized owner? */
export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}

/** Read bypass state from localStorage */
export function readBypassState(): DevBypassState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

/** Persist bypass state */
export function writeBypassState(state: DevBypassState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('puretask:dev-bypass-changed'));
  } catch {
    /* noop */
  }
}

/** URL has ?devPreview=1 */
export function hasUrlFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(URL_FLAG) === '1';
}
