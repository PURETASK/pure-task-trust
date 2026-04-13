import { Link } from "react-router-dom";
import { Wallet, AlertTriangle, Info, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  availableBalance: number;
  heldBalance: number;
  walletState: "normal" | "low_balance" | "payment_issue";
}

export function WalletSnapshotCard({ availableBalance, heldBalance, walletState }: Props) {
  const borderClass =
    walletState === "payment_issue"
      ? "border-destructive/40"
      : walletState === "low_balance"
      ? "border-warning/40"
      : "border-border/60";

  return (
    <Card className={borderClass}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Wallet</h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-medium">
            Auto Top-Up: Off
          </Badge>
        </div>

        {/* Warning banners */}
        {walletState === "payment_issue" && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <p className="text-xs font-medium text-destructive">
              Your last payment failed. Update your payment method.
            </p>
          </div>
        )}
        {walletState === "low_balance" && (
          <div className="rounded-lg bg-warning/10 border border-warning/30 px-3 py-2 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
            <p className="text-xs font-medium text-warning">
              Your balance is low. Top up to avoid booking interruptions.
            </p>
          </div>
        )}

        {/* Balances */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available</span>
            <span className="text-xl font-bold">{availableBalance.toLocaleString()} cr</span>
          </div>
          {heldBalance > 0 && (
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                      Held <Info className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Held for upcoming cleaning. Released after approval.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-muted-foreground">{heldBalance.toLocaleString()} cr</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mb-4">
          Unused held credits are returned automatically.
        </p>

        <Button size="sm" variant="outline" asChild className="w-full gap-2">
          <Link to="/wallet">
            <CreditCard className="h-3.5 w-3.5" />
            Add Credits
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
