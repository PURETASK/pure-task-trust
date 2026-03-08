import { forwardRef } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialCardProps {
  authorName: string;
  authorRole?: string | null;
  authorLocation?: string | null;
  quote: string;
  rating: number;
  avatarUrl?: string | null;
  variant?: "default" | "compact";
}

export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  function TestimonialCard(
    { authorName, authorRole, authorLocation, quote, rating, avatarUrl, variant = "default" }: TestimonialCardProps,
    ref
  ) {
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
          <div className="flex gap-1 mb-2">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-pt-amber text-pt-amber" />
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
    <Card className="bg-card border-border/50 h-full shadow-soft hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <Quote className="h-8 w-8 text-primary/20 mb-4 flex-shrink-0" />
        
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-pt-amber text-pt-amber" : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <blockquote className="text-foreground/90 leading-relaxed mb-6 flex-grow">
          "{quote}"
        </blockquote>

        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl ?? undefined} alt={authorName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
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
