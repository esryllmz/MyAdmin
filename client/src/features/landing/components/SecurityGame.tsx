import { useEffect, useRef, useState } from "react";

type GameMode = "watch" | "play";

type Threat = {
  x: number;
  width: number;
  height: number;
  label: string;
};

type Crystal = {
  x: number;
  y: number;
  label: string;
  phase: number;
};

const threats: Threat[] = [
  { x: 520, width: 112, height: 42, label: "Race Condition" },
  { x: 830, width: 104, height: 42, label: "Auth Bypass" },
  { x: 1140, width: 122, height: 42, label: "401 Unauthorized" },
];

const crystals: Crystal[] = [
  { x: 410, y: 92, label: "JWT Token", phase: 0 },
  { x: 710, y: 72, label: "Audit Log", phase: 1.8 },
  { x: 1030, y: 96, label: "JWT Token", phase: 3.2 },
];

export const SecurityGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const jumpRef = useRef(false);
  const [mode, setMode] = useState<GameMode>("watch");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let runnerY = 0;
    let velocityY = 0;
    let scroll = 0;

    const width = 920;
    const height = 260;
    const groundY = 196;
    const runnerX = 106;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const jump = () => {
      if (runnerY === 0) {
        velocityY = 8.5;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        jump();
      }
    };

    const handlePointerDown = () => {
      jump();
    };

    const drawPixelAdmin = (x: number, y: number, frame: number) => {
      const footOffset = Math.sin(frame / 120) * 3;
      context.fillStyle = "#18181b";
      context.fillRect(x + 16, y + 8, 22, 22);
      context.fillStyle = "#f8fafc";
      context.fillRect(x + 21, y + 15, 4, 4);
      context.fillRect(x + 31, y + 15, 4, 4);
      context.fillStyle = "#8b5cf6";
      context.fillRect(x + 13, y + 30, 28, 36);
      context.fillStyle = "#22c55e";
      context.fillRect(x + 19, y + 38, 16, 5);
      context.fillStyle = "#18181b";
      context.fillRect(x + 15, y + 66, 7, 17 + footOffset);
      context.fillRect(x + 32, y + 66, 7, 17 - footOffset);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      const panelGradient = context.createLinearGradient(0, 0, width, height);
      panelGradient.addColorStop(0, isDark ? "rgba(24,24,27,0.86)" : "rgba(255,255,255,0.86)");
      panelGradient.addColorStop(1, isDark ? "rgba(9,9,11,0.9)" : "rgba(244,244,245,0.86)");
      context.fillStyle = panelGradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = isDark ? "rgba(63,63,70,0.45)" : "rgba(212,212,216,0.72)";
      for (let x = -40; x < width + 40; x += 40) {
        const gridX = (x - (scroll % 40) + width) % width;
        context.fillRect(gridX, groundY + 22, 20, 2);
      }

      context.fillStyle = isDark ? "#3f3f46" : "#d4d4d8";
      context.fillRect(0, groundY + 24, width, 2);

      scroll = (scroll + (mode === "play" ? 2.8 : 1.5)) % 1260;

      if (mode === "watch" && Math.sin(time / 520) > 0.88) {
        velocityY = Math.max(velocityY, 7);
      }

      if (jumpRef.current) {
        jump();
        jumpRef.current = false;
      }

      runnerY += velocityY;
      velocityY -= 0.42;
      if (runnerY < 0) {
        runnerY = 0;
        velocityY = 0;
      }

      for (const crystal of crystals) {
        const x = crystal.x - scroll;
        const wrappedX = x < -80 ? x + 1260 : x;
        const bob = Math.sin(time / 280 + crystal.phase) * 5;
        context.save();
        context.translate(wrappedX, crystal.y + bob);
        context.rotate(Math.PI / 4);
        context.fillStyle = crystal.label === "JWT Token" ? "#a78bfa" : "#34d399";
        context.shadowColor = crystal.label === "JWT Token" ? "#a78bfa" : "#34d399";
        context.shadowBlur = 18;
        context.fillRect(-8, -8, 16, 16);
        context.restore();
        context.shadowBlur = 0;
        context.fillStyle = isDark ? "#d4d4d8" : "#52525b";
        context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(crystal.label, wrappedX - 28, crystal.y + 30 + bob);
      }

      for (const threat of threats) {
        const x = threat.x - scroll;
        const wrappedX = x < -160 ? x + 1260 : x;
        const y = groundY - threat.height + 24;
        context.fillStyle = isDark ? "rgba(127,29,29,0.72)" : "rgba(254,226,226,0.95)";
        context.strokeStyle = isDark ? "rgba(248,113,113,0.45)" : "rgba(239,68,68,0.38)";
        context.lineWidth = 1;
        context.beginPath();
        context.roundRect(wrappedX, y, threat.width, threat.height, 8);
        context.fill();
        context.stroke();
        context.fillStyle = isDark ? "#fecaca" : "#991b1b";
        context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(threat.label, wrappedX + 10, y + 25);
      }

      drawPixelAdmin(runnerX, groundY - 62 - runnerY, time);

      context.fillStyle = isDark ? "#fafafa" : "#18181b";
      context.font = "700 13px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillText("Threats Mitigated: 100%", 24, 34);
      context.fillStyle = isDark ? "#a1a1aa" : "#71717a";
      context.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillText(mode === "play" ? "Space / Click to jump" : "Simulation autoplay", 24, 56);

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("pointerdown", handlePointerDown);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrame);
    };
  }, [mode]);

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 shadow-2xl shadow-zinc-900/10 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            Security Simulator
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Admin Runner: Zero-Trust Pipeline</p>
        </div>
        <button
          type="button"
          onClick={() => setMode((current) => (current === "play" ? "watch" : "play"))}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {mode === "play" ? "Watch Simulation" : "Play: Space / Click"}
        </button>
      </div>
      <div className="aspect-[16/5] min-h-48">
        <canvas ref={canvasRef} className="block h-full w-full cursor-pointer" aria-label="Interactive security simulator" />
      </div>
    </div>
  );
};
