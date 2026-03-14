import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Send, MessageSquare, FileText, Mail, Phone, MessageCircle,
  Calendar, AlertCircle, Clock, ShieldAlert, CreditCard, Zap,
  User, MoreHorizontal, ExternalLink, Loader2, CheckCircle,
  HeadphonesIcon, Sparkles, ArrowRight
} from "lucide-react";
import { useCreateTicket, useSupportTickets } from "@/hooks/useSupportTickets";
import { FAQSection } from "@/components/faq/FAQSection";
import { format } from "date-fns";
import { SEO, FAQSchema, BreadcrumbSchema } from "@/components/seo";

const issueTypes = [
  { id: "cancellation", icon: Calendar, label: "Cancellation", color: "text-destructive" },
  { id: "no-show", icon: AlertCircle, label: "No Show", color: "text-destructive" },
  { id: "late-arrival", icon: Clock, label: "Late Arrival", color: "text-warning" },
  { id: "quality", icon: ShieldAlert, label: "Quality Issue", color: "text-[hsl(var(--pt-purple))]" },
  { id: "payment", icon: CreditCard, label: "Payment", color: "text-primary" },
  { id: "technical", icon: Zap, label: "Technical", color: "text-warning" },
  { id: "account", icon: User, label: "Account", color: "text-[hsl(var(--pt-cyan))]" },
  { id: "other", icon: MoreHorizontal, label: "Other", color: "text-[hsl(var(--pt-purple))]" },
];

