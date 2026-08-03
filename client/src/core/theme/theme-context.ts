import { createContext } from 'react';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

export interface ThemeContextType {
  /** The resolved theme actually applied to the page (never "system"). */
  theme: Theme;
  /** What the user picked — "system" tracks the OS setting and updates live. */
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
