import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SEO } from '@/components/seo';
import { Heart, Shield, Phone, Users, Star, ArrowRight } from 'lucide-react';

const safetyFeatures = [
  { icon: Shield, title: 'Background Checked', description: 'Every single cleaner undergoes a comprehensive background check and identity verification. Trust that\'s earned.', color: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))]" },
  { icon: Star, title: 'Reliable & Consistent', description: 'Same trusted cleaner for recurring visits. Build a real relationship with someone you know and trust over time.', color: "bg-warning/10 text-warning" },
  { icon: Phone, title: 'Easy Communication', description: 'Clear, simple booking process. Our support team is always available to help you with anything, anytime.', color: "bg-primary/10 text-primary" },
  { icon: Heart, title: 'Respectful Service', description: 'Cleaners trained to be courteous, patient, and deeply respectful of your home and your privacy always.', color: "bg-destructive/10 text-destructive" },
];

const testimonials = [
  { quote: "Finally, a cleaning service I can trust. The same cleaner comes every week and she's absolutely wonderful.", name: "Margaret T.", age: "72", initials: "MT" },
  { quote: "My daughter helped me set it up. Now I look forward to my Thursday cleanings — it's wonderful peace of mind!", name: "Robert M.", age: "68", initials: "RM" },
];

const steps = [
  { step: '01', title: 'Book Online or Call', desc: 'Choose your date and time. Need help? Our team is here for you.' },
  { step: '02', title: 'Meet Your Cleaner', desc: 'Same trusted person for every recurring visit. Consistency matters.' },
  { step: '03', title: 'Enjoy Your Home', desc: 'Relax while we take care of everything. Verified, documented, reliable.' },
];

export default function ForRetirees() {
  return (
    <main className="pt-8">
      <SEO title="Trusted Cleaning for Seniors & Retirees" description="Reliable, respectful cleaning services for seniors. Background-checked cleaners, consistent scheduling, and easy communication." url="/for-retirees" keywords="senior cleaning, cleaning for retirees, elderly cleaning service" />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pt-purple)/0.1)] via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--pt-purple)) 1.5px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-[hsl(var(--pt-purple)/0.4)] text-[hsl(var(--pt-purple))] bg-[hsl(var(--pt-purple)/0.05)] px-4 py-1.5">
              <Heart className="h-3.5 w-3.5 mr-2" /> For Seniors & Retirees
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[0.95]">
              Enjoy Your<br />Home — We'll<br />
              <span className="text-[hsl(var(--pt-purple))]">Handle the Rest.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Safe, reliable cleaning with the accountability and transparency you deserve. Because peace of mind should never be a luxury.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-[hsl(var(--pt-purple))] hover:bg-[hsl(var(--pt-purple)/0.9)] text-white rounded-2xl h-14 px-8 text-base font-semibold">
                <Link to="/discover"><Heart className="mr-2 h-5 w-5" />Find a Trusted Cleaner</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-2xl h-14 px-8">
                <Link to="/book">Book a Cleaning <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Safety is Our Priority</h2>
            <p className="text-muted-foreground text-lg">Trust is earned, not given. That's why we go above and beyond.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {safetyFeatures.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:shadow-elevated hover:border-[hsl(var(--pt-purple)/0.3)] transition-all duration-200">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-2xl ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple & Straightforward</h2>
            <p className="text-muted-foreground text-lg">No complicated apps. No confusing processes.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {steps.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--pt-purple))] text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/20 border-y border-border/50">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Trusted by Seniors Like You</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-[hsl(var(--pt-purple)/0.2)]">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-warning text-warning" />)}
                    </div>
                    <p className="text-base mb-5 leading-relaxed italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[hsl(var(--pt-purple)/0.15)] flex items-center justify-center">
                        <span className="text-[hsl(var(--pt-purple))] font-bold text-sm">{t.initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">Age {t.age}</p>
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
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="bg-gradient-to-br from-[hsl(var(--pt-purple)/0.12)] to-[hsl(var(--pt-purple)/0.04)] border-[hsl(var(--pt-purple)/0.3)]">
              <CardContent className="p-10 md:p-14 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Worry-Free Cleaning?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of seniors who trust PureTask for safe, reliable, consistent home cleaning.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-[hsl(var(--pt-purple))] hover:bg-[hsl(var(--pt-purple)/0.9)] text-white rounded-2xl h-12">
                    <Link to="/book">Book Your First Cleaning</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-2xl h-12">
                    <Link to="/help">Talk to Our Team</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
