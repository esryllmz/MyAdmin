import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
};

export const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let stars: Star[] = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const starCount = Math.min(220, Math.floor((window.innerWidth * window.innerHeight) / 6500));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 1,
        speed: Math.random() * 0.22 + 0.08,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const isDark = document.documentElement.classList.contains("dark");

      if (!isDark) {
        const aura = context.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
        aura.addColorStop(0, "rgba(129, 140, 248, 0.10)");
        aura.addColorStop(0.45, "rgba(244, 244, 245, 0.36)");
        aura.addColorStop(1, "rgba(14, 165, 233, 0.08)");
        context.fillStyle = aura;
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);

        const radialOne = context.createRadialGradient(
          window.innerWidth * 0.2,
          window.innerHeight * 0.2,
          0,
          window.innerWidth * 0.2,
          window.innerHeight * 0.2,
          window.innerWidth * 0.45,
        );
        radialOne.addColorStop(0, "rgba(168, 85, 247, 0.10)");
        radialOne.addColorStop(1, "rgba(168, 85, 247, 0)");
        context.fillStyle = radialOne;
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);

        const radialTwo = context.createRadialGradient(
          window.innerWidth * 0.82,
          window.innerHeight * 0.18,
          0,
          window.innerWidth * 0.82,
          window.innerHeight * 0.18,
          window.innerWidth * 0.38,
        );
        radialTwo.addColorStop(0, "rgba(14, 165, 233, 0.08)");
        radialTwo.addColorStop(1, "rgba(236, 72, 153, 0)");
        context.fillStyle = radialTwo;
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      } else {
        context.fillStyle = "rgba(0, 0, 0, 0.18)";
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);

        for (const star of stars) {
          star.y += star.speed;
          star.x += star.speed * 0.25;

          if (star.y > window.innerHeight + 4) star.y = -4;
          if (star.x > window.innerWidth + 4) star.x = -4;

          const alpha = 0.6 + Math.sin(time / 320 + star.phase) * 0.3;
          context.beginPath();
          context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(255, 255, 255, ${Math.min(0.9, Math.max(0.3, alpha))})`;
          context.shadowColor = "rgba(168, 85, 247, 0.75)";
          context.shadowBlur = 12;
          context.fill();
          context.shadowBlur = 0;
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    animationFrame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none w-full h-full bg-white dark:bg-black"
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_18%_20%,rgba(129,140,248,0.10),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.08),transparent_25%)] dark:bg-[radial-gradient(circle_at_22%_20%,rgba(129,140,248,0.14),transparent_28%),radial-gradient(circle_at_74%_10%,rgba(236,72,153,0.10),transparent_24%)]" />
    </div>
  );
};
