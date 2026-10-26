// ============================================
// Sidebar - Playlist Odaklı Sol Menü
// ============================================
// Playlist yönetimi, Yourplayer başlığı, üç nokta menü ve tema değiştirme

import { useState, useRef, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'cyberpunk';

export interface Playlist {
  id: string;
  name: string;
}

interface SidebarProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  playlists: Playlist[];
  activePlaylist: string;
  onPlaylistSelect: (playlistId: string) => void;
  onPlaylistAdd: (name: string) => void;
  onPlaylistDelete: (playlistId: string) => void;
}

const THEMES: { id: Theme; label: string; description: string }[] = [
  { id: 'dark', label: 'Koyu Tema', description: 'Varsayılan koyu arayüz' },
  { id: 'light', label: 'Açık Tema', description: 'Aydınlık ve ferah' },
  { id: 'cyberpunk', label: 'Y2K Cyberpunk', description: 'Neon renkler, fütüristik' },
];

export default function Sidebar({
  currentTheme,
  onThemeChange,
  playlists,
  activePlaylist,
  onPlaylistSelect,
  onPlaylistAdd,
  onPlaylistDelete,
}: SidebarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when adding playlist
  useEffect(() => {
    if (isAddingPlaylist && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingPlaylist]);

  const handleAddPlaylist = () => {
    if (newPlaylistName.trim()) {
      onPlaylistAdd(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsAddingPlaylist(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlaylist();
    } else if (e.key === 'Escape') {
      setIsAddingPlaylist(false);
      setNewPlaylistName('');
    }
  };

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
                <button
                  onClick={() => {
                    window.open('https://github.com/HasanYunusZengin/MusicPlayer', '_blank');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </svg>
                  GitHub
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlists section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Çalma Listeleri
          </h3>
          <button
            onClick={() => setIsAddingPlaylist(true)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Yeni Playlist Ekle"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Playlist list */}
        <div className="space-y-1">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group flex items-center gap-1">
              <button
                onClick={() => onPlaylistSelect(playlist.id)}
                className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePlaylist === playlist.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {playlist.name}
              </button>
              {/* Delete button - only show on hover and if more than 1 playlist */}
              {playlists.length > 1 && (
                <button
                  onClick={() => onPlaylistDelete(playlist.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all duration-200"
                  title="Playlist Sil"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* New playlist input */}
        {isAddingPlaylist && (
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Playlist adı..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              maxLength={50}
            />
            <button
              onClick={handleAddPlaylist}
              disabled={!newPlaylistName.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsAddingPlaylist(false);
                setNewPlaylistName('');
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
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
