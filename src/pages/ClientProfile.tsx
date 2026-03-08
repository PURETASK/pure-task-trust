
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAddresses } from "@/hooks/useAddresses";
import { User, Mail, Edit, MapPin, Home, Wallet, Bell, Heart, Building2, Shield, Key, Trash2, ChevronRight, CheckCircle, Star, Repeat, Gift } from "lucide-react";
import { motion } from "framer-motion";

const quickLinks = [
  { to: "/wallet", icon: Wallet, label: "Wallet & Credits", desc: "Manage your credits and payments", color: "text-success", bg: "bg-success/10" },
  { to: "/favorites", icon: Heart, label: "Favorite Cleaners", desc: "Your saved professionals", color: "text-rose-500", bg: "bg-rose-500/10" },
  { to: "/properties", icon: Building2, label: "Properties", desc: "Manage your properties", color: "text-amber-500", bg: "bg-amber-500/10" },
  { to: "/recurring-plans", icon: Repeat, label: "Recurring Plans", desc: "Set up scheduled cleanings", color: "text-primary", bg: "bg-primary/10" },
  { to: "/referral", icon: Gift, label: "Referral Program", desc: "Invite friends & earn credits", color: "text-violet-500", bg: "bg-violet-500/10" },
  { to: "/notification-settings", icon: Bell, label: "Notifications", desc: "Email, push & SMS preferences", color: "text-blue-500", bg: "bg-blue-500/10" },
];

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
          <Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-4xl space-y-6">
        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-border/60">
            <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-violet-600 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.1),transparent)]" />
            </div>
            <CardContent className="p-6 -mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-end gap-4">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mb-2">
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{user?.email}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    </div>
                    <Badge variant="outline" className="mt-2 border-primary/30 text-primary bg-primary/5">Client Account</Badge>
                  </div>
                </div>
                <Button asChild className="gap-2">
                  <Link to="/profile/edit"><Edit className="h-4 w-4" />Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Addresses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Saved Addresses</h2>
                    <p className="text-sm text-muted-foreground">Your service locations</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild><Link to="/profile/edit#addresses">Manage</Link></Button>
              </div>

              {addressesLoading ? (
                <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
              ) : !addresses || addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  <Home className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No addresses saved yet</p>
                  <Button variant="link" asChild className="mt-1"><Link to="/profile/edit#addresses">Add your first address</Link></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.slice(0, 3).map((address) => (
                    <div key={address.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {address.label?.toLowerCase().includes("work") ? <Building2 className="h-5 w-5 text-primary" /> : <Home className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{address.label || "Address"}</p>
                          {address.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{address.line1}, {address.city}</p>
                      </div>
                    </div>
                  ))}
                  {addresses.length > 3 && (
                    <Button variant="ghost" className="w-full text-sm" asChild>
                      <Link to="/profile/edit#addresses">View all {addresses.length} addresses</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold mb-4">Account Features</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map(({ to, icon: Icon, label, desc, color, bg }, i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Link to={to} className="group flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:shadow-elevated hover:border-primary/30 transition-all duration-200">
                  <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-bold text-lg">Account Security</h2>
              </div>
              <div className="divide-y divide-border/40">
                <Link to="/profile/edit#security" className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div><p className="font-medium text-sm">Change Password</p><p className="text-xs text-muted-foreground">Update your login credentials</p></div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link to="/profile/edit#delete" className="flex items-center justify-between py-4 text-destructive hover:opacity-70 transition-opacity">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-4 w-4" />
                    <div><p className="font-medium text-sm">Delete Account</p><p className="text-xs opacity-70">Permanently remove your account</p></div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
