import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

const ThemeSettingsTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-on-surface-variant">Arayüz temasını tercihinize göre seçin.</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => theme !== 'light' && toggleTheme()}
          className={`flex flex-col items-center gap-2 p-6 rounded-xl border transition-all ${theme === 'light'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
            }`}
        >
          <Sun className="w-6 h-6" />
          <span className="text-sm font-semibold">Aydınlık</span>
        </button>
        <button
          type="button"
          onClick={() => theme !== 'dark' && toggleTheme()}
          className={`flex flex-col items-center gap-2 p-6 rounded-xl border transition-all ${theme === 'dark'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
            }`}
        >
          <Moon className="w-6 h-6" />
          <span className="text-sm font-semibold">Karanlık</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSettingsTab;
