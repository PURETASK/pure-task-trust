import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Clock, Shield, Zap, CheckCircle, Star,
  Calendar, TrendingUp, Coffee, Laptop
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';

const painPoints = [
  'Spending weekends cleaning instead of relaxing',
  'Wondering if your cleaner will actually show up',
  'No time to vet or interview cleaners yourself',
  'Stressed about leaving strangers in your home',
  'Can\'t track if the work was actually done',
];

const solutions = [
  'Reclaim your weekends and free time',
  'GPS verified check-ins confirm every visit',
  'Pre-vetted, background-checked professionals',
  'Full accountability with photo documentation',
  'Before/after photos so you know it\'s done right',
];

const features = [
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book recurring cleans that fit your work schedule. Change times as needed.',
  },
  {
    icon: Clock,
    title: 'Time-Saving',
    description: 'Get hours back every week. Focus on work, family, and what matters.',
  },
  {
    icon: Shield,
    title: 'Verified Cleaners',
    description: 'Every cleaner is background-checked and verified before joining.',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description: 'Book in under a minute. No phone calls or back-and-forth needed.',
  },
];

export default function ForProfessionals() {
  return (
    <main className="pt-8">
      <SEO 
        title="Cleaning Services for Busy Professionals"
        description="Reclaim your weekends with verified, reliable cleaning professionals. Instant booking, GPS check-ins, and photo documentation for peace of mind."
        url="/for-professionals"
        keywords="professional cleaning, busy professional cleaning, verified cleaners, reliable cleaning service, house cleaning for professionals"
      />
      {/* Hero */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-pt-cyan/10 to-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge variant="outline" className="mb-6 border-pt-cyan text-pt-cyan">
                <Briefcase className="h-4 w-4 mr-2" />
                For Busy Professionals
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                More Time for{' '}
                <span className="text-pt-cyan">What Matters</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                You work hard. Let verified, reliable cleaners handle your home so you can focus on your career, family, and life.
              </p>
              <Button size="lg" asChild className="bg-pt-cyan hover:bg-pt-cyan/90">
                <Link to="/book">
                  Book Your First Cleaning
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Problem/Solution */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                We Get It—Your Time is Precious
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-destructive/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-destructive">😓 Your Current Reality</h3>
                    <ul className="space-y-3">
                      {painPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-destructive mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-pt-cyan/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-pt-cyan">✨ Life with PureTask</h3>
                    <ul className="space-y-3">
                      {solutions.map((solution, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-pt-cyan mt-0.5 flex-shrink-0" />
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Your Busy Life
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover-lift text-center">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-pt-cyan/10 flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-pt-cyan" />
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

        {/* Time Savings */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Get{' '}
                  <span className="text-pt-cyan">4+ Hours</span>{' '}
                  Back Every Week
                </h2>
                <p className="text-muted-foreground mb-6">
                  The average person spends 4+ hours per week on housework. Imagine what you could do with that time instead.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-pt-cyan" />
                    <span>More time with family and friends</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Laptop className="h-5 w-5 text-pt-cyan" />
                    <span>Focus on career and side projects</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-pt-cyan" />
                    <span>Actually enjoy your weekends</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-pt-cyan/20 to-pt-cyan/5 rounded-3xl p-8">
                  <div className="text-6xl font-bold text-pt-cyan mb-2">4+</div>
                  <div className="text-xl font-semibold mb-1">Hours Saved</div>
                  <div className="text-muted-foreground">Every single week</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container">
            <Card className="bg-gradient-to-r from-pt-cyan to-pt-cyan/80 text-white">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Reclaim Your Time?
                </h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who've made the switch to reliable, verified home cleaning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/book">Book Your First Cleaning</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                    <Link to="/pricing">See Pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
    </main>
  );
}
