import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import heroMoveOut from "@/assets/hero-move-out.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Home } from "lucide-react";

const MOVEOUT_TASKS = [
  "Full deep clean of every room",
  "Inside all cabinets & drawers",
  "Inside oven, fridge, dishwasher",
  "Window cleaning (interior)",
  "Wall spot cleaning & scuff removal",
  "Light fixtures & ceiling fans",
  "Closet interiors",
  "Baseboards & door frames",
  "Garage sweep (if applicable)",
  "Final walkthrough photo set",
];

export default function MoveOutCleaning() {
  return (
    <main className="overflow-x-hidden">
      <SEO
        title="Move-Out Cleaning Services"
        description="Professional move-out cleaning for tenants and landlords. Inside cabinets, appliances, walls, and fixtures. GPS-verified cleaners with photo documentation and escrow protection."
        url="/move-out-cleaning"
        keywords="move out cleaning, end of lease cleaning, move out clean, tenant cleaning, landlord cleaning service"
      />

      <section className="py-20 sm:py-28 bg-gradient-to-br from-warning/5 via-background to-background">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-warning/10 text-warning border-warning/20">Move-Out Cleaning</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              Leave it{" "}
              <span className="bg-gradient-to-r from-warning to-[hsl(var(--pt-orange))] bg-clip-text text-transparent">spotless</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Comprehensive end-of-tenancy cleaning that covers every cabinet, appliance, wall, and fixture. Photo-documented so you have proof for your landlord or new buyer.
            </p>
            <Button size="lg" asChild className="rounded-2xl h-14 px-8 shadow-elevated">
              <Link to="/book">Book Move-Out Clean <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What's covered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {MOVEOUT_TASKS.map((task, i) => (
              <motion.div key={task} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Card className="border-2 border-border/50 rounded-2xl">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{task}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container text-center max-w-2xl mx-auto">
          <Home className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Perfect for tenants & landlords</h2>
          <p className="text-muted-foreground mb-4">
            Get your deposit back or prepare a property for new tenants. Our cleaners document every room with timestamped photos so you have verifiable proof of condition.
          </p>
          <p className="text-muted-foreground">
            Credits are held in escrow until you approve the work. If anything is missed, open a dispute within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-br from-warning/5 via-background to-background">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to move out stress-free?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Book online in 60 seconds. Verified cleaner. Photo proof. Escrow protection.</p>
          <Button size="lg" asChild className="rounded-2xl h-14 px-10 shadow-elevated">
            <Link to="/book">Book Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
