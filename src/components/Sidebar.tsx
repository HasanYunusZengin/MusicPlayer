// ============================================
// Sidebar - Playlist Odaklı Sol Menü
// ============================================
// Sadece playlist'ler, Yourplayer başlığı, üç nokta menü ve tema değiştirme

import { useState, useRef, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'cyberpunk';

interface SidebarProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  activePlaylist: string;
  onPlaylistSelect: (playlistId: string) => void;
}

const PLAYLISTS = [
  { id: 'playlist-1', name: '1. Playlist' },
];

const THEMES: { id: Theme; label: string; description: string }[] = [
  { id: 'dark', label: 'Koyu Tema', description: 'Varsayılan koyu arayüz' },
  { id: 'light', label: 'Açık Tema', description: 'Aydınlık ve ferah' },
  { id: 'cyberpunk', label: 'Y2K Cyberpunk', description: 'Neon renkler, fütüristik' },
];

export default function Sidebar({ currentTheme, onThemeChange, activePlaylist, onPlaylistSelect }: SidebarProps) {
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
      {/* Top section - Yourplayer title and menu */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-white">Yourplayer</h1>

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
      </div>

      {/* Playlists section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Çalma Listeleri
        </h3>
        <div className="space-y-1">
          {PLAYLISTS.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onPlaylistSelect(playlist.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activePlaylist === playlist.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {playlist.name}
            </button>
          ))}
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
