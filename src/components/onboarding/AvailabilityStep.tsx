import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityStepProps {
  onSubmit: (data: AvailabilityData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityData {
  schedule: Record<string, DaySchedule>;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

const TEMPLATES = [
  { 
    id: 'weekdays-9-5', 
    label: 'Weekdays 9-5',
    description: 'Mon-Fri, 9am to 5pm',
    schedule: {
      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    }
  },
  { 
    id: 'flexible', 
    label: 'Flexible',
    description: 'All week, 8am to 8pm',
    schedule: {
      monday: { enabled: true, startTime: '08:00', endTime: '20:00' },
      tuesday: { enabled: true, startTime: '08:00', endTime: '20:00' },
      wednesday: { enabled: true, startTime: '08:00', endTime: '20:00' },
      thursday: { enabled: true, startTime: '08:00', endTime: '20:00' },
      friday: { enabled: true, startTime: '08:00', endTime: '20:00' },
      saturday: { enabled: true, startTime: '08:00', endTime: '20:00' },
      sunday: { enabled: true, startTime: '08:00', endTime: '20:00' },
    }
  },
  { 
    id: 'weekends', 
    label: 'Weekends Only',
    description: 'Sat-Sun, 9am to 6pm',
    schedule: {
      monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: true, startTime: '09:00', endTime: '18:00' },
      sunday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    }
  },
];

const defaultSchedule: Record<string, DaySchedule> = {
  monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
};

export function AvailabilityStep({ onSubmit, onBack, isSubmitting }: AvailabilityStepProps) {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(defaultSchedule);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSchedule(template.schedule);
      setSelectedTemplate(templateId);
    }
  };

  const handleDayToggle = (day: string, enabled: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }));
    setSelectedTemplate(null);
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSelectedTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ schedule });
  };

  const enabledDays = Object.values(schedule).filter((d) => d.enabled).length;
  const isValid = enabledDays > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Set Your Availability
        </CardTitle>
        <CardDescription>
          Choose when you're available to take cleaning jobs. You can always adjust this later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Templates */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick Setup
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-colors',
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="text-sm font-medium">{template.label}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Day-by-day schedule */}
          <div className="space-y-3">
            <Label>Customize by Day</Label>
            <div className="space-y-2">
              {DAYS.map(({ key, label, short }) => (
                <div
                  key={key}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    schedule[key].enabled ? 'bg-muted/50' : 'bg-background'
                  )}
                >
                  <Switch
                    checked={schedule[key].enabled}
                    onCheckedChange={(checked) => handleDayToggle(key, checked)}
                  />
                  <span className="w-12 text-sm font-medium">{short}</span>
                  
                  {schedule[key].enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <Select
                        value={schedule[key].startTime}
                        onValueChange={(value) => handleTimeChange(key, 'startTime', value)}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground text-xs">to</span>
                      <Select
                        value={schedule[key].endTime}
                        onValueChange={(value) => handleTimeChange(key, 'endTime', value)}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">
              {enabledDays === 0 
                ? 'No days selected' 
                : `Available ${enabledDays} day${enabledDays !== 1 ? 's' : ''} per week`}
            </p>
            <p className="text-xs text-muted-foreground">
              {enabledDays === 0 
                ? 'Select at least one day to continue.' 
                : 'You can modify your availability anytime from your dashboard.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
