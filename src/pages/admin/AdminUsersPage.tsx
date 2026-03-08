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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserInspectorPanel } from "@/components/admin/UserInspectorPanel";
import { Search, Users, UserCheck, Briefcase, Shield, Filter, Eye } from "lucide-react";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ["admin-all-clients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("client_profiles")
        .select("id, user_id, first_name, last_name, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const { data: cleaners, isLoading: loadingCleaners } = useQuery({
    queryKey: ["admin-all-cleaners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cleaner_profiles")
        .select("id, user_id, first_name, last_name, tier, reliability_score, jobs_completed, is_available, created_at, avg_rating")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const { data: admins, isLoading: loadingAdmins } = useQuery({
    queryKey: ["admin-all-admins"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_users")
        .select("id, email, full_name, role, is_active, created_at")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filterBySearch = (name: string) =>
    !search || name.toLowerCase().includes(search.toLowerCase());

  const filteredClients = (clients || []).filter(c =>
    filterBySearch(`${c.first_name || ""} ${c.last_name || ""}`)
  );
  const filteredCleaners = (cleaners || []).filter(c =>
    filterBySearch(`${c.first_name || ""} ${c.last_name || ""}`)
  );

  const openInspector = (userId: string) => {
    setSelectedUserId(userId);
    setInspectorOpen(true);
  };

  const tierColor: Record<string, string> = {
    platinum: "bg-purple-100 text-purple-700",
    gold: "bg-yellow-100 text-yellow-700",
    silver: "bg-slate-100 text-slate-700",
    bronze: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all platform users
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{clients?.length ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cleaners</p>
              <p className="text-2xl font-bold">{cleaners?.length ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold">{admins?.length ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
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

        {/* Clients Tab */}
        <TabsContent value="clients">
          {loadingClients ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : filteredClients.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No clients found.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filteredClients.map(client => (
                <Card key={client.id} className="hover:shadow-sm transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {(client.first_name?.[0] || "C").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {`${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unnamed Client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {format(new Date(client.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInspector(client.user_id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Inspect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cleaners Tab */}
        <TabsContent value="cleaners">
          {loadingCleaners ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : filteredCleaners.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No cleaners found.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filteredCleaners.map(cleaner => (
                <Card key={cleaner.id} className="hover:shadow-sm transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-success/10 text-success text-sm font-semibold">
                          {(cleaner.first_name?.[0] || "C").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {`${cleaner.first_name || ""} ${cleaner.last_name || ""}`.trim() || "Unnamed Cleaner"}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${tierColor[cleaner.tier] || "bg-muted text-muted-foreground"}`}>
                            {cleaner.tier}
                          </span>
                          {cleaner.is_available && (
                            <Badge variant="success" className="text-xs">Available</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Score: {cleaner.reliability_score} · {cleaner.jobs_completed} jobs · ★ {cleaner.avg_rating?.toFixed(1) || "—"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInspector(cleaner.user_id)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Inspect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          {loadingAdmins ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(admins || []).map(admin => (
                <Card key={admin.id} className="hover:shadow-sm transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-destructive/10 text-destructive text-sm font-semibold">
                          {(admin.full_name?.[0] || admin.email[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{admin.full_name || admin.email}</p>
                          <Badge variant={admin.is_active ? "success" : "secondary"} className="text-xs">
                            {admin.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {admin.email} · {admin.role || "admin"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Inspector Panel */}
      <UserInspectorPanel
        userId={selectedUserId}
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
      />
    </div>
  );
}
