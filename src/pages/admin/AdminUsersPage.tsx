import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserInspectorPanel } from "@/components/admin/UserInspectorPanel";
import { Search, Users, UserCheck, Briefcase, Shield, Eye, Star, Activity } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const TIER_STYLES: Record<string, string> = {
  platinum: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.2)]",
  gold: "bg-warning/10 text-warning border-warning/20",
  silver: "bg-muted text-muted-foreground border-border",
  bronze: "bg-[hsl(var(--pt-amber)/0.1)] text-[hsl(var(--pt-amber))] border-[hsl(var(--pt-amber)/0.2)]",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<"client" | "cleaner" | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ["admin-all-clients"],
    queryFn: async () => {
      const { data } = await supabase.from("client_profiles").select("id, user_id, first_name, last_name, created_at").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: cleaners, isLoading: loadingCleaners } = useQuery({
    queryKey: ["admin-all-cleaners"],
    queryFn: async () => {
      const { data } = await supabase.from("cleaner_profiles").select("id, user_id, first_name, last_name, tier, reliability_score, jobs_completed, is_available, created_at, avg_rating").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: admins, isLoading: loadingAdmins } = useQuery({
    queryKey: ["admin-all-admins"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_users").select("id, email, full_name, role, is_active, created_at").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filterBySearch = (name: string) => !search || name.toLowerCase().includes(search.toLowerCase());
  const filteredClients = (clients || []).filter(c => filterBySearch(`${c.first_name || ""} ${c.last_name || ""}`));
  const filteredCleaners = (cleaners || []).filter(c => filterBySearch(`${c.first_name || ""} ${c.last_name || ""}`));

  const openInspector = (userId: string, role: "client" | "cleaner") => {
    setSelectedUserId(userId);
    setSelectedUserRole(role);
    setInspectorOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-sm text-muted-foreground">View and inspect all platform users</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Clients', value: clients?.length ?? '—', icon: UserCheck, color: 'text-primary' },
                { label: 'Cleaners', value: cleaners?.length ?? '—', icon: Briefcase, color: 'text-success' },
                { label: 'Admins', value: admins?.length ?? '—', icon: Shield, color: 'text-destructive' },
              ].map(stat => (
                <div key={stat.label} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/40">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Tabs defaultValue="clients">
          <TabsList className="mb-6">
            <TabsTrigger value="clients" className="gap-2">
              <UserCheck className="h-4 w-4" /> Clients ({filteredClients.length})
            </TabsTrigger>
            <TabsTrigger value="cleaners" className="gap-2">
              <Briefcase className="h-4 w-4" /> Cleaners ({filteredCleaners.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="h-4 w-4" /> Admins ({admins?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Clients */}
          <TabsContent value="clients">
            {loadingClients ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : filteredClients.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No clients found.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client, i) => (
                  <motion.div key={client.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="hover:shadow-sm transition-all">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {(client.first_name?.[0] || "C").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {`${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unnamed Client"}
                            </p>
                            <p className="text-xs text-muted-foreground">Joined {format(new Date(client.created_at), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openInspector(client.user_id, "client")}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Inspect
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cleaners */}
          <TabsContent value="cleaners">
            {loadingCleaners ? (
              <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : filteredCleaners.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No cleaners found.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {filteredCleaners.map((cleaner, i) => (
                  <motion.div key={cleaner.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="hover:shadow-sm transition-all">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-success/10 text-success text-sm font-semibold">
                              {(cleaner.first_name?.[0] || "C").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">
                                {`${cleaner.first_name || ""} ${cleaner.last_name || ""}`.trim() || "Unnamed Cleaner"}
                              </p>
                              <Badge variant="outline" className={`text-xs capitalize ${TIER_STYLES[cleaner.tier] || "bg-muted text-muted-foreground"}`}>
                                {cleaner.tier}
                              </Badge>
                              {cleaner.is_available && (
                                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-0.5"><Activity className="h-3 w-3" />{cleaner.reliability_score}</span>
                              <span>{cleaner.jobs_completed} jobs</span>
                              {cleaner.avg_rating && <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{cleaner.avg_rating.toFixed(1)}</span>}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openInspector(cleaner.user_id, "cleaner")}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Inspect
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Admins */}
          <TabsContent value="admins">
            {loadingAdmins ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-2">
                {(admins || []).map((admin, i) => (
                  <motion.div key={admin.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-sm transition-all">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-destructive/10 text-destructive text-sm font-semibold">
                              {(admin.full_name?.[0] || admin.email[0]).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{admin.full_name || admin.email}</p>
                              <Badge variant={admin.is_active ? "outline" : "secondary"} className={`text-xs ${admin.is_active ? 'bg-success/10 text-success border-success/20' : ''}`}>
                                {admin.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{admin.email} · {admin.role || "admin"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <UserInspectorPanel userId={selectedUserId} userRole={selectedUserRole} open={inspectorOpen} onOpenChange={setInspectorOpen} />
    </div>
  );
}
