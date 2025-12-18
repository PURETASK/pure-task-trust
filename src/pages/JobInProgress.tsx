import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, MapPin, Clock, MessageCircle, Camera, Navigation } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

const timelineSteps = [
  { id: "accepted", label: "Accepted", time: "9:00 AM" },
  { id: "onway", label: "On the way", time: "9:15 AM" },
  { id: "checkedin", label: "Checked in", time: "9:32 AM" },
  { id: "inprogress", label: "In progress", time: null },
];

export default function JobInProgress() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(3); // In progress

  const job = {
    cleaner: {
      name: "Sarah Mitchell",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    address: "123 Main Street, Apt 4B",
    creditsHeld: 105,
    startTime: "9:32 AM",
    estimatedEnd: "12:30 PM",
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
            {/* Status */}
            <div className="text-center mb-8">
              <Badge variant="active" className="mb-4">In Progress</Badge>
              <h1 className="text-2xl font-bold mb-2">Cleaning in Progress</h1>
              <p className="text-muted-foreground">Started at {job.startTime}</p>
            </div>

            {/* Cleaner Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={job.cleaner.image}
                      alt={job.cleaner.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-success-foreground animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.cleaner.name}</h3>
                    <p className="text-sm text-muted-foreground">Currently cleaning</p>
                  </div>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* GPS Indicator */}
                <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">GPS Verified Location</p>
                    <p className="text-xs text-muted-foreground">{job.address}</p>
                  </div>
                  <Badge variant="success" className="gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    Live
                  </Badge>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            index <= currentStep
                              ? "bg-primary text-primary-foreground"
                              : "bg-border text-muted-foreground"
                          }`}
                        >
                          {index < currentStep ? (
                            <Check className="h-4 w-4" />
                          ) : index === currentStep ? (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${
                              index < currentStep ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-8">
                        <p className={`font-medium ${index <= currentStep ? "" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-sm text-muted-foreground">{step.time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Credits Locked Notice */}
            <Card className="mb-6 bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Credits held: {job.creditsHeld}</p>
                    <p className="text-xs text-muted-foreground">Released after your approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Action */}
            <Button className="w-full" asChild>
              <Link to={`/job/${id}/approve`}>Simulate: Job Completed</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              This button simulates the job being completed for demo purposes
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
