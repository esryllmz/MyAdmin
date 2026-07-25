import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/store';
import { ThemeToggle } from '@/core/components/ThemeToggle';
import { BrandLogo } from '@/core/components/common/BrandLogo';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

export const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-md sticky top-0 w-full z-30 border-b border-outline-variant/10 dark:border-dark-outline-variant/10 flex items-center justify-between px-8 h-16 transition-colors">
      <div className="flex items-center gap-3">
        <BrandLogo variant="icon" size="sm" linkTo={null} className="md:hidden" />
        <span className="text-lg font-bold text-on-surface dark:text-dark-on-surface">Admin Console</span>
      </div>

      {/* Search - Desktop */}
      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative flex items-center focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:ring-dark-primary/20 rounded-lg transition-all">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant/50 dark:text-dark-on-surface-variant/50 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-container-low dark:bg-dark-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface dark:text-dark-on-surface focus:bg-surface-container-lowest dark:focus:bg-dark-surface-container-lowest transition-colors outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* Profile Dropdown Container */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 dark:border-dark-outline-variant/20 hover:ring-4 hover:ring-primary/10 dark:hover:ring-dark-primary/10 transition-all focus:outline-none"
          >
            <img
              src={user?.profileImageUrl || "https://ui-avatars.com/api/?name=" + (user?.username || "Admin")}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 z-50 bg-surface-container-lowest dark:bg-dark-surface-container-low rounded-xl shadow-xl border border-outline-variant/10 dark:border-dark-outline-variant/10 py-1 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-2.5 border-b border-outline-variant/10 dark:border-dark-outline-variant/10">
                <p className="text-sm font-bold text-on-surface dark:text-dark-on-surface truncate">{user?.username}</p>
                <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Ayarlar
                </button>
              </div>

              <div className="border-t border-outline-variant/10 dark:border-dark-outline-variant/10 py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 dark:hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
