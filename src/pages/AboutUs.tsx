import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Shield, Users, TrendingUp, Heart, Target,
  CheckCircle, Star, Camera, MapPin, Award, Zap, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3 mr-1" />
              Our Story
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Cleaning Services,{' '}
              <span className="text-primary">Rebuilt on Trust</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed font-poppins">
              We started PureTask because finding a reliable cleaner shouldn't feel like a gamble. 
              Every homeowner deserves transparency, accountability, and peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 bg-emerald-500/10 border-emerald-600/40 text-emerald-700 dark:text-emerald-300">
              <Target className="h-3 w-3 mr-1" />
              Our Mission
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Making home cleaning transparent, trustworthy, and stress-free
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Trust First',
                description: 'Every cleaner is background-checked, identity-verified, and rated by real clients.'
              },
              {
                icon: Camera,
                title: 'Photo Verification',
                description: 'GPS check-ins and before/after photos ensure accountability on every job.'
              },
              {
                icon: Heart,
                title: 'Fair for Everyone',
                description: 'Cleaners set their own rates and keep more of their earnings. Clients get transparent pricing.'
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-emerald-500/5 border-emerald-600/30 rounded-xl hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-600/40 mb-4">
                      <item.icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 bg-warning/10 border-warning/30 text-warning-foreground">
                <Zap className="h-3 w-3 mr-1" />
                Why We're Different
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built by people who've been on both sides
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our founders have hired cleaners and worked as cleaners. We understand the frustrations 
                on both sides—and we built PureTask to solve them.
              </p>
              
              <div className="space-y-4">
                {[
                  'No hidden fees or surprise charges',
                  'Real-time job tracking and updates',
                  'Dispute resolution that\'s fair for everyone',
                  'Reliability scores based on actual performance',
                  'Instant booking with verified professionals'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Users, value: '10,000+', label: 'Happy Clients' },
                { icon: Award, value: '2,500+', label: 'Verified Cleaners' },
                { icon: Star, value: '4.9', label: 'Average Rating' },
                { icon: MapPin, value: '50+', label: 'Cities Served' }
              ].map((stat, index) => (
                <Card key={index} className="border-warning/30 bg-warning/5">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 bg-purple-500/10 border-purple-600/40 text-purple-700 dark:text-purple-300">
              <Heart className="h-3 w-3 mr-1" />
              Our Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The principles that guide everything we do
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Integrity',
                description: 'We do what we say, every time. No exceptions.'
              },
              {
                icon: Users,
                title: 'Community',
                description: 'We lift up our cleaners and empower our clients.'
              },
              {
                icon: TrendingUp,
                title: 'Growth',
                description: 'We help cleaners build sustainable careers.'
              },
              {
                icon: Sparkles,
                title: 'Excellence',
                description: 'We never stop improving the experience.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-purple-500/5 border-purple-600/30 hover:border-purple-500/50 transition-colors">
                  <CardContent className="p-6">
                    <value.icon className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to experience the difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of happy clients and verified cleaners on PureTask.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/discover">
                  Find a Cleaner <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
                <Link to="/auth?role=cleaner">
                  Become a Cleaner
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
