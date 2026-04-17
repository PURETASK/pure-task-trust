

# Support Center Redesign — Full Overhaul

A complete rethink of `/help` into a modern support hub: AI-first deflection, role-aware experiences, threaded ticket conversations, and contextual entry points across the app.

## The 4 Pillars

**1. AI assistant first** — Every visit opens with a chat box. The AI answers from FAQs, policies (cancellation, pricing, reliability score), and the user's own data (recent bookings, wallet balance). If unresolved, "Talk to a human" converts the transcript into a ticket with full context.

**2. Role-aware** — Clients and cleaners see different categories, suggested articles, and quick actions. Detected automatically via `user_roles`.

**3. Threaded tickets** — Real two-way conversations. Users see agent replies inline, get notified, can reply with attachments. No more email-only loop.

**4. Contextual support everywhere** — A floating "Help" launcher on key screens (booking, job, wallet) opens a sheet pre-filled with that context (booking ID, page, screenshot option). Replaces the standalone `JobSupportChat` with a unified component.

## New Information Architecture

```text
/help                         → Support Hub (landing)
  ├─ AI chat (default view, full width)
  ├─ Browse by topic (role-aware cards)
  ├─ Quick actions (Cancel booking, Refund, etc.)
  └─ Floating "My Tickets" badge (shows unread agent replies)

/help/articles/:slug          → Help article reader (markdown)
/help/tickets                 → My Tickets list
/help/tickets/:id             → Threaded conversation view
/help/contact                 → Manual ticket form (fallback)
```

The Hub replaces the current 3-tab page. Tabs are too flat — we need depth: hub → topic → article OR hub → AI → ticket.

## UX Layout — `/help` Hub

```text
┌──────────────────────────────────────────────────────┐
│  Hi {name}, how can we help?                         │
│  ┌────────────────────────────────────────────────┐  │
│  │ 💬 Ask anything... (AI replies in seconds)     │  │
│  └────────────────────────────────────────────────┘  │
│  Suggested: "Cancel my booking" "Refund" "No-show"   │
├──────────────────────────────────────────────────────┤
│  Browse help (role-aware grid of 6 topic cards)      │
│  [Bookings] [Payments] [Cleaners] [Account] ...      │
├──────────────────────────────────────────────────────┤
│  Need a human? → [Open ticket]   📧 Email  📞 Phone  │
└──────────────────────────────────────────────────────┘
```

## Database Changes

**New tables:**
- `help_articles` — markdown content, slug, category, role (`client`/`cleaner`/`both`), tags, view_count. Public read.
- `ticket_messages` — `ticket_id`, `sender_id`, `sender_role` (user/agent/ai), `body`, `attachments jsonb`, `created_at`. RLS: user reads/writes for tickets they own; admins (via `has_role`) read/write all.
- `support_conversations` — AI chat sessions: `user_id`, `messages jsonb[]`, `resolved boolean`, `escalated_ticket_id`. So we can convert AI chats → tickets.

**Extend `support_tickets`:**
- `last_agent_reply_at timestamptz` (drives unread badge)
- `unread_by_user boolean default false`
- `ai_transcript_id uuid` (links to originating AI chat)
- `category text` (replaces freeform `issue_type`, FK-style enum)
- `attachments jsonb default '[]'`

**Realtime:** Enable on `ticket_messages` so users see agent replies live.

## Backend (Edge Functions)

- `support-ai-chat` (streaming) — Lovable AI Gateway, `google/gemini-3-flash-preview`. System prompt includes PureTask policies (escrow, cancellation tiers, reliability). Tools: `search_help_articles`, `lookup_user_booking`, `escalate_to_ticket`. Returns SSE stream.
- `escalate-conversation` — Converts AI chat → ticket, attaches transcript, notifies support queue.
- `notify-ticket-reply` — Triggered when agent replies; sends push + email + sets `unread_by_user=true`.

## Components to Build

```text
src/components/support/
  ├─ SupportHub.tsx              (landing, AI + browse + CTA)
  ├─ AISupportChat.tsx           (streaming chat, escalate button)
  ├─ TopicGrid.tsx               (role-aware topic cards)
  ├─ ArticleReader.tsx           (markdown + helpful Y/N + related)
  ├─ TicketList.tsx              (with unread badges)
  ├─ TicketThread.tsx            (messages + reply composer + attachments)
  ├─ ContactForm.tsx             (manual ticket fallback)
  ├─ FloatingHelpLauncher.tsx    (contextual sheet — replaces JobSupportChat)
  └─ HelpContext.tsx             (provider: current page/booking auto-attached)
```

## Pages

- Rewrite `src/pages/Help.tsx` → `SupportHub` shell with nested routes
- Add `src/pages/HelpArticle.tsx`, `src/pages/HelpTickets.tsx`, `src/pages/HelpTicket.tsx`, `src/pages/HelpContact.tsx`
- Update `src/App.tsx` routes
- Replace `src/components/cleaner/JobSupportChat.tsx` usage with `FloatingHelpLauncher` (keep the file as a thin re-export for back-compat)

## Cross-App Integration

Mount `<FloatingHelpLauncher />` in `MainLayout` for authenticated users. Auto-attaches current route + visible booking/job ID. A "?" button bottom-right; click → contextual sheet (AI chat scoped to that page's content).

Update `NotificationBell` and `MobileBottomNav` to surface unread ticket replies.

## Content Seeding

Seed ~20 starter `help_articles` covering the existing FAQ content + cancellation policy + reliability score + credits, split by role. Future articles editable via an admin page (out of scope for v1).

## Rollout

Single PR, feature-complete. Old `JobSupportChat` re-exports new component so cleaner job pages keep working without edits. FAQ tab content migrates into seeded articles.

## Out of Scope (Future)

- Admin reply UI (agents reply via DB/dashboard for v1)
- Live agent chat (handoff)
- Multilingual articles
- Article admin editor

