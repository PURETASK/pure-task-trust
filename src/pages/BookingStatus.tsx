import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Check, X, Calendar, MapPin, Star, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

export default function BookingStatus() {
  const { id } = useParams();
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">("pending");

  // Mock booking data
  const booking = {
    id: "1",
    type: "Standard Clean",
    date: "Dec 20, 2024",
    time: "9:00 AM",
    address: "123 Main Street, Apt 4B",
    credits: 105,
    cleaner: {
      name: "Sarah Mitchell",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      rating: 4.9,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Status Header */}
            <div className="text-center mb-8">
              {status === "pending" && (
                <>
                  <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-10 w-10 text-warning animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Awaiting Response</h1>
                  <p className="text-muted-foreground">We're finding the perfect cleaner for you</p>
                </>
              )}
              {status === "accepted" && (
                <>
                  <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-10 w-10 text-success" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
                  <p className="text-muted-foreground">Your cleaner has accepted the job</p>
                </>
              )}
              {status === "declined" && (
                <>
                  <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <X className="h-10 w-10 text-destructive" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Booking Declined</h1>
                  <p className="text-muted-foreground">Don't worry, we'll find another cleaner</p>
                </>
              )}
            </div>

            {/* Booking Details */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <img
                    src={booking.cleaner.image}
                    alt={booking.cleaner.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{booking.cleaner.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {booking.cleaner.rating}
                    </div>
                  </div>
                  <Badge variant={status === "pending" ? "pending" : status === "accepted" ? "success" : "destructive"}>
                    {status === "pending" ? "Pending" : status === "accepted" ? "Confirmed" : "Declined"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.date}</p>
                      <p className="text-sm text-muted-foreground">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <p className="text-muted-foreground">{booking.address}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground">{booking.type}</span>
                  <span className="font-semibold">{booking.credits} credits held</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions based on status */}
            {status === "pending" && (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setStatus("accepted")}
                >
                  Simulate: Cleaner Accepts
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-destructive"
                  onClick={() => setStatus("declined")}
                >
                  Simulate: Cleaner Declines
                </Button>
              </div>
            )}

            {status === "accepted" && (
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to={`/job/${id}`}>View Job Details</Link>
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Message Cleaner
                </Button>
              </div>
            )}

            {status === "declined" && (
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/discover">Find Another Cleaner</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
