// ============================================
// App.tsx - Ana Uygulama Bileşeni
// ============================================
// 3D CD Media Player - Spotify Tarzı Arayüz
// Sidebar, tema sistemi ve modern layout
// ============================================

import { useState, useCallback, useEffect } from 'react';
import type { Track } from './types';
import { downloadTrack } from './services/downloadService';
import TrackList from './components/TrackList';
import CdModal3D from './components/CdModal3D';
import Sidebar, { type Theme } from './components/Sidebar';

// Demo şarkılar
const DEMO_TRACKS: Track[] = [
  {
    id: 'demo-1',
    title: 'Comfortably Numb',
    artist: 'Pink Floyd',
    album: 'The Wall',
    duration: '6:23',
    coverUrl: 'https://picsum.photos/seed/pinkfloyd/300/300',
    filePath: 'C:\\Users\\User\\Music\\CDPlayer\\Comfortably Numb.flac',
    format: 'FLAC',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: '8:02',
    coverUrl: 'https://picsum.photos/seed/ledzeppelin/300/300',
    filePath: 'C:\\Users\\User\\Music\\CDPlayer\\Stairway to Heaven.flac',
    format: 'FLAC',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: '5:55',
    coverUrl: 'https://picsum.photos/seed/queen/300/300',
    filePath: 'C:\\Users\\User\\Music\\CDPlayer\\Bohemian Rhapsody.flac',
    format: 'FLAC',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Creep',
    artist: 'Radiohead',
    album: 'Pablo Honey',
    duration: '3:56',
    coverUrl: 'https://picsum.photos/seed/radiohead/300/300',
    filePath: 'C:\\Users\\User\\Music\\CDPlayer\\Creep.flac',
    format: 'FLAC',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    duration: '5:01',
    coverUrl: 'https://picsum.photos/seed/nirvana/300/300',
    filePath: 'C:\\Users\\User\\Music\\CDPlayer\\Smells Like Teen Spirit.flac',
    format: 'FLAC',
    addedAt: new Date().toISOString(),
  },
];

// Tema renk paletleri
const THEME_STYLES: Record<Theme, { bg: string; sidebar: string; accent: string; text: string }> = {
  dark: {
    bg: 'bg-[#121212]',
    sidebar: 'bg-black/40',
    accent: 'from-purple-600 to-indigo-600',
    text: 'text-white',
  },
  light: {
    bg: 'bg-[#f5f5f5]',
    sidebar: 'bg-white/80',
    accent: 'from-blue-500 to-cyan-500',
    text: 'text-gray-900',
  },
  cyberpunk: {
    bg: 'bg-[#0a0015]',
    sidebar: 'bg-purple-950/40',
    accent: 'from-pink-500 to-cyan-400',
    text: 'text-white',
  },
};

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [inputValue, setInputValue] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
  const [activeSection, setActiveSection] = useState('home');

  const themeStyle = THEME_STYLES[currentTheme];

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!inputValue.trim()) {
      showNotification('Lütfen bir YouTube linki veya şarkı adı girin.', 'error');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const result = await downloadTrack(inputValue, (progress) => {
        setDownloadProgress(progress);
      });

      if (result.success && result.track) {
        setTracks((prev) => [result.track!, ...prev]);
        setInputValue('');
        showNotification(`"${result.track.title}" başarıyla indirildi!`, 'success');
      } else {
        showNotification(result.error || 'İndirme başarısız.', 'error');
      }
    } catch {
      showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [inputValue, showNotification]);

  const handleInspect = useCallback((track: Track) => {
    setSelectedTrack(track);
  }, []);

  const handleDelete = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    showNotification('Şarkı koleksiyondan kaldırıldı.', 'success');
  }, [showNotification]);

  const handleCloseModal = useCallback(() => {
    setSelectedTrack(null);
  }, []);

  // Global ESC handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTrack) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedTrack, handleCloseModal]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDownloading) {
      handleDownload();
    }
  }, [handleDownload, isDownloading]);

  const handleThemeChange = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
  }, []);

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  // Tema bazlı arka plan ve text renkleri
  const isLight = currentTheme === 'light';
  const isCyberpunk = currentTheme === 'cyberpunk';

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${themeStyle.bg} ${themeStyle.text} transition-colors duration-500`}>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-xl border transition-all duration-300 animate-slide-in ${
          notification.type === 'success'
            ? isLight ? 'bg-green-100 border-green-300 text-green-800' : 'bg-green-900/80 border-green-500/30 text-green-200'
            : isLight ? 'bg-red-100 border-red-300 text-red-800' : 'bg-red-900/80 border-red-500/30 text-red-200'
        }`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Search and Status */}
        <header className={`flex-shrink-0 px-6 py-4 border-b ${isLight ? 'border-gray-200' : 'border-white/5'} ${isCyberpunk ? 'border-pink-500/20' : ''}`}>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="YouTube linki yapıştır veya şarkı adı yaz..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none ${
                  isLight
                    ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-100'
                    : isCyberpunk
                    ? 'bg-purple-950/50 border border-pink-500/30 text-white placeholder-purple-300/50 focus:border-pink-400/50 focus:shadow-lg focus:shadow-pink-500/10'
                    : 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.07]'
                }`}
                disabled={isDownloading}
              />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`relative px-6 py-3 rounded-xl text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] bg-gradient-to-r ${
                isCyberpunk ? 'from-pink-500 to-cyan-400 shadow-lg shadow-pink-500/20' : themeStyle.accent
              } ${isCyberpunk ? 'hover:shadow-pink-500/40' : 'hover:shadow-purple-500/40'} shadow-lg`}
            >
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{downloadProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <span>İndir</span>
                </div>
              )}
            </button>

            {/* Status indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isLight ? 'bg-gray-100 border border-gray-200' : 'bg-white/5 border border-white/10'
            }`}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>yt-dlp Ready</span>
            </div>
          </div>

          {/* Progress bar */}
          {isDownloading && (
            <div className={`mt-3 h-1 rounded-full overflow-hidden ${isLight ? 'bg-gray-200' : 'bg-white/5'}`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${
                  isCyberpunk ? 'from-pink-500 to-cyan-400' : 'from-purple-500 to-indigo-500'
                } transition-all duration-300`}
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          )}
        </header>

        {/* Track List */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                {activeSection === 'home' ? 'Koleksiyonum' : 
                 activeSection === 'browse' ? 'Gözat' :
                 activeSection === 'playlists' ? 'Çalma Listeleri' : 'Kitaplığın'}
              </h2>
              {tracks.length > 0 && (
                <span className={`text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tracks.length} şarkı
                </span>
              )}
            </div>

            <div className={`rounded-xl border overflow-hidden ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 
              isCyberpunk ? 'bg-purple-950/20 border-pink-500/20' : 
              'bg-white/[0.02] border-white/5'
            }`}>
              <TrackList
                tracks={tracks}
                onInspect={handleInspect}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </main>
      </div>

      {/* 3D CD Modal */}
      {selectedTrack && (
        <CdModal3D track={selectedTrack} onClose={handleCloseModal} />
      )}
    </div>
  );
}
