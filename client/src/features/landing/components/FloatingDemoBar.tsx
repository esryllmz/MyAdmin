import { useState } from "react";
import { Eye, PenSquare, Shield, Sparkles, X } from "lucide-react";
import { useInstantDemo, type DemoRole } from "../hooks/useInstantDemo";

const ROLE_OPTIONS: Array<{ role: DemoRole; icon: typeof Shield; description: string }> = [
  { role: "Admin", icon: Shield, description: "Tüm sistem üzerinde tam yetki" },
  { role: "Editor", icon: PenSquare, description: "İçerik yönetimi ve kullanıcı görüntüleme" },
  { role: "Viewer", icon: Eye, description: "Sadece görüntüleme yetkisi" },
];

const DISMISS_KEY = "demoBarDismissed";

export const FloatingDemoBar = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const startInstantDemo = useInstantDemo();

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-1 rounded-2xl border border-zinc-200/80 bg-white/90 p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="hidden items-center gap-1.5 pl-2.5 pr-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          Rol seçip anında keşfet
        </div>

        <div className="mx-0.5 hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

        {ROLE_OPTIONS.map(({ role, icon: Icon, description }) => (
          <button
            key={role}
            type="button"
            onClick={() => startInstantDemo(role)}
            title={description}
            className="group inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-amber-400 hover:via-pink-500 hover:to-violet-500 hover:text-white hover:shadow-[0_8px_20px_-6px_rgba(168,85,247,0.5)] dark:text-zinc-300"
          >
            <Icon className="h-3.5 w-3.5" />
            {role}
          </button>
        ))}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Demo çubuğunu kapat"
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
