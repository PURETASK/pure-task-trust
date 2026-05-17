// Single source of truth for the currently-published legal document versions.
// Bump these when you publish revised text so users are re-prompted to accept.
export const LEGAL_VERSIONS = {
  terms: "2026-05-17",
  privacy: "2026-05-17",
  cookies: "2026-05-17",
  acceptable_use: "2026-05-17",
} as const;

export type LegalDocType = keyof typeof LEGAL_VERSIONS;

export const LEGAL_DOC_LABELS: Record<LegalDocType, { label: string; href: string }> = {
  terms: { label: "Terms of Service", href: "/legal/terms" },
  privacy: { label: "Privacy Policy", href: "/legal/privacy" },
  cookies: { label: "Cookie Policy", href: "/legal/cookies" },
  acceptable_use: { label: "Acceptable Use Policy", href: "/legal/acceptable-use" },
};