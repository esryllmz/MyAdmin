import { Hero } from "../components/Hero";
import { CapabilitiesGrid } from "../components/CapabilitiesGrid";
import { WorkflowSection } from "../components/WorkflowSection";
import { SecuritySection } from "../components/SecuritySection";
import { ProductScreens } from "../components/ProductScreens";
import { LandingFooter } from "../components/LandingFooter";
import { PublicLayout } from "@/layouts/PublicLayout";

export default function LandingPage() {
  return (
    <PublicLayout className="min-h-screen" mainClassName="flex-1" footer={<LandingFooter />}>
      <Hero />
      <CapabilitiesGrid />
      <WorkflowSection />
      <SecuritySection />
      <ProductScreens />
    </PublicLayout>
  );
}
