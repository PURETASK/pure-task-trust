
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Star, TrendingUp, Sparkles, DollarSign, Calendar, Loader2, Trash2, Edit2, Save, X, Search, Plus, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useFavorites, useFavoriteActions, FavoriteCleaner } from '@/hooks/useFavorites';

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  platinum: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/40', label: 'All-Star Expert' },
  gold: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/40', label: 'Top Performer' },
  silver: { bg: 'bg-slate-400/10', text: 'text-slate-500', border: 'border-slate-400/40', label: 'Proven Specialist' },
  bronze: { bg: 'bg-amber-600/10', text: 'text-amber-600', border: 'border-amber-600/40', label: 'Rising Pro' },
};

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function FavoriteCleaners() {
  const { data: favorites, isLoading } = useFavorites();
  const { removeFavorite, isRemoving, updateNotes, isUpdatingNotes } = useFavoriteActions();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const handleSaveNotes = async (cleanerId: string) => {
    try { await updateNotes({ cleanerId, notes: notesText }); toast.success('Notes saved!'); setEditingNotes(null); }
    catch { toast.error('Failed to save notes'); }
  };

  const handleRemoveFavorite = async (cleanerId: string) => {
    try { await removeFavorite(cleanerId); toast.success('Removed from favorites'); setConfirmRemove(null); }
    catch { toast.error('Failed to remove'); }
  };

  const filteredFavorites = favorites?.filter((fav) => {
    if (!searchQuery) return true;
    const name = `${fav.cleaner?.first_name || ''} ${fav.cleaner?.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <main className="flex-1 py-8">
      <div className="container px-3 sm:px-4 lg:px-6 max-w-5xl">
        {/* Hero Header */}
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
                  <h1 className="text-2xl sm:text-3xl font-black">My Favorite Cleaners</h1>
                  <p className="text-muted-foreground mt-1">{filteredFavorites.length} saved professional{filteredFavorites.length !== 1 ? 's' : ''}</p>
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

        {isLoading && <div className="space-y-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-48 rounded-3xl" />)}</div>}

        {!isLoading && filteredFavorites.length === 0 && (
          <motion.div {...f(0.08)}>
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border">
              <Heart className="h-20 w-20 mx-auto text-destructive/20 fill-destructive/10 mb-6" />
              <h2 className="text-2xl font-black mb-3">{searchQuery ? 'No matches found' : 'No favorites yet'}</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchQuery ? 'Try a different search term' : 'Save cleaners you love for quick rebooking'}
              </p>
              {!searchQuery && <Button asChild size="lg"><Link to="/discover"><Search className="h-4 w-4 mr-2" />Browse Cleaners</Link></Button>}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredFavorites.map((favorite, i) => {
              const tier = favorite.cleaner?.tier || 'bronze';
              const tierStyle = TIER_STYLES[tier] || TIER_STYLES.bronze;
              const name = `${favorite.cleaner?.first_name || ''} ${favorite.cleaner?.last_name || ''}`.trim() || 'Unknown';
              return (
                <motion.div key={favorite.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}>
                  <div className="rounded-3xl border-2 border-border/40 hover:border-primary/30 hover:shadow-elevated transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl sm:text-2xl font-black text-primary">
                              {name.charAt(0)}
                            </div>
                            {tier === 'platinum' && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-500 border-2 border-background flex items-center justify-center">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Link to={`/cleaner/${favorite.cleaner_id}`} className="font-black text-lg hover:text-primary transition-colors">{name}</Link>
                              <Badge className={`${tierStyle.bg} ${tierStyle.text} border-2 ${tierStyle.border} text-xs font-bold`}>{tierStyle.label}</Badge>
                              {favorite.cleaner?.background_check_status === 'passed' && (
                                <Badge className="gap-1 text-xs border-2 border-success/30 text-success bg-success/10 font-bold">
                                  <Shield className="h-3 w-3" />Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                              {favorite.cleaner?.avg_rating && (
                                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /><span className="font-bold text-foreground">{favorite.cleaner.avg_rating.toFixed(1)}</span></span>
                              )}
                              <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-success" />{favorite.cleaner?.reliability_score || 0}% reliable</span>
                              <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-[hsl(var(--pt-purple))]" />{favorite.cleaner?.jobs_completed || 0} jobs</span>
                              <span className="flex items-center gap-1 font-bold text-primary"><DollarSign className="h-3.5 w-3.5" />{favorite.cleaner?.hourly_rate_credits || 0}/hr</span>
                            </div>
                            <Badge className={`border-2 text-xs font-bold ${favorite.cleaner?.is_available ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-border'}`}>
                              {favorite.cleaner?.is_available ? '● Available Now' : '○ Unavailable'}
                            </Badge>
                            {editingNotes === favorite.cleaner_id ? (
                              <div className="mt-3 space-y-2">
                                <Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="Notes about this cleaner..." rows={2} className="text-sm rounded-xl border-2" />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveNotes(favorite.cleaner_id)} disabled={isUpdatingNotes} className="rounded-xl">
                                    {isUpdatingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3 w-3 mr-1" />Save</>}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)} className="rounded-xl"><X className="h-3 w-3 mr-1" />Cancel</Button>
                                </div>
                              </div>
                            ) : favorite.notes ? (
                              <div className="mt-3 p-3 bg-muted/40 rounded-xl border-2 border-border/30 text-sm flex items-start justify-between gap-2">
                                <p className="text-muted-foreground italic">"{favorite.notes}"</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { setNotesText(favorite.notes || ''); setEditingNotes(favorite.cleaner_id); }}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground h-7 px-2 rounded-xl" onClick={() => { setNotesText(''); setEditingNotes(favorite.cleaner_id); }}>
                                <Edit2 className="h-3 w-3 mr-1" />Add note
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2 p-4 md:p-5 bg-muted/20 border-t-2 md:border-t-0 md:border-l-2 border-border/30">
                        <Button asChild className="flex-1 md:flex-none gap-2 rounded-xl">
                          <Link to={`/book?cleaner=${favorite.cleaner_id}`}><Calendar className="h-4 w-4" />Book Now</Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1 md:flex-none rounded-xl border-2">
                          <Link to={`/cleaner/${favorite.cleaner_id}`}>View Profile</Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => setConfirmRemove(favorite.cleaner_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black">Remove from favorites?</AlertDialogTitle>
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
