export const LandingFooter = () => {
  return (
    <footer className="bg-white dark:bg-black py-12 border-t border-neutral-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-bold text-neutral-950 dark:text-white">MyAdmin</div>
        <div className="text-sm text-neutral-600 dark:text-zinc-400">
          Secure administration for identity, roles, and audit operations.
        </div>
        <div className="text-xs text-neutral-500 dark:text-zinc-500">
          Copyright 2026 MyAdmin. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
