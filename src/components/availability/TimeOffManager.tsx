import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Plus, Trash2, Umbrella, Star } from "lucide-react";
import { useTimeOff } from "@/hooks/useAvailability";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const HOLIDAYS = [
  { label: "New Year's Day", date: `${new Date().getFullYear()}-01-01` },
  { label: "Memorial Day", date: `${new Date().getFullYear()}-05-26` },
  { label: "Independence Day (July 4th)", date: `${new Date().getFullYear()}-07-04` },
  { label: "Labor Day", date: `${new Date().getFullYear()}-09-01` },
  { label: "Thanksgiving", date: `${new Date().getFullYear()}-11-27` },
  { label: "Christmas Eve", date: `${new Date().getFullYear()}-12-24` },
  { label: "Christmas Day", date: `${new Date().getFullYear()}-12-25` },
  { label: "New Year's Eve", date: `${new Date().getFullYear()}-12-31` },
];

export function TimeOffManager() {
  const { upcomingTimeOff, pastTimeOff, isLoading, addTimeOff, deleteTimeOff } = useTimeOff();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTimeOff, setNewTimeOff] = useState({
    start_date: '',
    end_date: '',
    start_time: null as string | null,
    end_time: null as string | null,
    all_day: true,
    reason: '',
  });

  const resetForm = () => setNewTimeOff({
    start_date: '', end_date: '', start_time: null, end_time: null, all_day: true, reason: '',
  });

  const handleAdd = () => {
    addTimeOff.mutate({
      start_date: newTimeOff.start_date,
      end_date: newTimeOff.end_date,
      start_time: newTimeOff.all_day ? null : newTimeOff.start_time,
      end_time: newTimeOff.all_day ? null : newTimeOff.end_time,
      all_day: newTimeOff.all_day,
      reason: newTimeOff.reason || null,
    }, {
      onSuccess: () => { setIsDialogOpen(false); resetForm(); },
    });
  };

  const addHoliday = (h: typeof HOLIDAYS[number]) => {
    addTimeOff.mutate({
      start_date: h.date,
      end_date: h.date,
      start_time: null,
      end_time: null,
      all_day: true,
      reason: h.label,
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
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Holiday quick-add */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-amber-500" />
            Common Holidays
          </CardTitle>
          <CardDescription>Tap a holiday to instantly block that day off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {HOLIDAYS.map(h => (
              <Button
                key={h.label}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => addHoliday(h)}
                disabled={addTimeOff.isPending}
              >
                {h.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main days off manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Umbrella className="h-5 w-5" />
                Days I Don't Work
              </CardTitle>
              <CardDescription>
                Mark specific days or date ranges you won't be available
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Days I Don't Work
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Days I Don't Work</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newTimeOff.start_date}
                        onChange={(e) => setNewTimeOff(prev => ({
                          ...prev,
                          start_date: e.target.value,
                          end_date: prev.end_date || e.target.value,
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newTimeOff.end_date}
                        onChange={(e) => setNewTimeOff(prev => ({ ...prev, end_date: e.target.value }))}
                        min={newTimeOff.start_date}
                      />
                    </div>
                  </div>

                  {/* All Day — big, prominent toggle */}
                  <div className={cn(
                    "flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                    newTimeOff.all_day
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30"
                  )}
                    onClick={() => setNewTimeOff(prev => ({ ...prev, all_day: !prev.all_day }))}
                  >
                    <div>
                      <p className="font-semibold text-sm">All Day</p>
                      <p className="text-xs text-muted-foreground">Block the entire day</p>
                    </div>
                    <Switch
                      checked={newTimeOff.all_day}
                      onCheckedChange={(checked) => setNewTimeOff(prev => ({ ...prev, all_day: checked }))}
                      className="pointer-events-none"
                    />
                  </div>

                  {!newTimeOff.all_day && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={newTimeOff.start_time || ''}
                          onChange={(e) => setNewTimeOff(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={newTimeOff.end_time || ''}
                          onChange={(e) => setNewTimeOff(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Reason (optional)</Label>
                    <Input
                      placeholder="e.g., Holiday, Personal day, Travel"
                      value={newTimeOff.reason}
                      onChange={(e) => setNewTimeOff(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={handleAdd}
                    className="w-full"
                    disabled={addTimeOff.isPending || !newTimeOff.start_date || !newTimeOff.end_date}
                  >
                    {addTimeOff.isPending ? 'Saving...' : 'Save Days Off'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingTimeOff.length === 0 && pastTimeOff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No days off added yet</p>
              <p className="text-sm">Use the button above or tap a holiday shortcut</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingTimeOff.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h4>
                  <div className="space-y-2">
                    {upcomingTimeOff.map(timeOff => (
                      <div
                        key={timeOff.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-primary/5"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {format(parseISO(timeOff.start_date), 'MMM d')}
                              {timeOff.start_date !== timeOff.end_date && (
                                <> – {format(parseISO(timeOff.end_date), 'MMM d')}</>
                              )}
                            </span>
                            {timeOff.all_day ? (
                              <Badge variant="secondary">All Day</Badge>
                            ) : (
                              <Badge variant="outline">
                                {timeOff.start_time} – {timeOff.end_time}
                              </Badge>
                            )}
                          </div>
                          {timeOff.reason && (
                            <p className="text-sm text-muted-foreground mt-1">{timeOff.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTimeOff.mutate(timeOff.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pastTimeOff.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Past</h4>
                  <div className="space-y-2">
                    {pastTimeOff.slice(0, 3).map(timeOff => (
                      <div
                        key={timeOff.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="text-muted-foreground">
                          <span>
                            {format(parseISO(timeOff.start_date), 'MMM d')}
                            {timeOff.start_date !== timeOff.end_date && (
                              <> – {format(parseISO(timeOff.end_date), 'MMM d')}</>
                            )}
                          </span>
                          {timeOff.reason && (
                            <span className="text-sm ml-2">• {timeOff.reason}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
