import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["privacy_requests"]["Row"];
type Status = Database["public"]["Enums"]["privacy_request_status"];

const STATUSES: Status[] = ["received", "verifying", "in_progress", "completed", "denied", "cancelled"];

const statusVariant: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  received: "default",
  verifying: "secondary",
  in_progress: "secondary",
  completed: "outline",
  denied: "destructive",
  cancelled: "outline",
};

export default function AdminPrivacyRequests() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-privacy-requests", filter],
    queryFn: async () => {
      let q = supabase.from("privacy_requests").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: Status; admin_notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const patch: Partial<Row> = { status, admin_notes };
      if (status === "completed" || status === "denied") {
        patch.decided_at = new Date().toISOString();
        patch.decided_by = user?.id ?? null;
      }
      const { error } = await supabase.from("privacy_requests").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request updated");
      qc.invalidateQueries({ queryKey: ["admin-privacy-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>Privacy Requests | Admin · PureTask</title>
      </Helmet>
      <div className="container px-4 sm:px-6 py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="palette-icon palette-icon-blue h-10 w-10"><Shield className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-poppins font-bold">Privacy Requests</h1>
            <p className="text-ink-muted text-sm">CCPA / CPRA / GDPR data subject requests.</p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="status-filter" className="text-sm font-semibold">Status</label>
          <Select value={filter} onValueChange={(v) => setFilter(v as Status | "all")}>
            <SelectTrigger id="status-filter" className="w-48 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-ink-muted" /></div>
        ) : !data?.length ? (
          <Card><CardContent className="py-12 text-center text-ink-muted">No requests.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {data.map((r) => <RequestRow key={r.id} row={r} onUpdate={(status, notes) => update.mutate({ id: r.id, status, admin_notes: notes })} pending={update.isPending} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function RequestRow({ row, onUpdate, pending }: { row: Row; onUpdate: (status: Status, notes?: string) => void; pending: boolean }) {
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  const [status, setStatus] = useState<Status>(row.status);
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  const ageDays = Math.floor(ageMs / 86_400_000);
  const overdue = ageDays > 45; // CCPA 45-day rule

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm">{row.full_name}</p>
              <Badge variant="outline" className="text-xs">{row.request_type}</Badge>
              <Badge variant={statusVariant[row.status]} className="text-xs">{row.status}</Badge>
              {overdue && row.status !== "completed" && row.status !== "denied" && row.status !== "cancelled" && (
                <Badge variant="destructive" className="text-xs">Overdue ({ageDays}d)</Badge>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-1">{row.email} · {row.jurisdiction ?? "—"} · {ageDays}d ago</p>
          </div>
        </div>
        {row.details && <p className="text-sm text-ink-muted bg-muted/40 rounded-xl p-3 mb-3 whitespace-pre-wrap">{row.details}</p>}
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-ink-muted block mb-1">Admin notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl text-sm" rows={2} placeholder="Verification steps, fulfillment notes…" />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button disabled={pending} onClick={() => onUpdate(status, notes)} className="rounded-xl">Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}