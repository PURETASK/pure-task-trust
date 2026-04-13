import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

// Placeholder — will be wired to Stripe customer payment methods
const mockMethods: PaymentMethod[] = [];

const brandIcons: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
};

export function FundingMethods() {
  const methods = mockMethods;

  return (
    <div className="rounded-3xl border-2 border-border/40 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--pt-aqua))]/10 border-2 border-[hsl(var(--pt-aqua))]/30 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[hsl(var(--pt-aqua))]" />
            </div>
            <div>
              <h2 className="text-lg font-black">Funding Methods</h2>
              <p className="text-xs text-muted-foreground">Manage your saved payment methods</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs rounded-xl h-9">
            <Plus className="h-3.5 w-3.5" /> Add Card
          </Button>
        </div>

        {methods.length === 0 ? (
          <div className="py-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-muted-foreground">No payment methods saved</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Add a card to buy credits faster and enable auto top-up.
            </p>
            <Button size="sm" className="mt-4 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {methods.map((method, i) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-card transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-muted border-2 border-border/40 flex items-center justify-center text-lg flex-shrink-0">
                      {brandIcons[method.brand.toLowerCase()] || "💳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm capitalize">{method.brand}</p>
                        <span className="text-sm text-muted-foreground">•••• {method.last4}</span>
                        {method.is_default && (
                          <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] h-5 px-2 font-bold">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires {method.exp_month.toString().padStart(2, "0")}/{method.exp_year}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!method.is_default && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Set as default">
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Card details are securely stored by Stripe. PureTask never sees your full card number.
        </p>
      </div>
    </div>
  );
}
