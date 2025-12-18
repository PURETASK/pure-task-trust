import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Plus, Calendar, Clock, MapPin, Star, Heart, Repeat } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for jobs
const upcomingJobs = [
  {
    id: "1",
    cleaner: { name: "Sarah M.", rating: 4.9, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    date: "Dec 20, 2024",
    time: "9:00 AM",
    address: "123 Main St",
    type: "Standard Clean",
    status: "confirmed",
    credits: 45,
  },
  {
    id: "2",
    cleaner: { name: "Mike R.", rating: 4.8, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    date: "Dec 24, 2024",
    time: "2:00 PM",
    address: "123 Main St",
    type: "Deep Clean",
    status: "pending",
    credits: 80,
  },
];

const pastJobs = [
  {
    id: "3",
    cleaner: { name: "Sarah M.", rating: 4.9, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    date: "Dec 15, 2024",
    type: "Standard Clean",
    status: "completed",
    credits: 45,
  },
];

const favorites = [
  {
    id: "1",
    name: "Sarah M.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    jobs: 12,
    rate: "35-50 credits/hr",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");

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
            {/* Header */}
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Past Jobs
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
                {upcomingJobs.length > 0 ? (
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
                              <img
                                src={job.cleaner.image}
                                alt={job.cleaner.name}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{job.cleaner.name}</h3>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                    {job.cleaner.rating}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{job.type}</p>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {job.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {job.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {job.address}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant={job.status === "confirmed" ? "success" : "pending"}>
                                  {job.status === "confirmed" ? "Confirmed" : "Pending"}
                                </Badge>
                                <p className="text-sm font-medium">{job.credits} credits</p>
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
                {pastJobs.length > 0 ? (
                  <div className="space-y-4">
                    {pastJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <img
                                src={job.cleaner.image}
                                alt={job.cleaner.name}
                                className="h-14 w-14 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{job.cleaner.name}</h3>
                                <p className="text-sm text-muted-foreground">{job.type} • {job.date}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="completed">Completed</Badge>
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
                {favorites.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((cleaner, index) => (
                      <motion.div
                        key={cleaner.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-elevated transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <img
                                src={cleaner.image}
                                alt={cleaner.name}
                                className="h-16 w-16 rounded-xl object-cover"
                              />
                              <div>
                                <h3 className="font-semibold">{cleaner.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                                  {cleaner.rating} • {cleaner.jobs} jobs
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{cleaner.rate}</p>
                            <Button className="w-full" asChild>
                              <Link to={`/cleaner/${cleaner.id}`}>Book Again</Link>
                            </Button>
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
                <Card>
                  <CardContent className="py-12 text-center">
                    <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Set up recurring cleanings</h3>
                    <p className="text-muted-foreground mb-4">Schedule weekly or bi-weekly cleanings for convenience</p>
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
