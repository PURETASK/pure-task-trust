# Support Center Redesign — Comprehensive Build Guide

A complete sequenced plan to ship the AI-first, role-aware Support Center. Split into **6 batches**. Each batch is independently shippable, ends with a testable surface, and unblocks the next.

---

## 🗂️ Batch Overview

| # | Batch | Scope | Risk | DB? |
|---|-------|-------|------|-----|
| 1 | **Foundation** | DB schema + RLS + seed articles | Low | ✅ |
| 2 | **AI Backbone** | `support-ai-chat` edge fn + `AISupportChat` component | Medium | — |
| 3 | **Ticket System** | Threaded messages + escalation + realtime | Medium | — |
| 4 | **Hub & Browse** | `SupportHub` page + `TopicGrid` + `ArticleReader` | Low | — |
| 5 | **Contextual Layer** | `FloatingHelpLauncher` + `HelpContext` + `MainLayout` mount | Low | — |
| 6 | **Notifications & Polish** | Unread badges, `NotificationBell`/`MobileBottomNav`, `notify-ticket-reply`, QA | Low | — |

---

## 🧱 BATCH 1 — Foundation (Database + Seed Data)

**Goal:** All tables, columns, RLS, and starter content exist. Nothing user-visible yet.

### 1.1 New tables

**`help_articles`**
- Cols: `id`, `slug` (unique), `title`, `body_md`, `category`, `role` (`client`|`cleaner`|`both`), `tags text[]`, `view_count`, `helpful_count`, `not_helpful_count`, `is_published bool default true`, timestamps.
- RLS: public SELECT where `is_published=true`; admin write via `has_role('admin')`.

**`ticket_messages`**
- Cols: `id`, `ticket_id` (fk → `support_tickets`), `sender_id`, `sender_role` (`user`|`agent`|`ai`|`system`), `body`, `attachments jsonb default '[]'`, `created_at`.
- RLS: ticket owner SELECT/INSERT; admin all.
- Index: `(ticket_id, created_at)`.

**`support_conversations`** (AI chat sessions)
- Cols: `id`, `user_id`, `messages jsonb default '[]'`, `resolved bool default false`, `escalated_ticket_id uuid null`, timestamps.
- RLS: owner only; admin read.

### 1.2 Extend `support_tickets`
Add: `last_agent_reply_at timestamptz`, `unread_by_user bool default false`, `ai_transcript_id uuid null`, `category text`, `attachments jsonb default '[]'`.

### 1.3 Realtime
`ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;`

### 1.4 Seed ~20 starter articles
- **Bookings (4):** How to book, Reschedule, Cancel a booking, Same-day rules
- **Payments (4):** Buying credits, Refunds, Escrow & 24h review, Tipping
- **Cleaners (3):** Choosing a cleaner, No-show policy, Reliability score
- **Account (2):** Edit profile, Delete account
- **Cleaner-only (4):** Getting paid, Reliability for cleaners, Tier benefits, Cancellation for cleaners
- **General (3):** What is PureTask, Trust & safety, Contact support

**Exit:** Migration applied, articles queryable, RLS verified, no linter warnings.

---

## 🤖 BATCH 2 — AI Backbone

**Goal:** Working streaming AI chat that answers from policies + articles, grounded in the user's own data.

### 2.1 Edge function `support-ai-chat`
- Streaming SSE via Lovable AI Gateway, default model `google/gemini-3-flash-preview`.
- System prompt embeds: cancellation tiers, escrow rules, reliability scoring, credit pricing, role-aware tone.
- Tools (function calling):
  - `search_help_articles({ query, role })` → top 3 matches.
  - `lookup_user_booking({ status? })` → recent jobs for caller.
  - `lookup_wallet_balance()` → credits.
  - `escalate_to_ticket({ category, summary })` → returns `ticket_id`.
- JWT-validated; uses caller's `user_id` for personalized tools.
- Persists conversation to `support_conversations`.

### 2.2 Component `AISupportChat.tsx`
- Token-by-token SSE rendering.
- Markdown via `react-markdown`.
- Suggested-prompt chips ("Cancel my booking", "Refund", "No-show").
- "Talk to a human" button → escalate → routes to `/help/tickets/:id`.
- Handles 402/429 with toasts.

### 2.3 Component `HelpContext.tsx` (provider stub)
- Lightweight provider exposing `{ currentRoute, currentJobId?, currentBookingId? }`.
- Used later by `FloatingHelpLauncher`; introduced now so AI chat can receive context.

**Exit:** User can chat at a temp `/help` mount, get streamed answers grounded in articles, escalate.

---

## 🎫 BATCH 3 — Ticket System

**Goal:** End-to-end threaded conversation between user and admin (admin replies via DB for v1).

