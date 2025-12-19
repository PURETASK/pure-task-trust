import { useState } from 'react';
import { format, addDays, setHours, setMinutes, isBefore, startOfToday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock } from 'lucide-react';

interface DateTimePickerProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const formatTimeLabel = (time: string) => {
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:00 ${period}`;
};

export function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const today = startOfToday();
  const minDate = addDays(today, 1); // At least 1 day in advance

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Select Date</h3>
        </div>
        <Card>
          <CardContent className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={(date) => isBefore(date, minDate)}
              className={cn("p-3 pointer-events-auto")}
              initialFocus
            />
          </CardContent>
        </Card>
        {selectedDate && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Selected: <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </p>
        )}
      </div>

      {/* Time Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Select Time</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeChange(time)}
              className={cn(
                'h-12',
                selectedTime === time && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {formatTimeLabel(time)}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled for</p>
                <p className="font-semibold">
                  {format(selectedDate, 'EEE, MMM d')} at {formatTimeLabel(selectedTime)}
                </p>
              </div>
              <Badge variant="secondary">Confirmed</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
