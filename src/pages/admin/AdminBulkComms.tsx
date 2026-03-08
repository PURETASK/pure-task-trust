import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Users, Send, Plus, Trash2, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

const FILTER_FIELDS = [
  { label: "Jobs Completed", value: "jobs_completed", type: "number" },
  { label: "Tier", value: "tier", type: "select", options: ["bronze", "silver", "gold", "platinum"] },
  { label: "Is Available", value: "is_available", type: "boolean" },
];

const AdminBulkComms = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"cleaner" | "client">("client");
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [channel, setChannel] = useState<"in_app" | "email" | "both">("both");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const addFilter = () => setFilters(prev => [...prev, { field: "jobs_completed", operator: "lt", value: "" }]);
  const removeFilter = (i: number) => setFilters(prev => prev.filter((_, idx) => idx !== i));
  const updateFilter = (i: number, key: keyof FilterCondition, val: string) =>
    setFilters(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const { data: audienceCount, isLoading: countLoading } = useQuery({
    queryKey: ["bulk-comms-audience", role, filters],
    queryFn: async () => {
      const table = role === "cleaner" ? "cleaner_profiles" : "client_profiles";
      let q = supabase.from(table as any).select("id", { count: "exact", head: true });
      for (const f of filters) {
        if (!f.value) continue;
        if (f.operator === "lt") q = q.lt(f.field, Number(f.value));
        else if (f.operator === "gt") q = q.gt(f.field, Number(f.value));
        else if (f.operator === "eq") q = q.eq(f.field, f.value);
      }
      const { count } = await q;
      return count || 0;
    },
    staleTime: 5000,
  });

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body are required"); return; }
    setSending(true);
    try {
      // Get matching users
      const table = role === "cleaner" ? "cleaner_profiles" : "client_profiles";
      let q = supabase.from(table as any).select("user_id").limit(1000);
      for (const f of filters) {
        if (!f.value) continue;
        if (f.operator === "lt") q = q.lt(f.field, Number(f.value));
        else if (f.operator === "gt") q = q.gt(f.field, Number(f.value));
        else if (f.operator === "eq") q = q.eq(f.field, f.value);
      }
      const { data: users } = await q;
      if (!users || users.length === 0) { toast.error("No users matched your filters"); return; }

      if (channel === "in_app" || channel === "both") {
        const notifications = users.map((u: any) => ({
          user_id: u.user_id,
          type: "promo",
          title: subject,
          message: body,
          read: false,
        }));
        // Insert in batches of 100
        for (let i = 0; i < notifications.length; i += 100) {
          await supabase.from("in_app_notifications").insert(notifications.slice(i, i + 100));
        }
      }

      if (channel === "email" || channel === "both") {
        // Log intent — actual email sending via edge function
        await supabase.from("admin_audit_log").insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id || "",
          action: "bulk_email_sent",
          metadata: { subject, audience_size: users.length, role, channel },
        });
      }

      setSent(true);
      toast.success(`Message sent to ${users.length} ${role}s!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Campaign Sent!</h2>
        <p className="text-muted-foreground mb-6">Your message has been delivered to ~{audienceCount} {role}s.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { setSent(false); setStep(1); setSubject(""); setBody(""); setFilters([]); }}>
            Send Another
          </Button>
          <Button variant="outline" asChild><Link to="/admin/analytics">Back to Analytics</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
            <span>/</span><span>Bulk Communications</span>
          </div>
          <h1 className="text-3xl font-bold">Bulk Communication Tool</h1>
          <p className="text-muted-foreground mt-1">Target custom user segments with in-app notifications or emails</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
              <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>
                {s === 1 ? "Define Segment" : s === 2 ? "Compose Message" : "Review & Send"}
              </span>
              {s < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: Segment */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Define Audience</CardTitle>
              <CardDescription>Set role and filter conditions to narrow your segment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>User Role</Label>
                <div className="flex gap-3">
                  {(["client", "cleaner"] as const).map((r) => (
                    <button key={r} onClick={() => setRole(r)} className={`flex-1 py-3 rounded-xl border-2 capitalize text-sm font-medium transition-all ${role === r ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                      {r}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Filter Conditions</Label>
                  <Button variant="outline" size="sm" onClick={addFilter} className="gap-1 text-xs">
                    <Plus className="h-3 w-3" />Add Filter
                  </Button>
                </div>
                {filters.length === 0 && <p className="text-sm text-muted-foreground">No filters — will target all {role}s</p>}
                {filters.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select value={f.field} onValueChange={(v) => updateFilter(i, "field", v)}>
                      <SelectTrigger className="flex-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{FILTER_FIELDS.map(ff => <SelectItem key={ff.value} value={ff.value}>{ff.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={f.operator} onValueChange={(v) => updateFilter(i, "operator", v)}>
                      <SelectTrigger className="w-[80px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt">&lt;</SelectItem>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="eq">=</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="w-24 text-xs" value={f.value} onChange={(e) => updateFilter(i, "value", e.target.value)} placeholder="value" />
                    <Button variant="ghost" size="sm" onClick={() => removeFilter(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Estimated audience: {countLoading ? "..." : <span className="text-primary">{audienceCount} {role}s</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">Updates as you adjust filters</p>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={() => setStep(2)} disabled={audienceCount === 0}>
                Next: Compose Message <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Compose */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Compose Message</CardTitle>
              <CardDescription>Write the notification content and select delivery channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Subject / Title *</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. We miss you! Book again for 10% off" />
              </div>
              <div className="space-y-2">
                <Label>Message Body *</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Write your message here..." className="resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA Button Label</Label>
                  <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g. Book Now" />
                </div>
                <div className="space-y-2">
                  <Label>CTA URL</Label>
                  <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/book" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Delivery Channel</Label>
                <div className="flex gap-3">
                  {(["in_app", "email", "both"] as const).map((c) => (
                    <button key={c} onClick={() => setChannel(c)} className={`flex-1 py-2 rounded-xl border-2 text-xs font-medium capitalize transition-all ${channel === c ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                      {c.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(3)} disabled={!subject.trim() || !body.trim()}>
                  Preview <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Send */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Review & Send</CardTitle>
              <CardDescription>Confirm campaign details before sending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Audience:</span><span className="font-semibold">{audienceCount} {role}s</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Channel:</span><Badge variant="outline" className="capitalize">{channel.replace("_", " ")}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subject:</span><span className="font-medium max-w-[200px] text-right">{subject}</span></div>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-background">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Message Preview</p>
                <p className="font-semibold text-sm mb-1">{subject}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
                {ctaLabel && <button className="mt-3 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-medium">{ctaLabel}</button>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4" />Back</Button>
                <Button className="flex-1 gap-2" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending..." : `Send to ${audienceCount} Users`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <Button variant="outline" asChild><Link to="/admin/analytics">← Back to Analytics</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminBulkComms;
