import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Shield, Phone, Users, CheckCircle, Star,
  Home, Calendar, Award, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const safetyFeatures = [
  {
    icon: Shield,
    title: 'Background Checked',
    description: 'Every single cleaner undergoes a comprehensive background check and identity verification before they can accept jobs.',
  },
  {
    icon: Star,
    title: 'Reliable & Consistent',
    description: 'Same trusted cleaner for recurring visits. Build a relationship with someone you know and trust.',
  },
  {
    icon: Phone,
    title: 'Easy Communication',
    description: 'Clear, simple booking process. Our support team is always available to help.',
  },
  {
    icon: Heart,
    title: 'Respectful Service',
    description: 'Cleaners trained to be courteous, patient, and respectful of your home and privacy.',
  },
];

const testimonials = [
  {
    quote: "Finally, a cleaning service I can trust. The same cleaner comes every week and she's wonderful.",
    name: "Margaret T.",
    age: "72",
  },
  {
    quote: "My daughter helped me set it up. Now I look forward to my Thursday cleanings!",
    name: "Robert M.",
    age: "68",
  },
];

export default function ForRetirees() {
  return (
    <main className="pt-8">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-pt-purple/10 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 border-pt-purple text-pt-purple">
              <Heart className="h-4 w-4 mr-2" />
              For Seniors & Retirees
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Enjoy Your Home,{' '}
              <span className="text-pt-purple">We'll Handle the Rest</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Safe, reliable cleaning service with the accountability and transparency you deserve. Because peace of mind should not be a luxury.
            </p>
            <Button size="lg" asChild className="bg-pt-purple hover:bg-pt-purple/90">
              <Link to="/discover">
                Find a Trusted Cleaner
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
              Your Safety is Our Priority
            </h2>
            <p className="text-muted-foreground text-lg">
              We know trust is earned, not given. That's why we go above and beyond.
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
                    <div className="h-12 w-12 rounded-xl bg-pt-purple/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-pt-purple" />
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

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple & Straightforward
            </h2>
            <p className="text-muted-foreground text-lg">
              No complicated apps or confusing processes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Book Online or Call', desc: 'Choose your date and time. Need help? Our team is here.' },
              { step: '2', title: 'Meet Your Cleaner', desc: 'Same trusted person for recurring visits.' },
              { step: '3', title: 'Enjoy Your Home', desc: 'Relax while we take care of the cleaning.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="h-14 w-14 rounded-full bg-pt-purple text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Seniors Like You
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-pt-purple/10 flex items-center justify-center">
                        <span className="text-pt-purple font-semibold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">Age {testimonial.age}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-r from-pt-purple to-pt-purple/80 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready for Worry-Free Cleaning?
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of seniors who trust PureTask for safe, reliable home cleaning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/book">Book Your First Cleaning</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/help">Talk to Our Team</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
