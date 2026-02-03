import { SEO, OrganizationSchema, LocalBusinessSchema } from "@/components/seo";
import { AggregateRatingSchema } from "@/components/seo/AggregateRatingSchema";
import { Hero } from "@/components/home/Hero";
import { WhyChoose } from "@/components/home/WhyChoose";
import { StatsSection } from "@/components/home/StatsSection";
import { PlatformFee } from "@/components/home/PlatformFee";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhoIsFor } from "@/components/home/WhoIsFor";
import { CleanerCTA } from "@/components/home/CleanerCTA";
import { ReadyToBook } from "@/components/home/ReadyToBook";
import { TestimonialsCarousel } from "@/components/social-proof";

const Index = () => {
  return (
    <main className="overflow-x-hidden">
      <SEO 
        url="/"
        keywords="cleaning services, house cleaning, professional cleaners, background checked cleaners, verified cleaners"
      />
      <OrganizationSchema />
      <LocalBusinessSchema />
      <AggregateRatingSchema />
      <Hero />
      <WhyChoose />
      <StatsSection />
      <PlatformFee />
      <HowItWorksSection />
      <TestimonialsCarousel />
      <WhoIsFor />
      <CleanerCTA />
      <ReadyToBook />
    </main>
  );
};

export default Index;
