import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Star, Briefcase, DollarSign, Calendar, ShieldBan, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/audit";

interface UserInspectorPanelProps {
  userId: string | null;
  userRole: "client" | "cleaner" | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function UserInspectorPanel({ userId, userRole, open, onOpenChange }: UserInspectorPanelProps) {
  const [suspending, setSuspending] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-inspector", userId, userRole],
    enabled: !!userId && !!userRole && open,
    queryFn: async () => {
      if (!userId || !userRole) return null;
      if (userRole === "cleaner") {
        const { data } = await supabase
          .from("cleaner_profiles")
          .select("id, first_name, last_name, profile_photo_url, tier, reliability_score, jobs_completed, avg_rating, hourly_rate_credits, created_at, is_available, user_id")
          .eq("user_id", userId)
          .single();
        return data ? { ...data, role: "cleaner" as const } : null;
      } else {
        const { data } = await supabase
          .from("client_profiles")
          .select("id, first_name, last_name, created_at, user_id")
          .eq("user_id", userId)
          .single();
        return data ? { ...data, role: "client" as const } : null;
      }
    },
  });

  const { data: recentJobs } = useQuery({
    queryKey: ["user-inspector-jobs", userId, userRole],
    enabled: !!profile && open,
    queryFn: async () => {
      if (!profile) return [];
      const field = userRole === "cleaner" ? "cleaner_id" : "client_id";
      const idField = userRole === "cleaner" ? (profile as any).id : (profile as any).id;
      const { data } = await supabase
        .from("jobs")
        .select("id, status, scheduled_start_at, escrow_credits_reserved, cleaning_type")
        .eq(field, idField)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const handleSuspend = async () => {
    setSuspending(true);
    try {
      await logAdminAction({
        action: "user_suspended",
        entity_type: userRole || "user",
        entity_id: userId,
        reason: "Suspended via User Inspector Panel",
      });
      toast.success("User suspension logged for review");
    } catch (e: any) {
      console.error("[UserInspectorPanel] suspend log failed:", e);
      toast.error(e?.message || "Failed to log suspension");
    } finally {
      setSuspending(false);
    }
  };

  const name = profile ? `${(profile as any).first_name || ""} ${(profile as any).last_name || ""}`.trim() || "Unknown" : "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            User Inspector
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : profile ? (
          <div className="mt-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={(profile as any).profile_photo_url} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {initials || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={userRole === "cleaner" ? "default" : "secondary"} className="capitalize">
                    {userRole}
                  </Badge>
                  {userRole === "cleaner" && (profile as any).tier && (
                    <Badge variant="outline" className="capitalize">{(profile as any).tier}</Badge>
                  )}
                  <Badge variant={(profile as any).is_available !== false ? "outline" : "secondary"} className="text-xs">
                    {(profile as any).is_available !== false ? "Active" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {userRole === "cleaner" && (
                <>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <Star className="h-4 w-4 text-warning mx-auto mb-1" />
                    <p className="text-lg font-bold">{((profile as any).avg_rating || 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <Briefcase className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold">{(profile as any).jobs_completed || 0}</p>
                    <p className="text-xs text-muted-foreground">Jobs Done</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <DollarSign className="h-4 w-4 text-success mx-auto mb-1" />
                    <p className="text-lg font-bold">{(profile as any).hourly_rate_credits || 0} cr</p>
                    <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <ShieldBan className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold">{(profile as any).reliability_score || 0}</p>
                    <p className="text-xs text-muted-foreground">Reliability</p>
                  </div>
                </>
              )}
              <div className="p-3 rounded-xl bg-muted/50 col-span-2">
                <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-medium text-sm">{format(new Date((profile as any).created_at), "MMM d, yyyy")}</p>
              </div>
            </div>

            <Separator />

            {/* Recent Jobs */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Recent Jobs</h4>
              {!recentJobs || recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs found</p>
              ) : (
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-sm">
                      <div>
                        <p className="font-medium capitalize">{(job.cleaning_type || "").replace(/_/g, " ")} Clean</p>
                        <p className="text-xs text-muted-foreground">
                          {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "MMM d, yyyy") : "Not scheduled"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{job.escrow_credits_reserved || 0} cr</span>
                        <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
              <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Message feature coming soon")}>
                <Mail className="h-4 w-4" />
                Send Message
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleSuspend}
                disabled={suspending}
              >
                <ShieldBan className="h-4 w-4" />
                {suspending ? "Logging..." : "Flag for Suspension"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">User not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
