import { Hero } from "../components/Hero";
import { PublicLayout } from "@/layouts/PublicLayout";
import { StarryBackground } from "@/core/components/StarryBackground";

export default function LandingPage() {
  return (
    <PublicLayout
      className="h-screen max-h-screen overflow-hidden flex flex-col justify-between px-6 py-4"
      mainClassName="min-h-0 flex-1 flex items-center overflow-hidden"
      footer={
        <footer className="shrink-0 border-t border-white/50 bg-white/70 px-4 py-2 text-xs text-neutral-500 backdrop-blur-2xl dark:border-zinc-800/70 dark:bg-black/55 dark:text-zinc-500">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <span>Copyright 2026 MyAdmin.</span>
            <span className="font-semibold text-neutral-700 dark:text-zinc-300">v1.0.0 Production-Ready</span>
          </div>
        </footer>
      }
    >
      <StarryBackground />
      <Hero />
    </PublicLayout>
  );
}
