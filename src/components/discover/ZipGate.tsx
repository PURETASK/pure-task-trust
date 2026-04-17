import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ResolvedLocation {
  zip: string;
  lat: number | null;
  lng: number | null;
  city: string;
  state: string;
}

interface ZipGateProps {
  onResolved: (loc: ResolvedLocation) => void;
  initialZip?: string;
  variant?: "full" | "modal";
}

const ZIP_RE = /^\d{5}$/;

export function ZipGate({ onResolved, initialZip = "", variant = "full" }: ZipGateProps) {
  const [zip, setZip] = useState(initialZip);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ZIP_RE.test(zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        postalcode: zip,
        country: "us",
        format: "json",
        addressdetails: "1",
        limit: "1",
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      const first = data?.[0];
      if (!first) {
        setError("We couldn't find that ZIP. Try another.");
        setLoading(false);
        return;
      }
      const addr = first.address ?? {};
      onResolved({
        zip,
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        city: addr.city || addr.town || addr.village || addr.county || "",
        state:
          (addr["ISO3166-2-lvl4"] as string | undefined)?.replace("US-", "") ||
          addr.state ||
          "",
      });
    } catch {
      // Network failure — still let user proceed with ZIP-only matching
      onResolved({ zip, lat: null, lng: null, city: "", state: "" });
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-elevated"
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4 mx-auto">
        <MapPin className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
        Find cleaners near you
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter your ZIP code and we'll show only cleaners who serve your area.
      </p>
      <div className="space-y-3">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="ZIP code (e.g. 90210)"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          autoFocus
          className="text-center text-lg tracking-widest font-semibold"
        />
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Button type="submit" className="w-full h-12 rounded-xl gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Find cleaners
        </Button>
      </div>
    </motion.form>
  );

  if (variant === "modal") return card;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      {card}
    </div>
  );
}
