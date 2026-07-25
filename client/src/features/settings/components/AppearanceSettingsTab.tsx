import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTheme } from '@/core/theme/ThemeContext';

type Density = 'comfortable' | 'compact';
type SidebarMode = 'expanded' | 'collapsed';

const AppearanceSettingsTab = () => {
  const { theme, toggleTheme } = useTheme();
  const [density, setDensity] = useState<Density>('comfortable');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  const handleSave = () => toast.success('Görünüm tercihleri kaydedildi.');

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Theme</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border transition-all ${theme === 'light'
                ? 'border-on-surface dark:border-dark-on-surface bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface dark:text-dark-on-surface'
                : 'border-outline-variant/60 dark:border-dark-outline-variant text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low'
              }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-sm font-semibold">Light</span>
          </button>
          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border transition-all ${theme === 'dark'
                ? 'border-on-surface dark:border-dark-on-surface bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface dark:text-dark-on-surface'
                : 'border-outline-variant/60 dark:border-dark-outline-variant text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low'
              }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-sm font-semibold">Dark</span>
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Density</p>
        <div className="flex gap-2">
          {(['comfortable', 'compact'] as Density[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDensity(option)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${density === option
                  ? 'bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface'
                  : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Sidebar Mode</p>
        <div className="flex gap-2">
          {(['expanded', 'collapsed'] as SidebarMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSidebarMode(option)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${sidebarMode === option
                  ? 'bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface'
                  : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-2">
          Kenar çubuğunu daraltmak için sidebar altındaki daralt düğmesini de kullanabilirsiniz.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Font Size</p>
        <div className="flex gap-2">
          {(['sm', 'md', 'lg'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFontSize(option)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium uppercase transition-colors ${fontSize === option
                  ? 'bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface'
                  : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant cursor-pointer">
        <div>
          <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Reduced Motion</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Animasyonları ve geçişleri azalt.</p>
        </div>
        <input
          type="checkbox"
          checked={reducedMotion}
          onChange={() => setReducedMotion((prev) => !prev)}
          className="rounded border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface focus:ring-0 w-5 h-5"
        />
      </label>

      <button
        type="button"
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Kaydet
      </button>
    </div>
  );
};

export default AppearanceSettingsTab;
