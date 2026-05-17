import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useClientHome } from "@/hooks/useClientHome";
import { UpcomingCleaningCard } from "@/components/client-home/UpcomingCleaningCard";
import { QuickRebookSection } from "@/components/client-home/QuickRebookSection";
import { WalletSnapshotCard } from "@/components/client-home/WalletSnapshotCard";
import { AlertsSection } from "@/components/client-home/AlertsSection";
import { RecentMessagesPreview } from "@/components/client-home/RecentMessagesPreview";
import { RecentActivityTimeline } from "@/components/client-home/RecentActivityTimeline";
import { NewUserWelcome } from "@/components/client-home/NewUserWelcome";
import { useAuth } from "@/contexts/AuthContext";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35 },
});

export default function Dashboard() {
  const { user } = useAuth();
  const {
    heroState,
    heroJob,
    availableBalance,
    heldBalance,
    walletState,
    recentThreads,
    alerts,
    rebookCandidates,
    isNewUser,
  } = useClientHome();

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <main className="flex-1 min-h-screen relative bg-app-canvas">
      <Helmet>
        <title>Home | PureTask</title>
        <meta name="description" content="Your PureTask client command center — manage cleanings, wallet, and messages." />
      </Helmet>

      {/* Layered Aero glow background — adds depth without competing with content */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.25) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, hsl(var(--pt-aqua,var(--primary))/0.22) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-app-canvas/40" />
      </div>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-5xl relative z-10">

        {/* ── GREETING ─────────────────────────────────────────────────── */}
        <motion.div {...fade(0)} className="mb-6 sm:mb-8">
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-ink-faint mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold tracking-tight text-ink">
            Hello,{" "}
            <span className="bg-gradient-aero bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
        </motion.div>

        {/* ── ROW 1: HERO CARD (Full Width) ────────────────────────────── */}
        <motion.div {...fade(0.05)} className="mb-6 sm:mb-8">
          <UpcomingCleaningCard heroState={heroState} heroJob={heroJob} />
        </motion.div>

        {/* ── MOBILE: ALERTS RIGHT AFTER HERO ──────────────────────────── */}
        <motion.div {...fade(0.08)} className="md:hidden mb-6">
          <AlertsSection alerts={alerts} />
        </motion.div>

        {/* ── NEW USER ONBOARDING ──────────────────────────────────────── */}
        {isNewUser && (
          <motion.div {...fade(0.1)} className="mb-6 sm:mb-8">
            <NewUserWelcome />
          </motion.div>
        )}

        {/* ── ROW 2: QUICK REBOOK (Full Width, horizontal scroll) ──────── */}
        <motion.div {...fade(0.1)} className="mb-6 sm:mb-8">
          <QuickRebookSection candidates={rebookCandidates} isNewUser={isNewUser} />
        </motion.div>

        {/* ── ROW 2b: WALLET (Full Width) ──────────────────────────────── */}
        <motion.div {...fade(0.12)} className="mb-6 sm:mb-8">
          <WalletSnapshotCard
            availableBalance={availableBalance}
            heldBalance={heldBalance}
            walletState={walletState}
          />
        </motion.div>

        {/* ── ROW 3: ALERTS (desktop) + MESSAGES ──────────────────────── */}
        <motion.div {...fade(0.15)} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="hidden md:block">
              <AlertsSection alerts={alerts} />
            </div>
            <div>
              <RecentMessagesPreview threads={recentThreads} />
            </div>
          </div>
        </motion.div>

        {/* ── ROW 4: RECENT ACTIVITY (Full Width) ─────────────────────── */}
        {!isNewUser && (
          <motion.div {...fade(0.2)}>
            <RecentActivityTimeline />
          </motion.div>
        )}
      </div>
    </main>
  );
}
