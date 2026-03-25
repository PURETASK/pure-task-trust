import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Trash2, Calendar } from "lucide-react";
import { useAvailabilityBlocks } from "@/hooks/useAvailability";
import { cn } from "@/lib/utils";

// 12-hour time slots
const TIME_SLOTS_12H = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const period = h < 12 ? 'AM' : 'PM';
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
      slots.push({ value, label });
    }
  }
  return slots;
})();

function to12h(time: string) {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr);
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${mStr} ${period}`;
}

export function AvailabilityEditor() {
  const { blocksByDay, isLoading, addBlock, updateBlock, deleteBlock, DAYS_OF_WEEK } = useAvailabilityBlocks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  });

  const handleAddBlock = () => {
    addBlock.mutate(newBlock, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewBlock({ day_of_week: 0, start_time: '09:00', end_time: '17:00', is_active: true });
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Availability
            </CardTitle>
            <CardDescription>
              Set the hours you're open to taking jobs each week
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Hours
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Available Hours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={newBlock.day_of_week.toString()}
                    onValueChange={(v) => setNewBlock(prev => ({ ...prev, day_of_week: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select
                      value={newBlock.start_time}
                      onValueChange={(v) => setNewBlock(prev => ({ ...prev, start_time: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue>{to12h(newBlock.start_time)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS_12H.map(slot => (
                          <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select
                      value={newBlock.end_time}
                      onValueChange={(v) => setNewBlock(prev => ({ ...prev, end_time: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue>{to12h(newBlock.end_time)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS_12H.map(slot => (
                          <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleAddBlock}
                  className="w-full"
                  disabled={addBlock.isPending}
                >
                  {addBlock.isPending ? 'Adding...' : 'Add Hours'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blocksByDay.map(({ day, dayIndex, blocks }) => (
            <div
              key={dayIndex}
              className={cn(
                "p-4 rounded-lg border",
                blocks.length === 0 ? "bg-muted/30" : "bg-background"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{day}</span>
                {blocks.length === 0 && (
                  <Badge variant="secondary">Not Available</Badge>
                )}
              </div>
              {blocks.length > 0 && (
                <div className="space-y-2">
                  {blocks.map(block => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={block.is_active}
                          onCheckedChange={(checked) => {
                            updateBlock.mutate({ id: block.id, is_active: checked });
                          }}
                        />
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={cn(!block.is_active && "text-muted-foreground line-through")}>
                            {to12h(block.start_time)} – {to12h(block.end_time)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBlock.mutate(block.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
