import { Hero } from "../components/Hero";
import { CapabilitiesGrid } from "../components/CapabilitiesGrid";
import { ProductScreens } from "../components/ProductScreens";
import { SecuritySection } from "../components/SecuritySection";
import { DocumentationSection } from "../components/DocumentationSection";
import { LandingFooter } from "../components/LandingFooter";
import { PublicLayout } from "@/layouts/PublicLayout";

export default function LandingPage() {
  return (
    <PublicLayout className="min-h-screen" mainClassName="flex-1" footer={<LandingFooter />}>
      <Hero />
      <CapabilitiesGrid />
      <ProductScreens />
      <SecuritySection />
      <DocumentationSection />
    </PublicLayout>
  );
}
