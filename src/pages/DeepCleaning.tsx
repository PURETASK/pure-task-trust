import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";

const DEEP_TASKS = [
  "Everything in a standard clean",
  "Inside oven & microwave",
  "Inside refrigerator & freezer",
  "Baseboards & door frames",
  "Light fixtures & ceiling fans",
  "Window sills & tracks",
  "Cabinet fronts (inside on request)",
  "Behind & under furniture",
  "Grout scrubbing in bathrooms",
  "Detailed kitchen degreasing",
  "Light switch & outlet plate cleaning",
  "Vent & register dusting",
];

export default function DeepCleaning() {
  return (
    <main className="overflow-x-hidden">
      <SEO
        title="Deep Cleaning Services"
        description="Professional deep cleaning with verified cleaners. Includes inside appliances, baseboards, light fixtures, and more. GPS check-ins, photo proof, and escrow protection."
        url="/deep-cleaning"
        keywords="deep cleaning, deep house cleaning, thorough cleaning service, spring cleaning, detailed cleaning"
      />

      <section className="py-20 sm:py-28 bg-gradient-to-br from-[hsl(var(--pt-purple)/0.08)] via-background to-background">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.2)]">Deep Cleaning</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5">
              Top-to-bottom{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--pt-purple))] to-primary bg-clip-text text-transparent">deep clean</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Everything in a standard clean plus inside appliances, baseboards, light fixtures, grout scrubbing, and every hard-to-reach surface. Verified cleaners with photo proof.
            </p>
            <Button size="lg" asChild className="rounded-2xl h-14 px-8 shadow-elevated">
              <Link to="/book">Book Deep Cleaning <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">What deep cleaning covers</h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Deep cleaning includes every standard clean task plus detailed attention to areas that accumulate grime over time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEEP_TASKS.map((task, i) => (
              <motion.div key={task} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Card className="border-2 border-border/50 rounded-2xl">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--pt-purple))] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{task}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8">
            <Link to="/cleaning-scope" className="text-primary hover:underline underline-offset-4 font-medium text-sm">
              Compare all cleaning types →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">When to book a deep clean</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto">
            {["Seasonal spring or fall refresh", "Before hosting guests or events", "Moving into a new home"].map((reason) => (
              <Card key={reason} className="border-2 border-[hsl(var(--pt-purple)/0.3)] rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-[hsl(var(--pt-purple))] mx-auto mb-3" />
                  <p className="font-medium text-sm">{reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-br from-[hsl(var(--pt-purple)/0.05)] via-background to-background">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Book your deep clean today</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Verified cleaners. GPS check-ins. Photo proof of every surface. Escrow protection until you approve.</p>
          <Button size="lg" asChild className="rounded-2xl h-14 px-10 shadow-elevated">
            <Link to="/book">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
