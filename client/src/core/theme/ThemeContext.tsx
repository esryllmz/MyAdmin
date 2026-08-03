import { useEffect, useState } from 'react';
import { ThemeContext, type Theme, type ThemePreference } from './theme-context';

const getSystemTheme = (): Theme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  });

  // Yalnızca "system" tercihiyken anlamlı — OS teması değişirse bu state event listener
  // callback'i içinde güncellenir (render sırasında değil), bu yüzden `theme` derive edilebilir.
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    if (themePreference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setSystemTheme(getSystemTheme());
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themePreference]);

  const theme: Theme = themePreference === 'system' ? systemTheme : themePreference;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', themePreference);
  }, [themePreference]);

  const toggleTheme = () => {
    setThemePreferenceState((prev) => {
      const resolved = prev === 'system' ? getSystemTheme() : prev;
      return resolved === 'light' ? 'dark' : 'light';
    });
  };

  const setThemePreference = (preference: ThemePreference) => setThemePreferenceState(preference);

  return (
    <ThemeContext.Provider value={{ theme, themePreference, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};
