import {
  Briefcase, Clock, DollarSign, MessageSquare, Search, Calendar,
  BarChart3, BookOpen, Settings, TrendingUp, Gift, Users,
  Lightbulb, Star, Zap, Shield, Camera, MapPin, Award,
  Phone, Flame, Target, Bot,
} from "lucide-react";

export const TIPS = [
  { icon: "📸", text: "Upload before & after photos — cleaners with photo proof get 23% more repeat bookings." },
  { icon: "⏰", text: "Respond to job offers within 15 mins to boost your acceptance rate and reliability score." },
  { icon: "⭐", text: "5-star reviews unlock Gold tier. A friendly check-in message after every job goes a long way." },
  { icon: "💰", text: "Set your rate closer to your tier ceiling — clients associate higher rates with higher quality." },
  { icon: "📅", text: "Keep your availability calendar up to date so the system auto-assigns you the best matches." },
  { icon: "🤝", text: "Refer a cleaner friend and earn credits. Every referral counts toward your monthly goals." },
  { icon: "🔄", text: "Returning clients are worth 3× a new booking. Leave a thank-you note after every job." },
  { icon: "🚀", text: "Use the Boost feature on slow weeks — it surfaces your profile first in the marketplace." },
];

export const TIER_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  bronze:   { bg: "bg-amber-500/10",  text: "text-amber-600",  border: "border-amber-500/30",  gradient: "from-amber-500/20 to-amber-600/5" },
  silver:   { bg: "bg-slate-400/10",  text: "text-slate-500",  border: "border-slate-400/30",  gradient: "from-slate-400/20 to-slate-500/5" },
  gold:     { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/30", gradient: "from-yellow-400/20 to-yellow-600/5" },
  platinum: { bg: "bg-cyan-500/10",   text: "text-cyan-600",   border: "border-cyan-500/30",   gradient: "from-cyan-400/20 to-cyan-600/5" },
};

export const FEATURE_SECTIONS = [
  {
    title: "💼 Jobs & Work",
    color: "bg-primary/5 border-primary/15",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    items: [
      { icon: Search,    label: "Job Marketplace", desc: "Find new opportunities",      href: "/cleaner/marketplace" },
      { icon: Briefcase, label: "Active Jobs",      desc: "Manage accepted jobs",       href: "/cleaner/jobs" },
      { icon: Calendar,  label: "Schedule",         desc: "Your job calendar",          href: "/cleaner/schedule" },
      { icon: MapPin,    label: "Service Areas",    desc: "Your coverage zones",        href: "/cleaner/service-areas" },
    ],
  },
  {
    title: "💰 Money & Earnings",
    color: "bg-success/5 border-success/15",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    items: [
      { icon: DollarSign, label: "Earnings & Payouts", desc: "Track income, request payouts", href: "/cleaner/earnings" },
      { icon: BarChart3,  label: "Analytics",           desc: "Your performance metrics",     href: "/cleaner/analytics" },
      { icon: Zap,        label: "Instant Payout",      desc: "Get paid now",                 href: "/cleaner/earnings" },
      { icon: Target,     label: "Goals & Rewards",     desc: "Monthly earning goals",        href: "/cleaner/dashboard" },
    ],
  },
  {
    title: "⭐ Profile & Trust",
    color: "bg-warning/5 border-warning/15",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    items: [
      { icon: Shield,     label: "Verification",    desc: "ID, background & badges",  href: "/cleaner/verification" },
      { icon: TrendingUp, label: "Reliability Score", desc: "How your score works",   href: "/cleaner/reliability" },
      { icon: Star,       label: "Reviews",          desc: "Your ratings & feedback", href: "/reviews" },
      { icon: Award,      label: "Tier Progress",    desc: "Bronze → Platinum path",  href: "/cleaner/dashboard" },
    ],
  },
  {
    title: "🛠️ Tools & Settings",
    color: "bg-[hsl(var(--pt-purple)/0.05)] border-[hsl(var(--pt-purple)/0.15)]",
    iconBg: "bg-[hsl(var(--pt-purple)/0.1)]",
    iconColor: "text-[hsl(var(--pt-purple))]",
    items: [
      { icon: Clock,        label: "Availability",    desc: "Set working hours & time off", href: "/cleaner/availability" },
      { icon: Settings,     label: "Profile Settings", desc: "Rates, services & info",      href: "/cleaner/profile" },
      { icon: Users,        label: "My Team",          desc: "Manage team members",          href: "/cleaner/team" },
      { icon: MessageSquare, label: "Messages",        desc: "Chat with clients",            href: "/cleaner/messages" },
    ],
  },
  {
    title: "📚 Growth & Resources",
    color: "bg-accent/5 border-accent/15",
    iconBg: "bg-accent/10",
    iconColor: "text-primary",
    items: [
      { icon: BookOpen, label: "Resources & Tips",  desc: "Training & education",      href: "/cleaner/resources" },
      { icon: Gift,     label: "Referral Program",  desc: "Earn by referring cleaners", href: "/cleaner/referral" },
      { icon: Flame,    label: "AI Assistant",      desc: "Job support & guidance",    href: "/cleaner/ai-assistant" },
      { icon: Camera,   label: "Calendar Sync",     desc: "Sync with your calendar",   href: "/cleaner/calendar-sync" },
    ],
  },
];
