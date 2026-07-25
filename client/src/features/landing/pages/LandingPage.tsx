import { Hero } from "../components/Hero";
import { BentoFeatures } from "../components/BentoFeatures";
import { ArchitectureShowcase } from "../components/ArchitectureShowcase";
import { LandingFooter } from "../components/LandingFooter";
import { PublicLayout } from "@/layouts/PublicLayout";
import { StarryBackground } from "@/core/components/StarryBackground";

export default function LandingPage() {
  return (
    <PublicLayout className="min-h-screen px-6 py-4" mainClassName="flex-1" footer={<LandingFooter />}>
      <StarryBackground />
      <Hero />
      <BentoFeatures />
      <ArchitectureShowcase />
    </PublicLayout>
  );
}
