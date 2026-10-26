// ============================================
// Sidebar - Spotify Tarzı Sol Menü
// ============================================
// Navigation, üç nokta menü ve tema değiştirme

import { useState, useRef, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'cyberpunk';

interface SidebarProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onNavigate: (section: string) => void;
  activeSection: string;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Giriş', icon: 'home' },
  { id: 'browse', label: 'Gözat', icon: 'search' },
  { id: 'playlists', label: 'Çalma Listeleri', icon: 'playlist' },
  { id: 'library', label: 'Kitaplığın', icon: 'library' },
];

const THEMES: { id: Theme; label: string; description: string }[] = [
  { id: 'dark', label: 'Koyu Tema', description: 'Varsayılan koyu arayüz' },
  { id: 'light', label: 'Açık Tema', description: 'Aydınlık ve ferah' },
  { id: 'cyberpunk', label: 'Y2K Cyberpunk', description: 'Neon renkler, fütüristik' },
];

// Icon component
function NavIcon({ type, className }: { type: string; className?: string }) {
  const baseClass = className || 'w-5 h-5';
  
  switch (type) {
    case 'home':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'search':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'playlist':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15V6M18.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 12H3M16 6H3M12 18H3" />
        </svg>
      );
    case 'library':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ currentTheme, onThemeChange, onNavigate, activeSection }: SidebarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-64 h-full flex flex-col bg-black/40 border-r border-white/5">
      {/* Top section - Logo and menu */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">CD Player</span>
          </div>

          {/* Three dots menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                  Ayarlar
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                  Yardım
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <NavIcon type={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Playlists section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Çalma Listeleri
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Favoriler
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Rock Klasikleri
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Chill Vibes
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            ref={settingsRef}
            className="relative bg-zinc-900 rounded-xl border border-white/10 shadow-2xl w-[400px] max-w-[90vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Ayarlar</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Theme Selector */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Tema</h3>
                <div className="space-y-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => onThemeChange(theme.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200 ${
                        currentTheme === theme.id
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium">{theme.label}</p>
                        <p className="text-xs text-gray-500">{theme.description}</p>
                      </div>
                      {currentTheme === theme.id && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Quality */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Ses Kalitesi</h3>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-green-500/50">
                  <option value="flac">FLAC (Lossless)</option>
                  <option value="mp3-320">MP3 320kbps</option>
                  <option value="mp3-192">MP3 192kbps</option>
                </select>
              </div>

              {/* Download Location */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">İndirme Konumu</h3>
                <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
                  C:\Users\User\Music\CDPlayer
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
