import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { WhyChoose } from "@/components/home/WhyChoose";
import { StatsSection } from "@/components/home/StatsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhoIsFor } from "@/components/home/WhoIsFor";
import { CleanerCTA } from "@/components/home/CleanerCTA";
import { ReadyToBook } from "@/components/home/ReadyToBook";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <WhyChoose />
        <StatsSection />
        <HowItWorksSection />
        <WhoIsFor />
        <CleanerCTA />
        <ReadyToBook />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
