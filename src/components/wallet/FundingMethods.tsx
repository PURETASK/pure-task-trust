import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, Star, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const brandIcons: Record<string, string> = {
  visa: "💳", mastercard: "💳", amex: "💳", discover: "💳",
};

export function FundingMethods() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("list-payment-methods");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { methods: PaymentMethod[]; defaultId: string | null };
    },
    staleTime: 30_000,
  });
  const methods = data?.methods ?? [];

  // Handle return from Stripe Checkout
  useEffect(() => {
    const saved = params.get("card_saved");
    if (saved === "1") {
      toast.success("Card saved");
      qc.invalidateQueries({ queryKey: ["payment-methods"] });
      params.delete("card_saved");
      setParams(params, { replace: true });
    } else if (saved === "0") {
      params.delete("card_saved");
      setParams(params, { replace: true });
    }
  }, [params, setParams, qc]);

  const addCard = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-setup-session");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url as string;
    },
    onError: (e: any) => toast.error(e?.message || "Failed to start card setup"),
  });

  const manage = useMutation({
    mutationFn: async ({ action, id }: { action: "delete" | "set_default"; id: string }) => {
      const { data, error } = await supabase.functions.invoke("manage-payment-method", {
        body: { action, paymentMethodId: id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.action === "delete" ? "Card removed" : "Default card updated");
      qc.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update card"),
  });

  const handleAdd = () => addCard.mutate();

  return (
    <div className="palette-card palette-card-purple overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="palette-icon palette-icon-purple h-10 w-10">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-poppins font-bold">Funding Methods</h2>
              <p className="text-xs text-ink-muted">Manage your saved payment methods</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs rounded-xl h-9"
            onClick={handleAdd}
            disabled={addCard.isPending}
          >
            {addCard.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add Card
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-ink-muted" />
          </div>
        ) : methods.length === 0 ? (
          <div className="py-10 text-center">
            <div className="palette-icon palette-icon-purple h-14 w-14 mx-auto mb-4">
              <CreditCard className="h-7 w-7" />
            </div>
            <p className="font-bold text-ink-muted">No payment methods saved</p>
            <p className="text-sm text-ink-muted mt-1 max-w-xs mx-auto">
              Add a card to buy credits faster and enable auto top-up.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={handleAdd} disabled={addCard.isPending}>
              {addCard.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Payment Method
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
                <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all">
                  <div className="palette-icon palette-icon-purple h-11 w-11 text-lg">
                    {brandIcons[method.brand.toLowerCase()] || "💳"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm capitalize">{method.brand}</p>
                      <span className="text-sm text-ink-muted">•••• {method.last4}</span>
                      {method.is_default && (
                        <Badge className="palette-pill-blue text-[10px] h-5 px-2 font-bold">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      Expires {method.exp_month.toString().padStart(2, "0")}/{method.exp_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!method.is_default && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-ink-muted hover:text-primary"
                        title="Set as default"
                        disabled={manage.isPending}
                        onClick={() => manage.mutate({ action: "set_default", id: method.id })}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-ink-muted hover:text-destructive"
                      title="Remove"
                      disabled={manage.isPending}
                      onClick={() => {
                        if (confirm(`Remove ${method.brand} ending in ${method.last4}?`)) {
                          manage.mutate({ action: "delete", id: method.id });
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-xs text-ink-muted text-center mt-4 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Card details are securely stored by Stripe. PureTask never sees your full card number.
        </p>
      </div>
    </div>
  );
}
