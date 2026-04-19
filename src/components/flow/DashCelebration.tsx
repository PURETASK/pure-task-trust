import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import dashImg from "@/assets/brand/dash-hummingbird.png";

interface Props {
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Branded celebration moment featuring Dash the hummingbird.
 * Used on booking confirmation, setup completion, and other success states.
 */
export function DashCelebration({ title, subtitle, size = "md" }: Props) {
  const sizes = {
    sm: "h-20 w-20",
    md: "h-28 w-28 sm:h-32 sm:w-32",
    lg: "h-32 w-32 sm:h-40 sm:w-40",
  };

  return (
    <div className="relative text-center py-2">
      {/* Glow halo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-x-0 top-0 mx-auto h-40 w-40 rounded-full bg-gradient-aero opacity-20 blur-3xl pointer-events-none"
      />

      {/* Floating sparkles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -30, scale: 1 }}
          transition={{
            duration: 1.6,
            delay: 0.3 + i * 0.15,
            repeat: Infinity,
            repeatDelay: 2.4,
          }}
          className="absolute pointer-events-none"
          style={{
            left: `${40 + i * 8}%`,
            top: `${20 + (i % 2) * 10}%`,
          }}
        >
          <Sparkles className="h-3 w-3 text-aero-cyan" />
        </motion.div>
      ))}

      {/* Dash */}
      <motion.img
        src={dashImg}
        alt=""
        loading="lazy"
        initial={{ scale: 0.4, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
        className={`relative mx-auto ${sizes[size]} drop-shadow-[0_12px_32px_hsl(var(--aero-cyan)/0.4)]`}
      />

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="font-poppins text-2xl sm:text-3xl font-semibold tracking-tight mt-4"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-aero-soft max-w-sm mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
