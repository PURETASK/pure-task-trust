import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Loader2, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useFavorites, useFavoriteActions } from '@/hooks/useFavorites';
import { CleanerShowcaseCard } from '@/components/cleaners/CleanerShowcaseCard';

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function FavoriteCleaners() {
  const { data: favorites, isLoading } = useFavorites();
  const { removeFavorite, isRemoving } = useFavoriteActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const handleRemoveFavorite = async (cleanerId: string) => {
    try { await removeFavorite(cleanerId); toast.success('Removed from favorites'); setConfirmRemove(null); }
    catch { toast.error('Failed to remove'); }
  };

  const filtered = favorites?.filter((fav) => {
    if (!searchQuery) return true;
    const name = `${fav.cleaner?.first_name || ''} ${fav.cleaner?.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <main className="flex-1 py-8">
      <div className="container px-3 sm:px-4 lg:px-6 max-w-6xl">
        {/* Hero header */}
        <motion.div {...f(0)}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-destructive/40 p-6 sm:p-8 mb-6 sm:mb-8"
            style={{ background: "linear-gradient(135deg, hsl(var(--destructive)/0.12) 0%, hsl(var(--pt-purple)/0.06) 60%, hsl(var(--background)) 100%)" }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--destructive)/0.12)" }} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-destructive/15 border-2 border-destructive/40 flex items-center justify-center">
                  <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-destructive fill-destructive/30" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-poppins font-bold">My Favorite Cleaners</h1>
                  <p className="text-muted-foreground mt-1">{filtered.length} saved professional{filtered.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Button asChild className="gap-2">
                <Link to="/discover"><Plus className="h-4 w-4" />Discover Cleaners</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search your favorites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 rounded-2xl border-2" />
        </div>

        {isLoading && (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[600px] rounded-3xl" />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <motion.div {...f(0.08)}>
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border">
              <Heart className="h-20 w-20 mx-auto text-destructive/20 fill-destructive/10 mb-6" />
              <h2 className="text-2xl font-poppins font-bold mb-3">{searchQuery ? 'No matches found' : 'No favorites yet'}</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchQuery ? 'Try a different search term' : 'Save cleaners you love for quick rebooking'}
              </p>
              {!searchQuery && <Button asChild size="lg"><Link to="/discover"><Search className="h-4 w-4 mr-2" />Browse Cleaners</Link></Button>}
            </div>
          </motion.div>
        )}

        {!isLoading && filtered.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((favorite, i) => {
                const c = favorite.cleaner;
                if (!c) return null;
                const name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Cleaner';
                return (
                  <div key={favorite.id} className="relative">
                    <CleanerShowcaseCard
                      cleaner={{
                        id: favorite.cleaner_id,
                        name,
                        firstName: c.first_name,
                        lastName: c.last_name,
                        profilePhotoUrl: (c as any).profile_photo_url,
                        hourlyRate: c.hourly_rate_credits || 35,
                        avgRating: c.avg_rating,
                        jobsCompleted: c.jobs_completed,
                        reliabilityScore: c.reliability_score,
                        tier: c.tier,
                        verified: c.background_check_status === 'passed',
                        bio: (c as any).bio,
                        services: [],
                        isAvailable: c.is_available,
                      }}
                      isFavorite
                      onToggleFavorite={(cid, e) => { e.preventDefault(); e.stopPropagation(); setConfirmRemove(cid); }}
                      isFavoriteLoading={isRemoving}
                      index={i}
                    />
                  </div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-poppins font-bold">Remove from favorites?</AlertDialogTitle>
              <AlertDialogDescription>This cleaner will be removed from your favorites list. You can always re-add them.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-2">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmRemove && handleRemoveFavorite(confirmRemove)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
