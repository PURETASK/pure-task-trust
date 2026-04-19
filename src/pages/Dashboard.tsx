import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import cleaningPattern from "@/assets/hero-cleaning-pattern.jpg";
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
    <main className="flex-1 min-h-screen relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={cleaningPattern} 
          alt="" 
          className="w-full h-full object-contain opacity-30" 
          aria-hidden="true" 
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>
      <Helmet>
        <title>Home | PureTask</title>
        <meta name="description" content="Your PureTask client command center — manage cleanings, wallet, and messages." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-5xl relative z-10">

        {/* ── GREETING ─────────────────────────────────────────────────── */}
        <motion.div {...fade(0)} className="mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground font-medium">Welcome back 👋</p>
          <h1 className="text-2xl sm:text-3xl font-poppins font-bold tracking-tight">
            Hello, <span className="text-gradient-aero">{firstName}</span>
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

        {/* ── ROW 2: REBOOK (60%) + WALLET (40%) ──────────────────────── */}
        <motion.div {...fade(0.1)} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-6">
            <div className="md:col-span-3">
              <QuickRebookSection candidates={rebookCandidates} isNewUser={isNewUser} />
            </div>
            <div className="md:col-span-2">
              <WalletSnapshotCard
                availableBalance={availableBalance}
                heldBalance={heldBalance}
                walletState={walletState}
              />
            </div>
          </div>
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
