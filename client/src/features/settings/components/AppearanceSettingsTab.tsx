import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/core/theme/useTheme';
import type { ThemePreference } from '@/core/theme/theme-context';
import { setDensity, setFontSize, setReducedMotion, setSidebarCollapsed } from '@/core/store/uiSlice';
import type { Density, FontSize } from '@/core/store/uiSlice';
import type { RootState } from '@/core/store/store';

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const AppearanceSettingsTab = () => {
  const { themePreference, setThemePreference } = useTheme();
  const dispatch = useDispatch();
  const { density, fontSize, reducedMotion, isSidebarCollapsed } = useSelector((state: RootState) => state.ui);

  return (
    <div className="max-w-xl space-y-8">
      <p className="text-xs italic text-on-surface-variant dark:text-dark-on-surface-variant">
        Appearance preferences apply immediately and are stored on this device.
      </p>

      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = themePreference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setThemePreference(option.value)}
                aria-pressed={isActive}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${isActive
                    ? 'border-on-surface dark:border-dark-on-surface bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface dark:text-dark-on-surface'
                    : 'border-outline-variant/60 dark:border-dark-outline-variant text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low'
                  }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Density</p>
        <div className="flex gap-2">
          {(['comfortable', 'compact'] as Density[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => dispatch(setDensity(option))}
              aria-pressed={density === option}
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
          <button
            type="button"
            onClick={() => dispatch(setSidebarCollapsed(false))}
            aria-pressed={!isSidebarCollapsed}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${!isSidebarCollapsed
                ? 'bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface'
                : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
              }`}
          >
            Expanded
          </button>
          <button
            type="button"
            onClick={() => dispatch(setSidebarCollapsed(true))}
            aria-pressed={isSidebarCollapsed}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isSidebarCollapsed
                ? 'bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface'
                : 'bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
              }`}
          >
            Collapsed
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3">Font Size</p>
        <div className="flex gap-2">
          {(['sm', 'md', 'lg'] as FontSize[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => dispatch(setFontSize(option))}
              aria-pressed={fontSize === option}
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
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Minimize animations and transitions.</p>
        </div>
        <input
          type="checkbox"
          checked={reducedMotion}
          onChange={(e) => dispatch(setReducedMotion(e.target.checked))}
          className="rounded border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface focus:ring-0 w-5 h-5"
        />
      </label>
    </div>
  );
};

export default AppearanceSettingsTab;