export default function Help() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [priority, setPriority] = useState("medium");
  const [bookingId, setBookingId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const { mutateAsync: createTicket, isPending } = useCreateTicket();
  const { data: tickets, isLoading: loadingTickets } = useSupportTickets();

  const handleSubmit = async () => {
    if (!selectedIssue || !subject || !description) return;
    await createTicket({ issueType: selectedIssue, priority, subject, description, bookingId: bookingId || undefined });
    setSelectedIssue(null); setPriority("medium"); setBookingId(""); setSubject(""); setDescription("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="warning">Open</Badge>;
      case 'in_progress': return <Badge variant="default">In Progress</Badge>;
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <main className="flex-1">
      <SEO title="Help & Support Center" description="Find answers to common questions, submit a support ticket, or contact the PureTask team. Quick help for clients and cleaners, available 7 days a week." url="/help" keywords="puretask support, cleaning service help" />
      {/* FAQSchema mirrors the full visible FAQ content in the FAQ tab */}
      <FAQSchema faqs={[
        { question: "How do I book a cleaning?", answer: "Click 'Book a Cleaning' from your dashboard, select your cleaning type, choose the date and time, and confirm your booking. Your credits will be held until the job is complete." },
        { question: "Can I cancel or reschedule a booking?", answer: "Yes. You can cancel or reschedule up to 24 hours before your appointment for free. Cancellations within 24 hours may incur a fee. Go to your booking details to make changes." },
        { question: "How far in advance can I book?", answer: "You can book up to 3 months in advance. We recommend booking at least 2–3 days ahead to ensure your preferred cleaner is available." },
        { question: "What if my cleaner doesn't show up?", answer: "If your cleaner fails to arrive, you'll receive a full refund plus $50 bonus credits. We take no-shows very seriously and may suspend cleaners who repeatedly miss appointments." },
        { question: "What are credits?", answer: "Credits are our in-app currency. 1 credit = $1 USD. You purchase credits in advance and use them to book cleanings. All prices shown in dollars are equivalent to credits." },
        { question: "How do credit holds work?", answer: "When you book, we place a hold on your credits (not a charge). After the job, you approve the final amount based on actual time worked, and only then are credits deducted." },
        { question: "Can I get a refund on purchased credits?", answer: "Unused credits can be refunded within 30 days of purchase. Credits used for completed bookings cannot be refunded unless there was a service issue." },
        { question: "How are cleaners vetted?", answer: "All cleaners undergo background checks, identity verification, and must maintain a high reliability score. We also collect reviews from every completed job." },
        { question: "Can I request a specific cleaner?", answer: "Absolutely. Save cleaners to your Favorites and book directly with them. You can also view cleaner profiles before booking to find the right fit." },
        { question: "What if I'm not satisfied with the cleaning?", answer: "Report any issues within 24 hours of job completion through the app. We'll investigate and may offer a partial or full credit refund depending on the situation." },
        { question: "Is my home safe with PureTask cleaners?", answer: "Yes. All cleaners are background-checked, and our rating system ensures quality. You can also review cleaner profiles and read reviews before booking." },
        { question: "What if something is damaged during cleaning?", answer: "Report damages immediately through the Help section. We have a claims process to handle such situations and will work to resolve issues fairly." },
      ]} />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Help & Support', url: '/help' }]} />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-[hsl(var(--pt-aqua)/0.04)] border-b border-border/50">
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative container px-4 sm:px-6 py-12 sm:py-16 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <HeadphonesIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Support Center</h1>
            <p className="text-muted-foreground text-lg">We're here to help — 24/7</p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
        <Tabs defaultValue="submit" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="h-auto p-1.5 gap-1 bg-muted/50 rounded-2xl">
              <TabsTrigger value="submit" className="gap-2 rounded-xl px-5 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Send className="h-4 w-4" /> Submit Ticket
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2 rounded-xl px-5 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4" /> My Tickets
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-2 rounded-xl px-5 py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" /> FAQ
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SUBMIT TICKET */}
          <TabsContent value="submit">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-[hsl(var(--pt-aqua))] p-6 text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                        <Send className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Submit a Support Ticket</h3>
                        <p className="text-primary-foreground/80 text-sm">Typically resolved within 24 hours</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    {/* Issue type grid */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">What do you need help with? *</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {issueTypes.map((issue) => (
                          <button key={issue.id} type="button" onClick={() => setSelectedIssue(issue.id)}
                            className={`p-3 rounded-xl border-2 transition-all text-left group ${
                              selectedIssue === issue.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/30"
                            }`}>
                            <issue.icon className={`h-4 w-4 mb-1.5 ${issue.color}`} />
                            <span className="text-xs font-medium">{issue.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority" className="text-sm font-medium mb-1.5 block">Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low — General question</SelectItem>
                            <SelectItem value="medium">Medium — Needs attention</SelectItem>
                            <SelectItem value="high">High — Urgent issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="booking-id" className="text-sm font-medium mb-1.5 block">Booking ID (optional)</Label>
                        <Input id="booking-id" placeholder="e.g., BK123456" value={bookingId}
                          onChange={(e) => setBookingId(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium mb-1.5 block">Subject *</Label>
                      <Input id="subject" placeholder="Brief summary of your issue" value={subject}
                        onChange={(e) => setSubject(e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium mb-1.5 block">Description *</Label>
                      <Textarea id="description" placeholder="Describe your issue in detail. Include booking ID, dates, cleaner names, etc." rows={5}
                        value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl resize-none" />
                      <p className="text-xs text-muted-foreground mt-1.5">💡 More details = faster resolution</p>
                    </div>
                    <Button size="lg" className="w-full rounded-xl" onClick={handleSubmit}
                      disabled={!selectedIssue || !subject || !description || isPending}>
                      {isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>) : (<><Send className="h-4 w-4 mr-2" />Submit Ticket</>)}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <Card className="border-primary/20 bg-primary/3">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Immediate Help
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: Mail, label: "Email Support", value: "support@puretask.com", sub: "Response in 24 hours", color: "text-primary" },
                        { icon: Phone, label: "Emergency Line", value: "1-800-PURETASK", sub: "Available 24/7", color: "text-foreground" },
                        { icon: MessageCircle, label: "Live Chat", value: "Coming Soon", sub: "Instant support", color: "text-success" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className={`text-sm ${item.color}`}>{item.value}</p>
                            <p className="text-xs text-muted-foreground">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-base mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Cancellation Policy", href: "/cleaner/cancellation-policy" },
                        { label: "How It Works", href: "/" },
                        { label: "Cleaning Scope Guide", href: "/cleaning-scope" },
                        { label: "Pricing Explained", href: "/pricing" },
                      ].map((link) => (
                        <a key={link.label} href={link.href}
                          className="flex items-center justify-between text-sm py-2 hover:text-primary transition-colors border-b border-border/40 last:border-0">
                          {link.label}
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* MY TICKETS */}
          <TabsContent value="tickets">
            {loadingTickets ? (
              <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="hover:shadow-elevated transition-all">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize self-start">
                            {ticket.issue_type.replace('-', ' ')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 border-dashed">
                <CardContent>
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4 opacity-60" />
                  <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-4">You haven't submitted any support tickets</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <FAQSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
