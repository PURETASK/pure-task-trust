import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, Star, Heart, Repeat, Loader2, Trash2, Check, Sparkles, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientJobs } from "@/hooks/useJob";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useRecurringBookings } from "@/hooks/useRecurringBookings";
import { format } from "date-fns";
import { InviteFriendsCTA } from "@/components/referral";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { data: jobs, isLoading } = useClientJobs();
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { data: recurring, isLoading: loadingRecurring } = useRecurringBookings();
  const { removeFavorite, isRemoving } = useFavoriteActions();

  const upcomingJobs = jobs?.filter(j => ['created', 'pending', 'confirmed', 'in_progress'].includes(j.status)) || [];
  const pendingApprovalJobs = jobs?.filter(j => j.status === 'completed' && j.final_charge_credits == null) || [];
  const pastJobs = jobs?.filter(j => (j.status === 'completed' && j.final_charge_credits != null) || j.status === 'cancelled') || [];

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
                    <Button asChild>
                      <Link to="/book">Book a Cleaning</Link>
                    </Button>
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
                                <span className="font-medium text-foreground">${job.escrow_credits_reserved || 0}</span>
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
                            <div className="flex items-center gap-3">
                              {getStatusBadge(job.status)}
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/booking/${job.id}`}>View Details</Link>
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
                    <p className="text-muted-foreground">Your completed jobs will appear here</p>
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
                                ${fav.cleaner?.hourly_rate_credits || 35}/hr
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
                            <Button size="sm" className="flex-1" asChild>
                              <Link to={`/book?cleaner=${fav.cleaner_id}`}>Book</Link>
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
                                {getFrequencyLabel(sub.frequency)} • ${sub.credit_amount}
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
