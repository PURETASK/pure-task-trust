import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Shield, Users, Baby, CheckCircle, Star,
  Home, Sparkles, Award, Clock, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';

const safetyFeatures = [
  {
    icon: Shield,
    title: 'Verified & Background Checked',
    description: 'Every cleaner passes comprehensive background checks and identity verification. We take safety seriously because you do.',
  },
  {
    icon: Baby,
    title: 'Child-Safe Products',
    description: 'Request cleaners who use eco-friendly, non-toxic products safe for kids and pets.',
  },
  {
    icon: Star,
    title: 'Family-Experienced Cleaners',
    description: 'Work with cleaners who understand the unique needs of homes with children.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book around nap times, school schedules, and family activities.',
  },
];

const benefits = [
  'GPS check-in/check-out verification',
  'Before & after photo documentation',
  'Background-checked cleaners only',
  'Child and pet-safe cleaning options',
  'Same cleaner for recurring visits',
  'Easy rebooking and rescheduling',
];

export default function ForFamilies() {
  return (
    <main className="pt-8">
      <SEO 
        title="Safe Cleaning for Families with Kids"
        description="Background-checked cleaners who understand families with kids and pets. Child-safe cleaning products, GPS verification, and photo documentation."
        url="/for-families"
        keywords="family cleaning, child safe cleaning, pet safe cleaning, background checked cleaners, family friendly cleaners"
      />
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-pt-green/10 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 border-pt-green text-pt-green">
              <Users className="h-4 w-4 mr-2" />
              For Families with Kids
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Safe, Trusted Cleaners{' '}
              <span className="text-pt-green">Your Family Can Count On</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Background-checked cleaners who understand families with kids, pets, and the need for child-safe products.
            </p>
            <Button size="lg" asChild className="bg-pt-green hover:bg-pt-green/90">
              <Link to="/discover">
                Find a Family-Friendly Cleaner
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Safety First, Always
            </h2>
            <p className="text-muted-foreground text-lg">
              When kids are involved, there's no room for shortcuts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-lift">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-pt-green/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-pt-green" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Checklist */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Peace of Mind for{' '}
                <span className="text-pt-green">Busy Parents</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                We know how hard it is to balance work, kids, and keeping a clean home. That's why we've built a service that parents can truly trust.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-pt-green flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-pt-green/5 border-pt-green/20">
                <CardContent className="p-8">
                  <Heart className="h-12 w-12 text-pt-green mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Family-First Guarantee</h3>
                  <p className="text-muted-foreground mb-6">
                    If you're ever unsatisfied with a cleaning, we'll send another cleaner at no extra cost. Your family deserves the best.
                  </p>
                  <Button asChild className="bg-pt-green hover:bg-pt-green/90">
                    <Link to="/book">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <Card className="bg-gradient-to-r from-pt-green to-pt-green/80 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Give Your Family the Clean Home They Deserve
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Trusted by thousands of families. Background-checked cleaners. Child-safe options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/book">Book a Cleaning</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/discover">Meet Our Cleaners</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
