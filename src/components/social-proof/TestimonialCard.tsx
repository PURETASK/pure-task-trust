import { forwardRef } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const CARD_COLORS = [
  { bg: "bg-[hsl(211,100%,50%)]/20", border: "border-[hsl(211,100%,50%)]/50", quote: "text-[hsl(211,100%,50%)]/40", avatar: "bg-[hsl(211,100%,50%)]/25 text-[hsl(211,100%,50%)]" },   // Blue
  { bg: "bg-[hsl(152,63%,48%)]/20",  border: "border-[hsl(152,63%,48%)]/50",  quote: "text-[hsl(152,63%,48%)]/40",  avatar: "bg-[hsl(152,63%,48%)]/25 text-[hsl(152,63%,48%)]" },    // Green
  { bg: "bg-[hsl(30,100%,50%)]/20",   border: "border-[hsl(30,100%,50%)]/50",   quote: "text-[hsl(30,100%,50%)]/40",  avatar: "bg-[hsl(30,100%,50%)]/25 text-[hsl(30,100%,50%)]" },    // Orange
  { bg: "bg-[hsl(291,76%,42%)]/20",   border: "border-[hsl(291,76%,42%)]/50",   quote: "text-[hsl(291,76%,42%)]/40",  avatar: "bg-[hsl(291,76%,42%)]/25 text-[hsl(291,76%,42%)]" },    // Purple
] as const;

interface TestimonialCardProps {
  authorName: string;
  authorRole?: string | null;
  authorLocation?: string | null;
  quote: string;
  rating: number;
  avatarUrl?: string | null;
  variant?: "default" | "compact";
  colorIndex?: number;
}

export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  function TestimonialCard(
    { authorName, authorRole, authorLocation, quote, rating, avatarUrl, variant = "default", colorIndex = 0 }: TestimonialCardProps,
    _ref
  ) {
    const colors = CARD_COLORS[colorIndex % CARD_COLORS.length];
    const initials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (variant === "compact") {
      return (
        <Card className="bg-card border-border/50 h-full">
          <CardContent className="p-4">
            <div className="flex gap-1 mb-2 justify-center">
              {Array.from({ length: rating }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: [0, 1.6, 1], opacity: 1 }} viewport={{ once: false, amount: 0.5 }} transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}>
                  <Star className="h-5 w-5 fill-[hsl(45,100%,58%)] text-[hsl(40,100%,50%)] stroke-[1.5] drop-shadow-sm" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">"{quote}"</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={avatarUrl ?? undefined} alt={authorName} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground">{authorName}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`${colors.bg} ${colors.border} border-2 rounded-3xl h-full shadow-soft hover:shadow-md transition-shadow duration-300`}>
        <CardContent className="p-6 flex flex-col h-full">
          <Quote className={`h-8 w-8 ${colors.quote} mb-4 flex-shrink-0`} />

          <div className="flex gap-1.5 mb-4 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: [0, 1.6, 1], opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
              >
                <Star
                  className={`h-6 w-6 drop-shadow-sm ${
                    i < rating ? "fill-[hsl(45,100%,58%)] text-[hsl(40,100%,50%)] stroke-[1.5]" : "fill-muted/40 text-muted-foreground/20 stroke-[1.5]"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          <blockquote className="text-foreground/90 leading-relaxed mb-6 flex-grow">
            "{quote}"
          </blockquote>

          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl ?? undefined} alt={authorName} />
              <AvatarFallback className={`${colors.avatar} font-medium`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{authorName}</p>
              <p className="text-sm text-muted-foreground">
                {[authorRole, authorLocation].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
