// ============================================
// App.tsx - Ana Uygulama Bileşeni
// ============================================
// 3D CD Media Player - Spotify Tarzı Arayüz
// ============================================

import { useState, useCallback, useEffect } from 'react';
import type { Track } from './types';
import { downloadTrack } from './services/downloadService';
import TrackList from './components/TrackList';
import CdModal3D from './components/CdModal3D';

// Demo şarkılar (web ortamında başlangıç verisi)
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
];

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [inputValue, setInputValue] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    } catch (err) {
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

  // Global ESC handler - Modal açıkken ESC ile kapat
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121212] text-white overflow-hidden">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-xl border transition-all duration-300 animate-slide-in ${
          notification.type === 'success'
            ? 'bg-green-900/80 border-green-500/30 text-green-200'
            : 'bg-red-900/80 border-red-500/30 text-red-200'
        }`}>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Header / Navigation */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-lg">💿</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CD Player</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">3D Music Collection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">yt-dlp Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search / Download Bar */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
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
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all duration-200"
              disabled={isDownloading}
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 min-w-[120px]"
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
        </div>

        {/* Progress bar */}
        {isDownloading && (
          <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Content - Track List */}
      <main className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Koleksiyonum
            </h2>
            {tracks.length > 0 && (
              <span className="text-xs text-gray-500">
                {tracks.length} şarkı
              </span>
            )}
          </div>

          <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
            <TrackList
              tracks={tracks}
              onInspect={handleInspect}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {/* 3D CD Modal */}
      {selectedTrack && (
        <CdModal3D track={selectedTrack} onClose={handleCloseModal} />
      )}
    </div>
  );
}
