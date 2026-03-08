import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, AlertTriangle, FileText, Info } from "lucide-react";

interface ClientBriefCardProps {
  notes?: string | null;
  clientFirstName?: string | null;
  cleaningType?: string;
  isFirstTimeAtAddress?: boolean;
  preferences?: {
    has_pets?: boolean;
    pet_details?: string;
    has_own_supplies?: boolean;
    special_instructions?: string;
  } | null;
}

export function ClientBriefCard({
  notes,
  clientFirstName,
  cleaningType,
  isFirstTimeAtAddress = false,
  preferences,
}: ClientBriefCardProps) {
  const [open, setOpen] = useState(true);

  const hasContent = notes || preferences?.has_pets || preferences?.has_own_supplies || isFirstTimeAtAddress;
  if (!hasContent) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="p-4">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-sm">Client Brief</p>
              <p className="text-xs text-muted-foreground">
                {clientFirstName ? `${clientFirstName}'s preferences & instructions` : "Job instructions"}
              </p>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {open && (
          <div className="mt-3 space-y-3 pt-3 border-t border-warning/20">
            {isFirstTimeAtAddress && (
              <div className="flex items-start gap-2 p-2.5 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-warning">First time at this address — take extra care with setup and check-in.</p>
              </div>
            )}

            {notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Special Instructions</p>
                <p className="text-sm bg-background/60 p-2.5 rounded-lg border border-warning/20">{notes}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {preferences?.has_pets && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  🐾 Pets present{preferences.pet_details ? ` — ${preferences.pet_details}` : ""}
                </Badge>
              )}
              {preferences?.has_own_supplies && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  🧹 Client provides supplies
                </Badge>
              )}
              {cleaningType === "deep" && (
                <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary">
                  <Info className="h-3 w-3" /> Deep clean — extra time budgeted
                </Badge>
              )}
              {cleaningType === "move_out" && (
                <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary">
                  <Info className="h-3 w-3" /> Move-out — full empty property
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
