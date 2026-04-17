import { MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResolvedLocation } from "./ZipGate";

interface Props {
  location: ResolvedLocation;
  onChange: () => void;
}

export function LocationBar({ location, onChange }: Props) {
  const label =
    location.city && location.state
      ? `${location.city}, ${location.state} ${location.zip}`
      : location.zip;

  return (
    <div className="bg-primary/5 border-b border-primary/10">
      <div className="container px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-muted-foreground truncate">
            Showing cleaners near{" "}
            <span className="font-semibold text-foreground">{label}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onChange}
          className="h-8 gap-1.5 flex-shrink-0 text-primary hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
          Change
        </Button>
      </div>
    </div>
  );
}
