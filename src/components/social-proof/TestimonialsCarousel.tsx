import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TestimonialCard } from "./TestimonialCard";
import { useFeaturedTestimonials, type Testimonial } from "@/hooks/useFeaturedTestimonials";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: "1", author_name: "Jennifer M.", author_role: "Busy Professional", author_location: "Austin, TX", quote: "Finally, a cleaning service I can trust! The GPS check-in and photo proof give me total peace of mind. My apartment has never looked better.", rating: 5, avatar_url: null },
  { id: "2", author_name: "Robert & Linda K.", author_role: "Retirees", author_location: "Dallas, TX", quote: "As seniors, safety is our top priority. Knowing every cleaner is background-checked and ID-verified makes all the difference. Wonderful service!", rating: 5, avatar_url: null },
  { id: "3", author_name: "Marcus T.", author_role: "Airbnb Superhost", author_location: "Houston, TX", quote: "Game changer for my rental properties! The before/after photos protect me from disputes, and the escrow system means I only pay for quality work.", rating: 5, avatar_url: null },
  { id: "4", author_name: "Sarah & Mike D.", author_role: "Family with Kids", author_location: "San Antonio, TX", quote: "With two young kids and a dog, we needed cleaners we could absolutely trust. PureTask exceeded our expectations — reliable, thorough, and professional.", rating: 5, avatar_url: null },
  { id: "5", author_name: "Amanda L.", author_role: "Working Mom", author_location: "Austin, TX", quote: "The booking process is so simple, and I love that I can see exactly when the cleaner arrives and leaves. No more wondering if they actually came!", rating: 5, avatar_url: null },
  { id: "6", author_name: "David C.", author_role: "Property Manager", author_location: "Fort Worth, TX", quote: "Managing 15 units used to be a nightmare. Now I have a network of verified cleaners I can trust, with photo documentation for every turnover.", rating: 5, avatar_url: null },
];

export function TestimonialsCarousel() {
  const { data: fetchedTestimonials, isLoading, isError } = useFeaturedTestimonials();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Use fallback data if fetch failed or returned empty
  const testimonials = (isError || !fetchedTestimonials?.length) && !isLoading
    ? FALLBACK_TESTIMONIALS
    : (fetchedTestimonials ?? []);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Auto-advance carousel
  useEffect(() => {
    if (!api || !testimonials.length) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [api, testimonials.length]);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30 overflow-x-hidden">
      <div className="container px-4 sm:px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Clients & Cleaners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust PureTask for their cleaning needs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative px-4 sm:px-12"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <TestimonialCard
                    authorName={testimonial.author_name}
                    authorRole={testimonial.author_role}
                    authorLocation={testimonial.author_location}
                    quote={testimonial.quote}
                    rating={testimonial.rating}
                    avatarUrl={testimonial.avatar_url}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
