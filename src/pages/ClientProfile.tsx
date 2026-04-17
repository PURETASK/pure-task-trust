
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAddresses } from "@/hooks/useAddresses";
import { Mail, Edit, MapPin, Home, Wallet, Bell, Heart, Building2, Shield, Key, Trash2, ChevronRight, CheckCircle, Gift } from "lucide-react";
import { motion } from "framer-motion";

const quickLinks = [
  { to: "/wallet", icon: Wallet, label: "Wallet & Credits", desc: "Manage your credits and payments", color: "text-success", border: "border-success/50 bg-success/10" },
  { to: "/favorites", icon: Heart, label: "Favorite Cleaners", desc: "Your saved professionals", color: "text-destructive", border: "border-destructive/40 bg-destructive/10" },
  { to: "/referral", icon: Gift, label: "Referral Program", desc: "Invite friends & earn credits", color: "text-[hsl(var(--pt-purple))]", border: "border-[hsl(var(--pt-purple))]/40 bg-[hsl(var(--pt-purple))]/10" },
  { to: "/settings/notifications", icon: Bell, label: "Notifications", desc: "Email, push & SMS preferences", color: "text-primary", border: "border-primary/40 bg-primary/10" },
];

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function ClientProfile() {
  const { user } = useAuth();
  const { clientProfile, isLoading: profileLoading } = useUserProfile();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  const displayName = `${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'User';

  if (profileLoading) {
    return (
      <main className="flex-1 py-8">
        <div className="container max-w-4xl space-y-6">
          <Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-48 rounded-3xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-4xl space-y-6">
        {/* Profile Hero */}
        <motion.div {...f(0)}>
          <div className="overflow-hidden rounded-3xl border-2 border-primary/30 relative">
            <div className="h-28 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.25) 0%, hsl(var(--pt-aqua)/0.15) 60%, hsl(var(--background)) 100%)" }}>
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--primary)/0.2)" }} />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--pt-aqua)/0.15)" }} />
            </div>
            <div className="p-6 -mt-12 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-end gap-4">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl border-2 border-primary/30">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-black">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mb-2">
                    <h1 className="text-2xl font-black">{displayName}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{user?.email}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    </div>
                    <Badge className="mt-2 border-2 border-primary/30 text-primary bg-primary/10 font-bold text-xs">Client Account</Badge>
                  </div>
                </div>
                <Button asChild className="gap-2 rounded-xl">
                  <Link to="/profile/edit"><Edit className="h-4 w-4" />Edit Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Saved Addresses */}
        <motion.div {...f(0.08)}>
          <div className="rounded-3xl border-2 border-primary/20 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-lg">Saved Addresses</h2>
                  <p className="text-sm text-muted-foreground">Your service locations</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl border-2"><Link to="/profile/edit#addresses">Manage</Link></Button>
            </div>

            {addressesLoading ? (
              <div className="space-y-3"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div>
            ) : !addresses || addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-2xl border-2 border-dashed border-border">
                <Home className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="font-bold">No addresses saved yet</p>
                <Button variant="link" asChild className="mt-1"><Link to="/profile/edit#addresses">Add your first address</Link></Button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.slice(0, 3).map((address) => (
                  <div key={address.id} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border/40 bg-muted/20">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                      {address.label?.toLowerCase().includes("work") ? <Building2 className="h-5 w-5 text-primary" /> : <Home className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{address.label || "Address"}</p>
                        {address.is_default && <Badge className="text-xs border-2 border-success/30 bg-success/10 text-success">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{address.line1}, {address.city}</p>
                    </div>
                  </div>
                ))}
                {addresses.length > 3 && (
                  <Button variant="ghost" className="w-full text-sm font-bold" asChild>
                    <Link to="/profile/edit#addresses">View all {addresses.length} addresses</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div {...f(0.14)}>
          <h2 className="text-base sm:text-xl font-black mb-4">Account Features</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map(({ to, icon: Icon, label, desc, color, border }, i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 + i * 0.05 }} whileHover={{ y: -3, scale: 1.01 }}>
                <Link to={to} className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-border/40 bg-card hover:shadow-elevated hover:border-primary/30 transition-all duration-200">
                  <div className={`h-12 w-12 rounded-xl border-2 ${border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div {...f(0.2)}>
          <div className="rounded-3xl border-2 border-border/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-black text-lg">Account Security</h2>
            </div>
            <div className="divide-y divide-border/40">
              <Link to="/profile/edit#security" className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div><p className="font-bold text-sm">Change Password</p><p className="text-xs text-muted-foreground">Update your login credentials</p></div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/profile/edit#delete" className="flex items-center justify-between py-4 text-destructive hover:opacity-70 transition-opacity">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4" />
                  <div><p className="font-bold text-sm">Delete Account</p><p className="text-xs opacity-70">Permanently remove your account</p></div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
