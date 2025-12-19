import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, MapPin, Star, Heart, Repeat, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useClientJobs } from "@/hooks/useJob";
import { format } from "date-fns";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { data: jobs, isLoading } = useClientJobs();

  const upcomingJobs = jobs?.filter(j => ['created', 'pending', 'confirmed', 'in_progress'].includes(j.status)) || [];
  const pastJobs = jobs?.filter(j => ['completed', 'cancelled'].includes(j.status)) || [];

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1">Your Dashboard</h1>
                <p className="text-muted-foreground">Manage your bookings and find cleaners</p>
              </div>
              <Button asChild>
                <Link to="/book">
                  <Plus className="h-4 w-4 mr-2" />
                  Book a Cleaning
                </Link>
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming ({upcomingJobs.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Past Jobs ({pastJobs.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="recurring" className="gap-2">
                  <Repeat className="h-4 w-4" />
                  Recurring
                </TabsTrigger>
              </TabsList>

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
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {getCleanerName(job).charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{getCleanerName(job)}</h3>
                                  {job.cleaner?.avg_rating && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                      {job.cleaner.avg_rating.toFixed(1)}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 capitalize">
                                  {job.cleaning_type?.replace('_', ' ')} Clean
                                </p>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, yyyy') : 'TBD'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(job.status)}
                                <p className="text-sm font-medium">{job.escrow_credits_reserved || 0} credits</p>
                                <Button variant="outline" size="sm" asChild>
                                  <Link to={`/booking/${job.id}`}>View</Link>
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
                                  <Link to={`/job/${job.id}`}>View Details</Link>
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
              </TabsContent>

              <TabsContent value="recurring">
                <Card>
                  <CardContent className="py-12 text-center">
                    <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Set up recurring cleanings</h3>
                    <p className="text-muted-foreground mb-4">Schedule weekly or bi-weekly cleanings</p>
                    <Button asChild>
                      <Link to="/book">Create Schedule</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
