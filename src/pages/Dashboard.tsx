import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Clock, Star, Heart, Repeat, Loader2, Trash2, Check, Sparkles, MessageCircle, RotateCcw, HelpCircle, Zap, MapPin, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useClientJobs } from "@/hooks/useJob";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useRecurringBookings } from "@/hooks/useRecurringBookings";
import { format, isToday } from "date-fns";
import { InviteFriendsCTA } from "@/components/referral";
import { LoyaltyTracker } from "@/components/loyalty/LoyaltyTracker";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useClientJobs();
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { data: recurring, isLoading: loadingRecurring } = useRecurringBookings();
  const { removeFavorite, isRemoving } = useFavoriteActions();

  const upcomingJobs = jobs?.filter(j => ['created', 'pending', 'confirmed', 'in_progress'].includes(j.status)) || [];
  const pendingApprovalJobs = jobs?.filter(j => j.status === 'completed' && j.final_charge_credits == null) || [];
  const pastJobs = jobs?.filter(j => (j.status === 'completed' && j.final_charge_credits != null) || j.status === 'cancelled') || [];

  // Today's active jobs (C3: live status banner)
  const todayJobs = upcomingJobs.filter(j => j.scheduled_start_at && isToday(new Date(j.scheduled_start_at)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
      case 'created': return <Badge variant="pending">Pending</Badge>;
      case 'in_progress': return <Badge variant="active">In Progress</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCleanerName = (job: typeof upcomingJobs[0]) => {
    if (!job.cleaner) return 'Finding cleaner...';
    return `${job.cleaner.first_name || ''} ${job.cleaner.last_name || ''}`.trim() || 'Assigned';
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Monthly';
      default: return freq;
    }
  };

  const getStatusBannerContent = (status: string) => {
    switch (status) {
      case 'in_progress': return { label: '🧹 Cleaning in progress right now!', color: 'bg-primary/10 border-primary/30 text-primary' };
      case 'on_way': return { label: '🚗 Your cleaner is on the way!', color: 'bg-warning/10 border-warning/30 text-warning' };
      case 'confirmed': return { label: '✅ Booking confirmed for today', color: 'bg-success/10 border-success/30 text-success' };
      default: return { label: '📅 You have a cleaning scheduled today', color: 'bg-accent border-border text-foreground' };
    }
  };

  return (
    <main className="flex-1 py-4 sm:py-8">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Your Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your bookings and find cleaners</p>
            </div>
            <Button asChild className="w-full sm:w-auto self-start">
              <Link to="/book">
                <Plus className="h-4 w-4 mr-2" />
                Book a Cleaning
              </Link>
            </Button>
          </div>

          {/* C3: Today's Job Live Status Banner */}
          <AnimatePresence>
            {todayJobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                {todayJobs.map(job => {
                  const banner = getStatusBannerContent(job.status);
                  return (
                    <Link key={job.id} to={`/booking/${job.id}`}>
                      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${banner.color} cursor-pointer hover:opacity-90 transition-opacity`}>
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm">{banner.label}</p>
                            <p className="text-xs opacity-80">
                              {format(new Date(job.scheduled_start_at!), 'h:mm a')} · {job.cleaning_type?.replace('_', ' ')} Clean
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium opacity-80">View →</span>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* C-10: Loyalty Rewards Tracker */}
          <div className="mb-6">
            <LoyaltyTracker />
          </div>

          {/* C-01: Smart Rebooking Suggestions */}
          {(() => {
            const pastWithCleaner = jobs?.filter(j =>
              j.status === 'completed' && j.cleaner_id && j.cleaner
            ) ?? [];
            // Deduplicate by cleaner_id, keep most recent
            const seen = new Set<string>();
            const suggestions = pastWithCleaner.filter(j => {
              if (!j.cleaner_id || seen.has(j.cleaner_id)) return false;
              seen.add(j.cleaner_id);
              return true;
            }).slice(0, 3);
            if (suggestions.length === 0) return null;
            return (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Book Again</h2>
                  <span className="text-xs text-muted-foreground ml-1">Your recent cleaners</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                  {suggestions.map(job => {
                    const cleanerName = `${job.cleaner?.first_name || ''} ${job.cleaner?.last_name || ''}`.trim() || 'Cleaner';
                    return (
                      <Link key={job.id} to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}`} className="flex-shrink-0">
                        <Card className="w-44 hover:shadow-elevated hover:border-primary/40 transition-all cursor-pointer">
                          <CardContent className="p-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary mb-2">
                              {cleanerName.charAt(0)}
                            </div>
                            <p className="font-medium text-xs truncate">{cleanerName}</p>
                            {job.cleaner?.avg_rating && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                                {job.cleaner.avg_rating.toFixed(1)}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                              {(job.cleaning_type || '').replace('_', ' ')} Clean
                            </p>
                            <Button size="sm" className="w-full mt-2 h-7 text-xs">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Book Again
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Referral CTA */}
          <InviteFriendsCTA className="mb-6" />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
              <TabsList className="w-max md:w-auto">
                <TabsTrigger value="upcoming" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-4">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Upcoming</span> ({upcomingJobs.length})
                </TabsTrigger>
                <TabsTrigger value="approval" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-4 relative">
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Approve</span>
                  {pendingApprovalJobs.length > 0 && (
                    <span className="ml-1 h-5 min-w-5 px-1 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {pendingApprovalJobs.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-4">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Past</span> ({pastJobs.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-4">
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Favs</span> ({favorites?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="recurring" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-4">
                  <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Recurring</span> ({recurring?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
              ) : upcomingJobs.length > 0 ? (
                <div className="space-y-4">
                  {upcomingJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-elevated transition-all">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm sm:text-base flex-shrink-0">
                                {getCleanerName(job).charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-sm sm:text-base truncate">{getCleanerName(job)}</h3>
                                  {job.cleaner?.avg_rating && (
                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-warning text-warning" />
                                      {job.cleaner.avg_rating.toFixed(1)}
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                                  {job.cleaning_type?.replace('_', ' ')} Clean
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {getStatusBadge(job.status)}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d') : 'TBD'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                                </span>
                                <span className="font-medium text-foreground">{job.escrow_credits_reserved || 0} credits</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {job.cleaner && (
                                  <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm h-8">
                                    <Link to={`/messages?job=${job.id}`}>
                                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                      Message
                                    </Link>
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm h-8">
                                  <Link to={`/booking/${job.id}`}>View</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No upcoming bookings</h3>
                    <p className="text-muted-foreground mb-4">Book your first cleaning to get started</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button asChild>
                        <Link to="/book">Book a Cleaning</Link>
                      </Button>
                      {/* C10: Help CTA on empty state */}
                      <Button variant="outline" asChild>
                        <Link to="/help"><HelpCircle className="h-4 w-4 mr-2" />Get Help</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pending Approval Tab */}
            <TabsContent value="approval">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
              ) : pendingApprovalJobs.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovalJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-elevated transition-all border-success/30 bg-success/5">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl bg-success/10 flex items-center justify-center font-semibold text-success text-sm sm:text-base flex-shrink-0">
                                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-sm sm:text-base truncate">{getCleanerName(job)}</h3>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                                  {job.cleaning_type?.replace('_', ' ')} Clean • Ready for review
                                </p>
                              </div>
                              <Badge variant="success">Complete</Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d') : 'TBD'}
                                </span>
                                <span className="font-medium text-foreground">{job.escrow_credits_reserved || 0} credits</span>
                              </div>
                              <Button variant="success" size="sm" asChild className="text-xs sm:text-sm h-8">
                                <Link to={`/job-approval/${job.id}`}>
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Review & Approve
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No jobs awaiting approval</h3>
                    <p className="text-muted-foreground">Completed jobs will appear here for your review</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past">
              {isLoading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : pastJobs.length > 0 ? (
                <div className="space-y-4">
                  {pastJobs.map((job, index) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center font-semibold">
                              {getCleanerName(job).charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{getCleanerName(job)}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {job.cleaning_type?.replace('_', ' ')} Clean • {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d') : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusBadge(job.status)}
                              {/* C1: Re-book in 1 tap */}
                              {job.status === 'completed' && job.cleaner_id && (
                                <Button size="sm" asChild>
                                  <Link to={`/book?cleaner=${job.cleaner_id}`}>
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                    Book Again
                                  </Link>
                                </Button>
                              )}
                              {/* Leave Review */}
                              {job.status === 'completed' && (
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/reviews?job=${job.id}`}>
                                    <Star className="h-3.5 w-3.5 mr-1" />
                                    Review
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/booking/${job.id}`}>Details</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No past jobs yet</h3>
                    <p className="text-muted-foreground mb-4">Your completed jobs will appear here</p>
                    {/* C10: Help CTA on empty state */}
                    <Button variant="outline" asChild>
                      <Link to="/help"><HelpCircle className="h-4 w-4 mr-2" />Get Help</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {loadingFavorites ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((fav, index) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-elevated transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">
                              {fav.cleaner?.first_name?.charAt(0) || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {fav.cleaner?.first_name} {fav.cleaner?.last_name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {fav.cleaner?.avg_rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                    {fav.cleaner.avg_rating.toFixed(1)}
                                  </span>
                                )}
                                <span>•</span>
                                <span>{fav.cleaner?.jobs_completed || 0} jobs</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {fav.cleaner?.hourly_rate_credits || 35} credits/hr
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFavorite(fav.cleaner_id)}
                              disabled={isRemoving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link to={`/cleaner/${fav.cleaner_id}`}>View Profile</Link>
                            </Button>
                            {/* C1: Book again from favorites */}
                            <Button size="sm" className="flex-1" asChild>
                              <Link to={`/book?cleaner=${fav.cleaner_id}`}>
                                Book
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground mb-4">Save cleaners you love for quick rebooking</p>
                    <Button variant="outline" asChild>
                      <Link to="/discover">Browse Cleaners</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recurring">
              {loadingRecurring ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : recurring && recurring.length > 0 ? (
                <div className="space-y-4">
                  {recurring.map((sub, index) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-elevated transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Repeat className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold capitalize">
                                  {sub.cleaning_type?.replace('_', ' ') || 'Standard'} Clean
                                </h3>
                                <Badge variant={sub.status === 'active' ? 'success' : 'secondary'}>
                                  {sub.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {getFrequencyLabel(sub.frequency)} • {sub.credit_amount} credits
                              </p>
                              {sub.next_job_date && (
                                <p className="text-sm text-muted-foreground">
                                  Next: {format(new Date(sub.next_job_date), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to="/book">Manage</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Set up recurring cleanings</h3>
                    <p className="text-muted-foreground mb-4">Schedule weekly or bi-weekly cleanings for consistent care</p>
                    <Button asChild>
                      <Link to="/book">Create Schedule</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
