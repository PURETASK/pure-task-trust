import { useState } from 'react';
import { format, addDays, setHours, setMinutes, isBefore, startOfToday, isToday } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock, AlertTriangle, Zap } from 'lucide-react';
import { 
  isSameDayBooking, 
  getAvailableTimeSlots, 
  SAME_DAY_CONFIG,
  calculateRushFee 
} from '@/lib/same-day-booking';

interface DateTimePickerProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

const allTimeSlots = [
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
  
  // Allow same-day bookings (but with restrictions)
  const minDate = today;
  
  // Get available time slots based on same-day rules
  const availableTimeSlots = selectedDate 
    ? getAvailableTimeSlots(selectedDate, allTimeSlots)
    : allTimeSlots;
  
  const isSameDay = selectedDate ? isSameDayBooking(selectedDate) : false;
  const rushFee = selectedDate ? calculateRushFee(selectedDate) : 0;

  // If selected time becomes unavailable when date changes, clear it
  const handleDateChange = (date: Date | undefined) => {
    onDateChange(date);
    if (date && selectedTime) {
      const newAvailableSlots = getAvailableTimeSlots(date, allTimeSlots);
      if (!newAvailableSlots.includes(selectedTime)) {
        onTimeChange('');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Same-Day Booking Notice */}
      {isSameDay && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-amber-700 dark:text-amber-400">Same-Day Booking</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A ${SAME_DAY_CONFIG.rushFeeCredits} credit rush fee applies. 
                  Requires {SAME_DAY_CONFIG.minimumHoursNotice} hours notice. 
                  Move-out cleaning not available same-day.
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 flex-shrink-0">
                +{rushFee} credits
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

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
              onSelect={handleDateChange}
              disabled={(date) => isBefore(date, minDate)}
              className={cn("p-3 pointer-events-auto")}
              initialFocus
            />
          </CardContent>
        </Card>
        {selectedDate && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Selected: <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            {isSameDay && <Badge variant="secondary" className="ml-2">Today</Badge>}
          </p>
        )}
      </div>

      {/* Time Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Select Time</h3>
          {isSameDay && availableTimeSlots.length < allTimeSlots.length && (
            <span className="text-xs text-muted-foreground">
              (Some times unavailable due to {SAME_DAY_CONFIG.minimumHoursNotice}hr notice)
            </span>
          )}
        </div>
        
        {availableTimeSlots.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <p className="font-medium text-sm">No time slots available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Same-day bookings require {SAME_DAY_CONFIG.minimumHoursNotice} hours notice. 
                Please select tomorrow or a future date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allTimeSlots.map((time) => {
              const isAvailable = availableTimeSlots.includes(time);
              return (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => isAvailable && onTimeChange(time)}
                  disabled={!isAvailable}
                  className={cn(
                    'h-12',
                    selectedTime === time && 'ring-2 ring-primary ring-offset-2',
                    !isAvailable && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {formatTimeLabel(time)}
                </Button>
              );
            })}
          </div>
        )}
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
              <div className="flex items-center gap-2">
                {isSameDay && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">
                    Rush
                  </Badge>
                )}
                <Badge variant="secondary">Confirmed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
