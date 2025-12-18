import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

const issueTypes = [
  { id: "cancellation", icon: Calendar, label: "Cancellation", color: "text-pt-red" },
  { id: "no-show", icon: AlertCircle, label: "No Show", color: "text-pt-red" },
  { id: "late-arrival", icon: Clock, label: "Late Arrival", color: "text-pt-amber" },
  { id: "quality", icon: ShieldAlert, label: "Quality Issue", color: "text-pt-purple" },
  { id: "payment", icon: CreditCard, label: "Payment", color: "text-pt-blue" },
  { id: "technical", icon: Zap, label: "Technical", color: "text-pt-amber" },
  { id: "account", icon: User, label: "Account", color: "text-pt-cyan" },
  { id: "other", icon: MoreHorizontal, label: "Other", color: "text-pt-purple" },
];

const quickLinks = [
  { label: "Cancellation Policy", href: "#" },
  { label: "Damage & Claims", href: "#" },
  { label: "How It Works", href: "/help" },
];

export default function Help() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Support Center</h1>
              <p className="text-muted-foreground">We're here to help you 24/7</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="submit" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </TabsTrigger>
                <TabsTrigger value="tickets" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  My Tickets
                </TabsTrigger>
                <TabsTrigger value="faq" className="gap-2">
                  <FileText className="h-4 w-4" />
                  FAQ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="submit">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Form */}
                  <div className="lg:col-span-2">
                    <Card className="overflow-hidden">
                      {/* Form Header */}
                      <div className="gradient-brand text-white p-6">
                        <div className="flex items-center gap-3">
                          <Send className="h-5 w-5" />
                          <div>
                            <h2 className="text-lg font-semibold">Submit a Support Ticket</h2>
                            <p className="text-white/80 text-sm">We typically respond within 24 hours</p>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-6">
                        {/* Issue Type */}
                        <div>
                          <Label className="text-base mb-4 block">
                            What do you need help with? *
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {issueTypes.map((issue) => (
                              <button
                                key={issue.id}
                                type="button"
                                onClick={() => setSelectedIssue(issue.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                  selectedIssue === issue.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <issue.icon className={`h-5 w-5 mb-2 ${issue.color}`} />
                                <span className="text-sm font-medium">{issue.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority & Booking ID */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select defaultValue="medium">
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
                            <Input id="booking-id" placeholder="e.g., BK123456" />
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input id="subject" placeholder="Brief summary of your issue" />
                        </div>

                        {/* Description */}
                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            placeholder="Please provide as much detail as possible about your issue. Include booking ID, dates, cleaner names, etc."
                            rows={5}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Tip: More details help us resolve your issue faster
                          </p>
                        </div>

                        <Button size="lg" className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Ticket
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
                              <p className="text-sm text-pt-green">Coming Soon</p>
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
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Submit a ticket to get help from our support team
                    </p>
                    <Button>Submit Your First Ticket</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      FAQ section coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
