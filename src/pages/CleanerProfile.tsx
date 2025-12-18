import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Shield, MapPin, Calendar, MessageCircle, Heart, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const cleanerData = {
  id: "1",
  name: "Sarah Mitchell",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  rating: 4.9,
  reviews: 127,
  reliability: 98,
  rate: "35-50",
  bio: "Professional cleaner with 5+ years of experience. I take pride in leaving every home spotless and organized. I use eco-friendly products when requested and always bring my own supplies.",
  services: ["Standard Clean", "Deep Clean", "Move-out Clean", "Eco-friendly"],
  verified: true,
  memberSince: "Jan 2022",
  completedJobs: 243,
  responseTime: "< 2 hours",
  reviewsList: [
    {
      id: "1",
      name: "Jennifer K.",
      rating: 5,
      date: "Dec 10, 2024",
      comment: "Sarah did an amazing job! My apartment has never been cleaner. She was thorough, professional, and finished on time.",
    },
    {
      id: "2",
      name: "Michael T.",
      rating: 5,
      date: "Dec 5, 2024",
      comment: "Excellent attention to detail. Sarah even cleaned areas I didn't expect. Will definitely book again!",
    },
    {
      id: "3",
      name: "Amanda R.",
      rating: 4,
      date: "Nov 28, 2024",
      comment: "Great service overall. Very friendly and did a thorough job. The only reason for 4 stars is she arrived a bit late.",
    },
  ],
};

export default function CleanerProfile() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Header */}
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="relative">
                    <img
                      src={cleanerData.image}
                      alt={cleanerData.name}
                      className="w-full md:w-64 h-64 object-cover"
                    />
                    {cleanerData.verified && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="trust" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">{cleanerData.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-medium text-foreground">{cleanerData.rating}</span>
                            <span>({cleanerData.reviews} reviews)</span>
                          </div>
                          <span className="text-success font-medium">{cleanerData.reliability}% reliable</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground mb-6">{cleanerData.bio}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold">{cleanerData.completedJobs}</p>
                        <p className="text-xs text-muted-foreground">Jobs Done</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold">{cleanerData.rate}</p>
                        <p className="text-xs text-muted-foreground">Credits/hr</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold">{cleanerData.responseTime}</p>
                        <p className="text-xs text-muted-foreground">Response</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-xl">
                        <p className="text-2xl font-bold text-success">{cleanerData.reliability}%</p>
                        <p className="text-xs text-muted-foreground">Reliability</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {cleanerData.services.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1" asChild>
                        <Link to="/book">Book This Cleaner</Link>
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reliability Score Explanation */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-trust" />
                  Reliability Score Breakdown
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">On-time arrivals</span>
                    <span className="font-medium">97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Job completion rate</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Client approval rate</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Response rate</span>
                    <span className="font-medium">96%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-6">Reviews ({cleanerData.reviews})</h2>
                <div className="space-y-6">
                  {cleanerData.reviewsList.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
