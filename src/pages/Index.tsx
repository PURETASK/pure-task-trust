import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { TrustPillars } from "@/components/home/TrustPillars";
import { HowItWorks } from "@/components/home/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustPillars />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
