import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart, Star, MapPin, DollarSign, Calendar, Loader2, Trash2,
  Edit2, Save, X, Sparkles, TrendingUp, Search, Plus, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useFavorites, useFavoriteActions, FavoriteCleaner } from '@/hooks/useFavorites';

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
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const handleRemoveFavorite = async (cleanerId: string) => {
    try {
      await removeFavorite(cleanerId);
      toast.success('Removed from favorites');
      setConfirmRemove(null);
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const startEditingNotes = (favorite: FavoriteCleaner) => {
    setNotesText(favorite.notes || '');
    setEditingNotes(favorite.cleaner_id);
  };

  const filteredFavorites = favorites?.filter((fav) => {
    if (!searchQuery) return true;
    const name = `${fav.cleaner?.first_name || ''} ${fav.cleaner?.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'bg-amber-500';
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-slate-400';
      default: return 'bg-orange-600';
    }
  };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-4xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
                My Favorite Cleaners
              </h1>
              <p className="text-muted-foreground mt-1">
                Quick access to cleaners you love working with
              </p>
            </div>
            <Button asChild>
              <Link to="/discover">
                <Plus className="h-4 w-4 mr-2" />
                Find More Cleaners
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredFavorites.length === 0 && (
            <Card className="text-center py-16">
              <CardContent>
                <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No matches found' : 'No favorite cleaners yet'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start adding cleaners to your favorites for quick booking access'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/discover">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Cleaners
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Favorites List */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filteredFavorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                            {favorite.cleaner?.first_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`/cleaner/${favorite.cleaner_id}`}
                                className="font-semibold text-lg hover:text-primary transition-colors"
                              >
                                {favorite.cleaner?.first_name} {favorite.cleaner?.last_name}
                              </Link>
                              <Badge className={getTierColor(favorite.cleaner?.tier || 'bronze')}>
                                {(favorite.cleaner?.tier || 'bronze').charAt(0).toUpperCase() +
                                  (favorite.cleaner?.tier || 'bronze').slice(1)}
                              </Badge>
                              {favorite.cleaner?.background_check_status === 'passed' && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Shield className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              {favorite.cleaner?.avg_rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  {favorite.cleaner.avg_rating.toFixed(1)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-success" />
                                {favorite.cleaner?.reliability_score || 0}% reliability
                              </span>
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-violet-500" />
                                {favorite.cleaner?.jobs_completed || 0} jobs
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-primary" />
                                ${favorite.cleaner?.hourly_rate_credits || 0}/hr
                              </span>
                            </div>

                            {/* Availability */}
                            <div className="mt-2">
                              {favorite.cleaner?.is_available ? (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground">
                                  Unavailable
                                </Badge>
                              )}
                            </div>

                            {/* Notes */}
                            {editingNotes === favorite.cleaner_id ? (
                              <div className="mt-4 space-y-2">
                                <Textarea
                                  value={notesText}
                                  onChange={(e) => setNotesText(e.target.value)}
                                  placeholder="Add personal notes about this cleaner..."
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveNotes(favorite.cleaner_id)}
                                    disabled={isUpdatingNotes}
                                  >
                                    {isUpdatingNotes ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingNotes(null)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : favorite.notes ? (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-muted-foreground italic">"{favorite.notes}"</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => startEditingNotes(favorite)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-muted-foreground"
                                onClick={() => startEditingNotes(favorite)}
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Add notes
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 shrink-0">
                          <Button asChild className="flex-1 md:flex-none">
                            <Link to={`/book?cleaner=${favorite.cleaner_id}`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Book Now
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmRemove(favorite.cleaner_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {/* Confirm Remove Dialog */}
          <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cleaner will be removed from your favorites list. You can always add them back later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => confirmRemove && handleRemoveFavorite(confirmRemove)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Remove'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </main>
  );
}
