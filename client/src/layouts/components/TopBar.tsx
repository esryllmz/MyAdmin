import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/store';

export const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  const user = useSelector((state: RootState) => state.auth.user);

  // Menü dışına tıklandığında menüyü kapatma mantığı
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
    <header className="bg-white/80 backdrop-blur-md sticky top-0 w-full z-30 border-b border-outline-variant/10 flex items-center justify-between px-8 h-16">
      <span className="text-lg font-bold text-on-surface">Admin Console</span>

      {/* Search - Desktop */}
      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative flex items-center focus-within:ring-2 focus-within:ring-primary/20 rounded-lg transition-all">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant/50 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:bg-surface-container-lowest transition-colors outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-primary transition-all relative p-2 rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 hover:ring-4 hover:ring-primary/10 transition-all focus:outline-none"
          >
            <img
              src={user?.profileImageUrl || "https://ui-avatars.com/api/?name=" + (user?.username || "Admin")}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-outline-variant/10 py-2 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-2 border-b border-outline-variant/10 mb-2">
                <p className="text-sm font-bold text-on-surface truncate">{user?.username}</p>
                <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">settings</span>
                Ayarlar
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};