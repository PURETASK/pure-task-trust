import { format, isBefore, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { FlowChip } from "@/components/flow/FlowChip";
import { FlowField } from "@/components/flow/FlowField";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isSameDayBooking,
  getAvailableTimeSlots,
  calculateRushFee,
} from "@/lib/same-day-booking";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";

const ALL_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const formatTime = (time: string) => {
  const [h] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${period}`;
};

interface StepDateTimeProps {
  date: Date | undefined;
  time: string | undefined;
  onDateChange: (d: Date | undefined) => void;
  onTimeChange: (t: string) => void;
  flexible: boolean;
  onFlexibleChange: (v: boolean) => void;
}

export function StepDateTime({
  date, time, onDateChange, onTimeChange, flexible, onFlexibleChange,
}: StepDateTimeProps) {
  const today = startOfToday();
  const { rushFeeCredits, sameDayMinNoticeHours } = usePlatformConfig();
  const sameDay = date ? isSameDayBooking(date) : false;
  const rushFee = date ? calculateRushFee(date, rushFeeCredits) : 0;
  const availableSlots = date ? getAvailableTimeSlots(date, ALL_SLOTS, sameDayMinNoticeHours) : ALL_SLOTS;

  return (
    <div className="space-y-6">
      {sameDay && (
        <div className="flex items-start gap-3 rounded-2xl border border-aero-cyan/40 bg-aero-bg p-4">
          <div className="h-9 w-9 rounded-xl bg-gradient-aero flex items-center justify-center text-white flex-shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">Same-day booking</p>
            <p className="text-aero-soft text-xs mt-0.5 leading-relaxed">
              A +${rushFeeCredits} rush fee applies. Requires {sameDayMinNoticeHours}h notice.
            </p>
          </div>
        </div>
      )}

      <FlowField label="Pick a date">
        <div className="rounded-2xl border border-aero bg-aero-card p-2 sm:p-3 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={(d) => isBefore(d, today)}
            className={cn("p-3 pointer-events-auto")}
            initialFocus
          />
        </div>
      </FlowField>

      {date && (
        <FlowField
          label="Pick a time"
          helper={sameDay && availableSlots.length < ALL_SLOTS.length
            ? `Some times unavailable due to ${sameDayMinNoticeHours}h minimum notice`
            : undefined}
        >
          {availableSlots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-aero p-6 text-center text-sm text-aero-soft">
              No times available today. Please pick a future date.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ALL_SLOTS.map((t) => {
                const enabled = availableSlots.includes(t);
                return (
                  <FlowChip
                    key={t}
                    selected={time === t}
                    onClick={() => enabled && onTimeChange(t)}
                    disabled={!enabled}
                    className={cn("h-11", !enabled && "opacity-40 cursor-not-allowed")}
                  >
                    {formatTime(t)}
                  </FlowChip>
                );
              })}
            </div>
          )}
        </FlowField>
      )}

      <label className="flex items-start gap-3 p-3 rounded-2xl border border-aero bg-aero-card cursor-pointer hover:border-aero-cyan/40 transition-colors">
        <input
          type="checkbox"
          checked={flexible}
          onChange={(e) => onFlexibleChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-aero text-aero-trust focus:ring-aero-cyan"
        />
        <div className="text-sm">
          <p className="font-medium text-foreground">I'm flexible on timing</p>
          <p className="text-xs text-aero-soft mt-0.5">
            Cleaners may suggest a slot ±2 hours from your preferred time.
          </p>
        </div>
      </label>

      {date && time && (
        <div className="rounded-2xl border border-aero-cyan/30 bg-gradient-to-br from-aero-bg to-transparent p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-aero-soft">Scheduled for</p>
            <p className="font-poppins font-semibold text-foreground">
              {format(date, "EEE, MMM d")} at {formatTime(time)}
            </p>
          </div>
          {sameDay && rushFee > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-aero text-white">
              +${rushFee} rush
            </span>
          )}
        </div>
      )}
    </div>
  );
}
