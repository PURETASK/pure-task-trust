import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { HelpCircle, Shield, CreditCard, Clock, MessageCircle, FileText, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How does PureTask ensure trust?",
    answer: "Every job includes GPS check-in/check-out verification, before & after photos, and an approval step before payment is released. Your credits are held in escrow until you're satisfied with the work.",
  },
  {
    question: "What happens if I'm not satisfied?",
    answer: "If you're not happy with the cleaning, you can report an issue before approving payment. Our support team will review and help resolve the situation fairly.",
  },
  {
    question: "How does the credit system work?",
    answer: "Credits are PureTask's currency (1 credit = $1). When you book, credits are held as a deposit. Only the time actually worked is charged, and unused credits are automatically refunded.",
  },
  {
    question: "Can I get a cash refund for credits?",
    answer: "Credits cannot be refunded to cash—they can only be used for future bookings. This helps us keep the platform running smoothly and prices fair.",
  },
  {
    question: "Are cleaners employees of PureTask?",
    answer: "No, cleaners are independent contractors who set their own rates and schedules. PureTask is a marketplace that connects clients with vetted, professional cleaners.",
  },
  {
    question: "How are cleaners verified?",
    answer: "All cleaners undergo identity verification and background checks. They also build reliability scores based on on-time arrivals, job completion, and client approval rates.",
  },
  {
    question: "What if my cleaner cancels?",
    answer: "If a cleaner cancels, your held credits are immediately released and you can book another cleaner. We're building features to help match you quickly with available cleaners.",
  },
  {
    question: "Can I tip my cleaner?",
    answer: "Yes! You can add a tip after approving the job. Tips go directly to your cleaner with no platform fees.",
  },
];

const sections = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "How we keep you and your home safe",
  },
  {
    icon: CreditCard,
    title: "Payments & Credits",
    description: "Understanding the credit system",
  },
  {
    icon: Clock,
    title: "Booking Process",
    description: "From booking to approval",
  },
  {
    icon: MessageCircle,
    title: "Support",
    description: "Get help when you need it",
  },
];

export default function Help() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Help Center</h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Everything you need to know about using PureTask safely and confidently
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-4 gap-4 mb-12">
              {sections.map((section) => (
                <Card key={section.title} className="hover:shadow-elevated transition-all cursor-pointer">
                  <CardContent className="p-5 text-center">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ */}
            <Card className="mb-12">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact & Legal */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Contact Support</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <p className="text-sm">
                    Email: <a href="mailto:support@puretask.com" className="text-primary hover:underline">support@puretask.com</a>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Legal</h3>
                  </div>
                  <div className="space-y-2">
                    <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </a>
                    <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                    <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Cleaner Agreement
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