### 3.1 Edge function `escalate-conversation`
- Input: `conversation_id`, `category`, `summary`.
- Creates `support_tickets` with `ai_transcript_id`, copies AI transcript into `ticket_messages` (system + user + ai), links via `support_conversations.escalated_ticket_id`.
- Returns `ticket_id`.

### 3.2 Components
- **`TicketList.tsx`** — cards of user's tickets, status, unread dot if `unread_by_user`.
- **`TicketThread.tsx`** — message list with sender avatars/role badges, reply composer, attachments, realtime subscription on `ticket_messages` filtered by `ticket_id`.
- **`ContactForm.tsx`** — manual ticket fallback (subject, category, body, attachments).

### 3.3 Pages
- Rewrite `src/pages/HelpTickets.tsx` to use `TicketList`.
- New `src/pages/HelpTicket.tsx` at `/help/tickets/:id`.
- New `src/pages/HelpContact.tsx` at `/help/contact`.

### 3.4 Read state
- On opening a ticket: set `unread_by_user=false`.

**Exit:** Escalation creates a real ticket; user can reply; admin DB inserts appear live.

---

## 🏠 BATCH 4 — Hub & Browse

**Goal:** Replace current 3-tab `/help` with the full Support Hub IA.

### 4.1 Pages
Rewrite `src/pages/Help.tsx` as `SupportHub` shell with nested `<Outlet />`:
```
/help                  → AI hero + suggested prompts + TopicGrid + "Need a human?" + tickets badge
/help/articles/:slug   → ArticleReader
/help/tickets          → TicketList
/help/tickets/:id      → TicketThread
/help/contact          → ContactForm
```
Add nested routes in `src/App.tsx`.

### 4.2 Components
- **`SupportHub.tsx`** — landing layout (hero AI input, topic grid, CTA strip).
- **`TopicGrid.tsx`** — 6 role-aware topic cards (queries `help_articles` by category + role).
- **`ArticleReader.tsx`** — markdown render, `view_count++`, "Was this helpful?" Y/N updates counters, related articles footer.

### 4.3 Theme
All headings: `font-poppins font-bold text-gradient-aero` per Clean Aero Glow.

**Exit:** `/help` is a polished hub. Browse → article → "still need help" → AI/ticket flow works.

---

## 🛟 BATCH 5 — Contextual Layer

**Goal:** Help available on every authenticated screen, pre-filled with context.

### 5.1 `FloatingHelpLauncher.tsx`
- Bottom-right "?" FAB (hidden on `/help/*`).
- Opens a Sheet containing a context-scoped `AISupportChat` (route + visible job/booking ID via `HelpContext`).
- "Open full Support Center" link → `/help`.

### 5.2 `HelpContext.tsx` (full)
- Auto-detects `:jobId`, `:bookingId` from route params.
- Pages can manually push extra context via `useHelpContext().setContext({...})`.

### 5.3 Mount in `MainLayout.tsx`
- Render `<FloatingHelpLauncher />` only when `isAuthenticated`. (Provider already wired.)

### 5.4 Back-compat
- Replace `src/components/cleaner/JobSupportChat.tsx` body with a thin re-export of `FloatingHelpLauncher` so existing imports keep working.

**Exit:** "?" button visible everywhere when logged in; AI chat opens with route + job context.

---

## 🔔 BATCH 6 — Notifications & Polish

**Goal:** Surface unread agent replies; final QA.

### 6.1 Edge function `notify-ticket-reply`
- Triggered from admin-side insert into `ticket_messages` where `sender_role='agent'` (DB trigger via `pg_net` → edge fn).
- Sets `support_tickets.unread_by_user=true`, `last_agent_reply_at=now()`.
- Sends push (if `push_token`) + email via existing `send-email` + creates `notifications` row.

### 6.2 UI integration
- **`NotificationBell`** — query unread tickets count, surface as a category.
- **`MobileBottomNav`** — unread dot on Help icon when any ticket has `unread_by_user=true`.
- **`SupportHub`** — "My Tickets" badge with unread count.

### 6.3 Final QA
- Run `supabase--linter` for RLS warnings.
- Flow test: AI answer → escalate → admin reply → push + email + bell badge → user opens → unread cleared.
- Mobile responsive sweep on `/help` and `TicketThread`.
- Aero theme consistency check.

**Exit:** Full loop works; no security warnings; theme consistent.

---

## 📋 Out of Scope
- Admin reply UI (agents reply via DB/dashboard for v1)
- Live agent handoff
- Multilingual articles
- Article admin editor

---

## ▶️ Execution Protocol
1. Each batch starts only after you reply **"start batch N"**.
2. Each batch ends with a test checklist for you to verify in preview.
3. DB migration (Batch 1) requires your approval before code proceeds.

Reply **"start batch 1"** to begin with the database foundation.
