import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  FileText,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  AlertCircle,
  Clock,
  ShieldAlert,
  CreditCard,
  Zap,
  User,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useCreateTicket, useSupportTickets } from "@/hooks/useSupportTickets";
import { FAQSection } from "@/components/faq/FAQSection";
import { format } from "date-fns";

const issueTypes = [
  { id: "cancellation", icon: Calendar, label: "Cancellation", color: "text-destructive" },
  { id: "no-show", icon: AlertCircle, label: "No Show", color: "text-destructive" },
  { id: "late-arrival", icon: Clock, label: "Late Arrival", color: "text-warning" },
  { id: "quality", icon: ShieldAlert, label: "Quality Issue", color: "text-violet-500" },
  { id: "payment", icon: CreditCard, label: "Payment", color: "text-primary" },
  { id: "technical", icon: Zap, label: "Technical", color: "text-warning" },
  { id: "account", icon: User, label: "Account", color: "text-cyan-500" },
  { id: "other", icon: MoreHorizontal, label: "Other", color: "text-violet-500" },
];

const quickLinks = [
  { label: "Cancellation Policy", href: "/cleaner/cancellation-policy" },
  { label: "How It Works", href: "/" },
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

    await createTicket({
      issueType: selectedIssue,
      priority,
      subject,
      description,
      bookingId: bookingId || undefined,
    });

    // Reset form
    setSelectedIssue(null);
    setPriority("medium");
    setBookingId("");
    setSubject("");
    setDescription("");
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
    <main className="flex-1 py-4 sm:py-8">
      <div className="container px-4 sm:px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Support Center</h1>
              <p className="text-sm sm:text-base text-muted-foreground">We're here to help you 24/7</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="submit" className="w-full">
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
                <TabsList className="w-max sm:w-full sm:max-w-md mx-auto grid grid-cols-3">
                  <TabsTrigger value="submit" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Submit</span> Ticket
                  </TabsTrigger>
                  <TabsTrigger value="tickets" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">My</span> Tickets
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    FAQ
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="submit">
                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Main Form */}
                  <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                      {/* Form Header */}
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <Send className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <h2 className="text-base sm:text-lg font-semibold">Submit a Support Ticket</h2>
                            <p className="text-primary-foreground/80 text-xs sm:text-sm">We typically respond within 24 hours</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Issue Type */}
                        <div>
                          <Label className="text-sm sm:text-base mb-3 sm:mb-4 block">
                            What do you need help with? *
                          </Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {issueTypes.map((issue) => (
                              <button
                                key={issue.id}
                                type="button"
                                onClick={() => setSelectedIssue(issue.id)}
                                className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                  selectedIssue === issue.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <issue.icon className={`h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 ${issue.color}`} />
                                <span className="text-xs sm:text-sm font-medium">{issue.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority & Booking ID */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low - General question</SelectItem>
                                <SelectItem value="medium">Medium - Issue needs attention</SelectItem>
                                <SelectItem value="high">High - Urgent issue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="booking-id">Booking ID (if applicable)</Label>
                            <Input 
                              id="booking-id" 
                              placeholder="e.g., BK123456" 
                              value={bookingId}
                              onChange={(e) => setBookingId(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input 
                            id="subject" 
                            placeholder="Brief summary of your issue"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="Please provide as much detail as possible about your issue. Include booking ID, dates, cleaner names, etc."
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Tip: More details help us resolve your issue faster
                          </p>
                        </div>

                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={handleSubmit}
                          disabled={!selectedIssue || !subject || !description || isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Ticket
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Immediate Help */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Need Immediate Help?</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Email Support</p>
                              <p className="text-sm text-primary">support@puretask.com</p>
                              <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Emergency Line</p>
                              <p className="text-sm">1-800-PURETASK</p>
                              <p className="text-xs text-muted-foreground">Available 24/7</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Live Chat</p>
                              <p className="text-sm text-success">Coming Soon</p>
                              <p className="text-xs text-muted-foreground">Instant support via chat</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <div className="space-y-3">
                          {quickLinks.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                            >
                              {link.label}
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tickets">
                {loadingTickets ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : tickets && tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{ticket.subject}</h3>
                                {getStatusBadge(ticket.status)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {ticket.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Submitted {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {ticket.issue_type.replace('-', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't submitted any support tickets
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="faq">
                <Card>
                  <CardContent className="p-6">
                    <FAQSection />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
      </div>
    </main>
  );
}
