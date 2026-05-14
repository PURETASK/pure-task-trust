
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAddresses } from "@/hooks/useAddresses";
import { Mail, Edit, Home, Wallet, Bell, Heart, Building2, Key, Trash2, ChevronRight, CheckCircle, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Pill, SectionLabel } from "@/components/wf";

const quickLinks = [
  { to: "/wallet", icon: Wallet, label: "Wallet & Credits", desc: "Manage your credits and payments" },
  { to: "/favorites", icon: Heart, label: "Favorite Cleaners", desc: "Your saved professionals" },
  { to: "/referral", icon: Gift, label: "Referral Program", desc: "Invite friends & earn credits" },
  { to: "/settings/notifications", icon: Bell, label: "Notifications", desc: "Email, push & SMS preferences" },
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
      <main className="flex-1 py-8 bg-app-canvas">
        <div className="container max-w-4xl space-y-6">
          <Skeleton className="h-40 rounded-[10px]" /><Skeleton className="h-56 rounded-[10px]" /><Skeleton className="h-40 rounded-[10px]" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8 bg-app-canvas">
      <div className="container max-w-4xl space-y-6">
        {/* Profile Hero */}
        <motion.div {...f(0)}>
          <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-hairline">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-lg bg-app-canvas text-ink font-semibold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-ink">{displayName}</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3 text-ink-faint" />
                    <span className="text-xs text-ink-muted">{user?.email}</span>
                    <CheckCircle className="h-3 w-3 text-state-success-fg" />
                  </div>
                  <div className="mt-2"><Pill variant="info">Client Account</Pill></div>
                </div>
              </div>
              <Button asChild className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                <Link to="/profile/edit"><Edit className="h-3.5 w-3.5" />Edit Profile</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Saved Addresses */}
        <motion.div {...f(0.08)}>
          <SectionLabel
            action={<Button variant="ghost" size="sm" asChild className="h-7 text-xs text-ink-muted hover:text-ink"><Link to="/profile/edit#addresses">Manage</Link></Button>}
          >Saved Addresses</SectionLabel>
          <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-4 sm:p-5">
            {addressesLoading ? (
              <div className="space-y-2"><Skeleton className="h-14 rounded-md" /><Skeleton className="h-14 rounded-md" /></div>
            ) : !addresses || addresses.length === 0 ? (
              <div className="text-center py-6">
                <Home className="h-8 w-8 mx-auto mb-2 text-ink-faint" />
                <p className="font-semibold text-sm text-ink">No addresses saved yet</p>
                <Button variant="link" asChild className="mt-1 text-primary"><Link to="/profile/edit#addresses">Add your first address</Link></Button>
              </div>
            ) : (
              <div className="divide-y divide-hairline-soft">
                {addresses.slice(0, 3).map((address) => (
                  <div key={address.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-9 w-9 rounded-md bg-app-canvas border border-hairline flex items-center justify-center flex-shrink-0 text-ink-muted">
                      {address.label?.toLowerCase().includes("work") ? <Building2 className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-ink">{address.label || "Address"}</p>
                        {address.is_default && <Pill variant="success">Default</Pill>}
                      </div>
                      <p className="text-xs text-ink-muted truncate">{address.line1}, {address.city}</p>
                    </div>
                  </div>
                ))}
                {addresses.length > 3 && (
                  <div className="pt-3">
                    <Button variant="ghost" className="w-full text-xs text-ink-muted hover:text-ink" asChild>
                      <Link to="/profile/edit#addresses">View all {addresses.length} addresses</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Links Grid */}
        <motion.div {...f(0.14)}>
          <SectionLabel>Account Features</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {quickLinks.map(({ to, icon: Icon, label, desc }, i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 + i * 0.04 }}>
                <Link
                  to={to}
                  className="group flex items-center gap-3 p-4 rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf hover:shadow-wf-hover transition-shadow"
                >
                  <div className="h-10 w-10 rounded-md bg-app-canvas border border-hairline flex items-center justify-center flex-shrink-0 text-ink-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink">{label}</p>
                    <p className="text-xs text-ink-muted">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-faint group-hover:text-ink transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div {...f(0.2)}>
          <SectionLabel>Account Security</SectionLabel>
          <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-4 sm:p-5">
            <div className="divide-y divide-hairline-soft">
              <Link to="/profile/edit#security" className="flex items-center justify-between py-3 first:pt-0 hover:opacity-70 transition-opacity">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-ink-faint" />
                  <div>
                    <p className="font-semibold text-sm text-ink">Change Password</p>
                    <p className="text-xs text-ink-muted">Update your login credentials</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-faint" />
              </Link>
              <Link to="/profile/edit#delete" className="flex items-center justify-between py-3 last:pb-0 text-state-danger-fg hover:opacity-70 transition-opacity">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4" />
                  <div>
                    <p className="font-semibold text-sm">Delete Account</p>
                    <p className="text-xs opacity-70">Permanently remove your account</p>
                  </div>
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
