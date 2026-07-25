import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/store';
import { ThemeToggle } from '@/core/components/ThemeToggle';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { resolvePageTitle } from './pageTitles';

export const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const { title, section } = resolvePageTitle(location.pathname);

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
    <header className="bg-surface-container-lowest dark:bg-dark-surface-container-low sticky top-0 w-full z-30 border-b border-outline-variant/60 dark:border-dark-outline-variant flex items-center justify-between px-6 h-16 transition-colors">
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        {section && (
          <>
            <span className="text-on-surface-variant dark:text-dark-on-surface-variant font-medium truncate">
              {section}
            </span>
            <span className="text-on-surface-variant/40 dark:text-dark-on-surface-variant/40">/</span>
          </>
        )}
        <span className="font-semibold text-on-surface dark:text-dark-on-surface truncate">{title}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />

        <NotificationCenter />

        <div className="w-px h-6 bg-outline-variant/60 dark:bg-dark-outline-variant" />

        {/* Profile Dropdown Container */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant dark:border-dark-outline-variant hover:ring-2 hover:ring-on-surface/10 dark:hover:ring-dark-on-surface/10 transition-all focus:outline-none"
          >
            <img
              src={user?.profileImageUrl || "https://ui-avatars.com/api/?background=111111&color=fff&name=" + (user?.username || "Admin")}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 z-50 bg-surface-container-lowest dark:bg-dark-surface-container-low rounded-lg shadow-lg border border-outline-variant dark:border-dark-outline-variant py-1">
              <div className="px-4 py-2.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">
                <p className="text-sm font-bold text-on-surface dark:text-dark-on-surface truncate">{user?.username}</p>
                <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Ayarlar
                </Link>
              </div>

              <div className="border-t border-outline-variant/60 dark:border-dark-outline-variant py-1">
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
