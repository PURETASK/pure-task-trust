import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Trash2, Pencil, Check, X, Calendar } from "lucide-react";
import { useAvailabilityBlocks } from "@/hooks/useAvailability";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// 30-min time slots in 12-hour format
const TIME_SLOTS = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
      slots.push({ value, label });
    }
  }
  return slots;
})();

function to12h(time: string) {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr);
  const period = h < 12 ? "AM" : "PM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${mStr} ${period}`;
}

// Inline editable row for an existing block
function BlockRow({ block, onUpdate, onDelete }: {
  block: { id: number; start_time: string; end_time: string; is_active: boolean };
  onUpdate: (id: number, updates: { start_time?: string; end_time?: string; is_active?: boolean }) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ start_time: block.start_time, end_time: block.end_time });

  const handleSave = () => {
    onUpdate(block.id, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({ start_time: block.start_time, end_time: block.end_time });
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 rounded-xl border-2 border-primary/40 bg-primary/8"
      >
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <Select
            value={draft.start_time}
            onValueChange={(v) => setDraft((d) => ({ ...d, start_time: v }))}
          >
            <SelectTrigger className="h-9 w-32 rounded-xl text-sm border-2 border-primary/30">
              <SelectValue>{to12h(draft.start_time)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {TIME_SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm font-medium">to</span>
          <Select
            value={draft.end_time}
            onValueChange={(v) => setDraft((d) => ({ ...d, end_time: v }))}
          >
            <SelectTrigger className="h-9 w-32 rounded-xl text-sm border-2 border-primary/30">
              <SelectValue>{to12h(draft.end_time)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {TIME_SLOTS.filter((s) => s.value > draft.start_time).map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={handleSave}
          className="h-8 w-8 rounded-xl bg-success flex items-center justify-center hover:bg-success/80 transition-colors shrink-0"
        >
          <Check className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={handleCancel}
          className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
      block.is_active ? "border-border/60 bg-card" : "border-border/30 bg-muted/30"
    )}>
      <div className="flex items-center gap-3">
        <Switch
          checked={block.is_active}
          onCheckedChange={(checked) => onUpdate(block.id, { is_active: checked })}
        />
        <div className={cn(
          "flex items-center gap-1.5 text-sm font-medium",
          !block.is_active && "text-muted-foreground line-through"
        )}>
          <Clock className="h-3.5 w-3.5 text-primary" />
          {to12h(block.start_time)} – {to12h(block.end_time)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          title="Edit hours"
        >
          <Pencil className="h-3.5 w-3.5 text-primary" />
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </div>
    </div>
  );
}

export function AvailabilityEditor() {
  const { blocksByDay, isLoading, addBlock, updateBlock, deleteBlock, DAYS_OF_WEEK, profileReady } = useAvailabilityBlocks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
    is_active: true,
  });

  const handleAddBlock = () => {
    if (newBlock.end_time <= newBlock.start_time) return;
    addBlock.mutate(newBlock, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewBlock({ day_of_week: 0, start_time: "09:00", end_time: "17:00", is_active: true });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border-2 border-primary/30 overflow-hidden">
        <div className="p-5 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-primary/40 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-primary/8 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-black text-base text-primary">Weekly Hours</p>
            <p className="text-xs text-muted-foreground">Tap ✏️ to edit times on any row</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl gap-1.5 border-2 border-primary bg-primary text-white font-bold">
              <Plus className="h-4 w-4" /> Add Hours
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Add Available Hours</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Day selector */}
              <div className="space-y-2">
                <Label className="font-semibold">Day of Week</Label>
                <Select
                  value={newBlock.day_of_week.toString()}
                  onValueChange={(v) => setNewBlock((p) => ({ ...p, day_of_week: parseInt(v) }))}
                >
                  <SelectTrigger className="rounded-xl border-2 border-border/60 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Start Time</Label>
                  <Select
                    value={newBlock.start_time}
                    onValueChange={(v) => setNewBlock((p) => ({ ...p, start_time: v }))}
                  >
                    <SelectTrigger className="rounded-xl border-2 border-border/60 h-11">
                      <SelectValue>{to12h(newBlock.start_time)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {TIME_SLOTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">End Time</Label>
                  <Select
                    value={newBlock.end_time}
                    onValueChange={(v) => setNewBlock((p) => ({ ...p, end_time: v }))}
                  >
                    <SelectTrigger className="rounded-xl border-2 border-border/60 h-11">
                      <SelectValue>{to12h(newBlock.end_time)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {TIME_SLOTS.filter((s) => s.value > newBlock.start_time).map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newBlock.end_time <= newBlock.start_time && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <X className="h-3 w-3" /> End time must be after start time
                </p>
              )}

              <Button
                onClick={handleAddBlock}
                className="w-full rounded-xl h-11 font-bold border-2 border-primary"
                disabled={addBlock.isPending || newBlock.end_time <= newBlock.start_time || !profileReady}
              >
                {addBlock.isPending ? "Saving…" : "Save Hours"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day rows */}
      <div className="p-4 space-y-3">
        {blocksByDay.map(({ day, dayIndex, blocks }) => (
          <motion.div
            key={dayIndex}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: dayIndex * 0.04 }}
            className={cn(
              "rounded-2xl border-2 overflow-hidden",
              blocks.length > 0 ? "border-success/30" : "border-border/40"
            )}
          >
            {/* Day header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-2.5",
              blocks.length > 0 ? "bg-success/8" : "bg-muted/30"
            )}>
              <span className={cn(
                "font-bold text-sm",
                blocks.length > 0 ? "text-success" : "text-muted-foreground"
              )}>
                {day}
              </span>
              {blocks.length === 0 ? (
                <Badge className="bg-muted text-muted-foreground border border-border/40 rounded-full text-xs">
                  Not Available
                </Badge>
              ) : (
                <Badge className="bg-success/15 text-success border border-success/40 rounded-full text-xs font-bold">
                  {blocks.filter((b) => b.is_active).length} active slot{blocks.filter((b) => b.is_active).length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Time blocks */}
            {blocks.length > 0 && (
              <div className="px-3 pb-3 pt-2 space-y-2">
                {blocks.map((block) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    onUpdate={(id, updates) => updateBlock.mutate({ id, ...updates })}
                    onDelete={(id) => deleteBlock.mutate(id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
