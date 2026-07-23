import { useEffect, useState } from "react";
import { SecurityGame } from "./SecurityGame";

export const LandingFooter = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    if (!isGameOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsGameOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOpen]);

  return (
    <>
      <footer className="border-t border-zinc-200/70 bg-white py-10 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">
          <div className="font-bold text-zinc-950 dark:text-white">MyAdmin</div>

          <button
            type="button"
            onClick={() => setIsGameOpen(true)}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:-translate-y-0.5 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            🎮 Play Mini-Game
          </button>

          <div className="text-xs text-zinc-500">© 2026 MyAdmin. All rights reserved.</div>
        </div>
      </footer>

      {isGameOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setIsGameOpen(false)}
              className="absolute -right-2 -top-12 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Close
            </button>
            <SecurityGame />
          </div>
        </div>
      )}
    </>
  );
};
