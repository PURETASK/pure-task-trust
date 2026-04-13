import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useClientHome } from "@/hooks/useClientHome";
import { UpcomingCleaningCard } from "@/components/client-home/UpcomingCleaningCard";
import { QuickRebookSection } from "@/components/client-home/QuickRebookSection";
import { WalletSnapshotCard } from "@/components/client-home/WalletSnapshotCard";
import { AlertsSection } from "@/components/client-home/AlertsSection";
import { RecentMessagesPreview } from "@/components/client-home/RecentMessagesPreview";
import { RecentActivityFeed } from "@/components/social-proof/RecentActivityFeed";
import { NewUserWelcome } from "@/components/client-home/NewUserWelcome";
import { Skeleton } from "@/components/ui/skeleton";
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
    isLoading,
  } = useClientHome();

  const firstName = user?.name?.split(" ")[0] || "there";

  if (isLoading) {
    return (
      <main className="flex-1 bg-background min-h-screen">
        <div className="container px-4 sm:px-6 py-6 max-w-5xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Skeleton className="h-40 rounded-2xl md:col-span-3" />
            <Skeleton className="h-40 rounded-2xl md:col-span-2" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>Home | PureTask</title>
        <meta name="description" content="Your PureTask client command center — manage cleanings, wallet, and messages." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-5xl space-y-6 sm:space-y-8">

        {/* ── GREETING ───────────────────────────────────────────── */}
        <motion.div {...fade(0)}>
          <p className="text-sm text-muted-foreground">Welcome back 👋</p>
          <h1 className="text-xl sm:text-2xl font-bold">Hello, {firstName}!</h1>
        </motion.div>

        {/* ── ROW 1: HERO CARD (Full Width) ───────────────────── */}
        <motion.div {...fade(0.05)}>
          <UpcomingCleaningCard heroState={heroState} heroJob={heroJob} />
        </motion.div>

        {/* ── NEW USER FLOW ───────────────────────────────────── */}
        {isNewUser && (
          <motion.div {...fade(0.1)}>
            <NewUserWelcome />
          </motion.div>
        )}

        {/* ── ROW 2: REBOOK (60%) + WALLET (40%) ─────────────── */}
        {!isNewUser && (
          <motion.div {...fade(0.1)}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
              <div className="md:col-span-3">
                <QuickRebookSection candidates={rebookCandidates} />
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
        )}

        {/* ── ROW 3: ALERTS (50%) + MESSAGES (50%) ───────────── */}
        {/* On mobile: Alerts come right after hero (before rebook) */}
        <motion.div {...fade(0.15)} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="order-first md:order-none">
            <AlertsSection alerts={alerts} />
          </div>
          <div>
            <RecentMessagesPreview threads={recentThreads} />
          </div>
        </motion.div>

        {/* ── ROW 4: RECENT ACTIVITY (Full Width) ────────────── */}
        {!isNewUser && (
          <motion.div {...fade(0.2)}>
            <RecentActivityFeed limit={5} showTitle />
          </motion.div>
        )}
      </div>
    </main>
  );
}
