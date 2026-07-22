import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
}

export const TypewriterText = ({ text, speed = 18 }: TypewriterTextProps) => {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    setVisibleText("");
    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, speed);

    return () => window.clearInterval(interval);
  }, [speed, text]);

  return (
    <p className="text-sm leading-6 text-neutral-700 dark:text-zinc-300 md:text-[15px]">
      {visibleText}
      <span className="ml-1 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-gradient-to-b from-indigo-400 to-pink-400" />
    </p>
  );
};
