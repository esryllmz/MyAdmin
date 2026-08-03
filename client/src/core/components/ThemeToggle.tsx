import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant dark:hover:bg-dark-surface-container-high dark:hover:text-dark-on-surface dark:focus-visible:ring-dark-accent/60"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
};
