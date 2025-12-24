import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Home, Clock, Star, Zap, CheckCircle, Camera,
  Calendar, DollarSign, Award, TrendingUp, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Clock,
    title: 'Same-Day Turnovers',
    description: 'Guest checking out at 11am, next one at 3pm? We will have your place spotless in between.',
  },
  {
    icon: Camera,
    title: 'Photo Documentation',
    description: 'Every cleaning includes timestamped before/after photos so you can verify from anywhere.',
  },
  {
    icon: Star,
    title: 'Protect Your Rating',
    description: 'Consistent, high-quality cleans help maintain your 5-star guest reviews.',
  },
  {
    icon: Shield,
    title: 'Verified Cleaners',
    description: 'All cleaners are background-checked and trained for short-term rental standards.',
  },
  {
    icon: Calendar,
    title: 'Recurring Schedules',
    description: 'Set up regular cleans that sync with your booking calendar automatically.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'No hidden fees. Know exactly what you\'ll pay before booking.',
  },
];

const stats = [
  { value: '2hr', label: 'Average Turnover Time' },
  { value: '99%', label: 'On-Time Rate' },
  { value: '4.9★', label: 'Host Rating' },
  { value: '5K+', label: 'Turnovers Completed' },
];

export default function ForAirbnbHosts() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-pt-amber/10 to-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge variant="outline" className="mb-6 border-pt-amber text-pt-amber">
                <Home className="h-4 w-4 mr-2" />
                For Airbnb & Short-Term Rental Hosts
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Turnover Cleaning,{' '}
                <span className="text-pt-amber">Perfected</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Fast, reliable, photo-documented cleaning between guests. Keep your 5-star rating with verified cleaners.
              </p>
              <Button size="lg" asChild className="bg-pt-amber hover:bg-pt-amber/90">
                <Link to="/book">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Turnover Cleaning
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for the Demands of Airbnb Hosting
              </h2>
              <p className="text-muted-foreground text-lg">
                Your guests expect perfection. So do we.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover-lift">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-pt-amber/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-pt-amber" />
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

        {/* Stats */}
        <section className="py-20">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-pt-amber mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How Turnover Cleaning Works
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Book Online', desc: 'Schedule your turnover with checkout/checkin times' },
                { step: '2', title: 'We Match', desc: 'Get paired with a verified cleaner in your area' },
                { step: '3', title: 'Cleaning Done', desc: 'Pro cleaning with photo documentation' },
                { step: '4', title: 'Ready for Guests', desc: 'Your property is spotless and guest-ready' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-pt-amber text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container">
            <Card className="bg-gradient-to-r from-pt-amber to-pt-amber/80 text-white">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Simplify Your Turnovers?
                </h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of hosts who trust PureTask for reliable, documented cleaning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/book">Book Your First Turnover</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                    <Link to="/discover">Browse Cleaners</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
