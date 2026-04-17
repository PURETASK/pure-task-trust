import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Search, Shield, Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import zipGateBg from "@/assets/zip-gate-bg.png";

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
      onResolved({ zip, lat: null, lng: null, city: "", state: "" });
    } finally {
      setLoading(false);
    }
  };

  // Compact card used inside the "Change ZIP" dialog
  if (variant === "modal") {
    return (
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
          Change your location
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter a new ZIP code to update which cleaners we show you.
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Update location
          </Button>
        </div>
      </motion.form>
    );
  }

  // Full-page dedicated experience
  return (
    <div className="relative min-h-screen w-full overflow-y-auto">
      {/* Background image */}
      <div className="fixed inset-0 -z-10">
        <img
          src={zipGateBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Dark gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,60%,6%)]/85 via-[hsl(220,55%,8%)]/65 to-[hsl(220,60%,6%)]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(220,60%,6%)/0.7_85%)]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mb-6 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--pt-aqua))] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--pt-aqua))]" />
            </span>
            <span className="text-xs font-medium text-white/90 tracking-wide">
              Verified cleaners in your area
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Find cleaners{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--pt-aqua))] via-[hsl(var(--pt-blue))] to-[hsl(var(--pt-aqua))] bg-clip-text text-transparent">
              near you
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            Enter your ZIP code so we can match you with background-checked cleaners
            who actually serve your neighborhood.
          </p>
        </motion.div>

        {/* Card */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-[hsl(var(--pt-aqua))]/20 border border-[hsl(var(--pt-aqua))]/40 mb-5 mx-auto">
            <MapPin className="h-7 w-7 text-[hsl(var(--pt-aqua))]" />
          </div>
          <label htmlFor="zip-input" className="block text-sm font-medium text-white/80 text-center mb-3">
            Your ZIP code
          </label>
          <Input
            id="zip-input"
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="90210"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            autoFocus
            className="h-14 text-center text-2xl tracking-[0.4em] font-bold bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-[hsl(var(--pt-aqua))] focus-visible:border-[hsl(var(--pt-aqua))]"
          />
          {error && (
            <p className="text-xs text-[hsl(var(--destructive))] text-center mt-3 font-medium">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full h-13 mt-4 rounded-xl gap-2 text-base font-semibold bg-gradient-to-r from-[hsl(var(--pt-aqua))] to-[hsl(var(--pt-blue))] hover:opacity-90 text-white border-0 shadow-lg shadow-[hsl(var(--pt-aqua))]/30"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding cleaners…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find cleaners near me
              </>
            )}
          </Button>
          <p className="text-xs text-white/50 text-center mt-4">
            We only use your ZIP to match you with local cleaners. No account needed.
          </p>
        </motion.form>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl w-full"
        >
          {[
            { icon: Shield, label: "Background checked" },
            { icon: Star, label: "Top-rated locals" },
            { icon: Users, label: "Real verified profiles" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-md">
                <Icon className="h-5 w-5 text-[hsl(var(--pt-aqua))]" />
              </div>
              <span className="text-xs sm:text-sm text-white/70 font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
