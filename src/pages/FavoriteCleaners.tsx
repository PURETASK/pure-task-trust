
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
  platinum: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30', label: 'Platinum' },
  gold: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30', label: 'Gold' },
  silver: { bg: 'bg-slate-400/10', text: 'text-slate-500', border: 'border-slate-400/30', label: 'Silver' },
  bronze: { bg: 'bg-amber-600/10', text: 'text-amber-600', border: 'border-amber-600/30', label: 'Bronze' },
};

export default function FavoriteCleaners() {
  const { data: favorites, isLoading } = useFavorites();
  const { removeFavorite, isRemoving, updateNotes, isUpdatingNotes } = useFavoriteActions();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const handleSaveNotes = async (cleanerId: string) => {
    try {
      await updateNotes({ cleanerId, notes: notesText });
      toast.success('Notes saved!');
      setEditingNotes(null);
    } catch { toast.error('Failed to save notes'); }
  };

  const handleRemoveFavorite = async (cleanerId: string) => {
    try {
      await removeFavorite(cleanerId);
      toast.success('Removed from favorites');
      setConfirmRemove(null);
    } catch { toast.error('Failed to remove'); }
  };

  const filteredFavorites = favorites?.filter((fav) => {
    if (!searchQuery) return true;
    const name = `${fav.cleaner?.first_name || ''} ${fav.cleaner?.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-5xl">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-primary/5 to-violet-500/10 border border-rose-500/20 p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Favorite Cleaners</h1>
                <p className="text-muted-foreground mt-1">{filteredFavorites.length} saved professional{filteredFavorites.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button asChild className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg">
              <Link to="/discover"><Plus className="h-4 w-4" />Discover Cleaners</Link>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search your favorites..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 rounded-xl border-border/60" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFavorites.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center py-20 border-dashed border-2">
              <CardContent>
                <Heart className="h-20 w-20 mx-auto text-rose-500/20 fill-rose-500/10 mb-6" />
                <h2 className="text-2xl font-bold mb-3">{searchQuery ? 'No matches found' : 'No favorites yet'}</h2>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {searchQuery ? 'Try a different search term' : 'Save cleaners you love for quick rebooking'}
                </p>
                {!searchQuery && (
                  <Button asChild size="lg">
                    <Link to="/discover"><Search className="h-4 w-4 mr-2" />Browse Cleaners</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Favorites List */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredFavorites.map((favorite, i) => {
              const tier = favorite.cleaner?.tier || 'bronze';
              const tierStyle = TIER_STYLES[tier] || TIER_STYLES.bronze;
              const name = `${favorite.cleaner?.first_name || ''} ${favorite.cleaner?.last_name || ''}`.trim() || 'Unknown';
              return (
                <motion.div key={favorite.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 border-border/60">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Cleaner Identity */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              {favorite.cleaner?.profile_photo_url ? (
                                <img src={favorite.cleaner.profile_photo_url} alt={name} className="h-16 w-16 rounded-2xl object-cover" />
                              ) : (
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl font-bold text-primary">
                                  {name.charAt(0)}
                                </div>
                              )}
                              {tier === 'platinum' && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                                  <Crown className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Link to={`/cleaner/${favorite.cleaner_id}`} className="font-bold text-lg hover:text-primary transition-colors">{name}</Link>
                                <Badge className={`${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border} text-xs`}>{tierStyle.label}</Badge>
                                {favorite.cleaner?.background_check_status === 'passed' && (
                                  <Badge variant="outline" className="gap-1 text-xs border-success/30 text-success bg-success/5">
                                    <Shield className="h-3 w-3" />Verified
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                                {favorite.cleaner?.avg_rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                    <span className="font-medium text-foreground">{favorite.cleaner.avg_rating.toFixed(1)}</span>
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                                  {favorite.cleaner?.reliability_score || 0}% reliable
                                </span>
                                <span className="flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                                  {favorite.cleaner?.jobs_completed || 0} jobs
                                </span>
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {favorite.cleaner?.hourly_rate_credits || 0}/hr
                                </span>
                              </div>

                              <Badge variant={favorite.cleaner?.is_available ? 'default' : 'secondary'} className={favorite.cleaner?.is_available ? 'bg-success/10 text-success border-success/20 hover:bg-success/20' : ''}>
                                {favorite.cleaner?.is_available ? '● Available Now' : '○ Unavailable'}
                              </Badge>

                              {/* Notes */}
                              {editingNotes === favorite.cleaner_id ? (
                                <div className="mt-3 space-y-2">
                                  <Textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="Notes about this cleaner..." rows={2} className="text-sm" />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSaveNotes(favorite.cleaner_id)} disabled={isUpdatingNotes}>
                                      {isUpdatingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3 w-3 mr-1" />Save</>}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}><X className="h-3 w-3 mr-1" />Cancel</Button>
                                  </div>
                                </div>
                              ) : favorite.notes ? (
                                <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/40 text-sm flex items-start justify-between gap-2">
                                  <p className="text-muted-foreground italic">"{favorite.notes}"</p>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { setNotesText(favorite.notes || ''); setEditingNotes(favorite.cleaner_id); }}>
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground h-7 px-2" onClick={() => { setNotesText(''); setEditingNotes(favorite.cleaner_id); }}>
                                  <Edit2 className="h-3 w-3 mr-1" />Add note
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 p-4 md:p-6 bg-muted/20 border-t md:border-t-0 md:border-l border-border/40">
                          <Button asChild className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-primary to-primary/80">
                            <Link to={`/book?cleaner=${favorite.cleaner_id}`}><Calendar className="h-4 w-4" />Book Now</Link>
                          </Button>
                          <Button variant="outline" asChild className="flex-1 md:flex-none">
                            <Link to={`/cleaner/${favorite.cleaner_id}`}>View Profile</Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setConfirmRemove(favorite.cleaner_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
              <AlertDialogDescription>This cleaner will be removed from your favorites list. You can always re-add them.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmRemove && handleRemoveFavorite(confirmRemove)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
