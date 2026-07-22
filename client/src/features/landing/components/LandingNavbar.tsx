import { Link } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { ThemeToggle } from "@/core/components/ThemeToggle";

export const LandingNavbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-zinc-800 transition-colors">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          MyAdmin
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            to="/login" 
            className="hidden md:inline-flex rounded-md px-3 py-2 text-neutral-700 dark:text-zinc-300 font-medium hover:text-black dark:hover:text-white dark:border dark:border-zinc-800 transition-colors"
          >
            Sign In
          </Link>
          <Button asChild className="bg-neutral-950 text-white hover:bg-neutral-800 font-semibold px-6 transition-all dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:border dark:border-zinc-700">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
