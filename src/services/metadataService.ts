// ============================================
// Metadata Service - Şarkı Bilgisi Çekme
// ============================================
// Tauri ortamında invoke ile çalışır.
// Web ortamında demo metadata döndürür.

import type { MetadataResult } from '../types';

declare global {
  interface Window {
    __TAURI__?: {
      invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

const isTauri = (): boolean => {
  return !!window.__TAURI__;
};

const tauriInvoke = async <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
  if (!window.__TAURI__) {
    throw new Error('Tauri API not available');
  }
  return window.__TAURI__.invoke(cmd, args) as Promise<T>;
};

const isUrl = (input: string): boolean => {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
};

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Demo amaçlı mock metadata üretici
const generateMockMetadata = (input: string): MetadataResult => {
  const mockArtists = [
    'Pink Floyd', 'Led Zeppelin', 'The Beatles', 'Queen', 'David Bowie',
    'Radiohead', 'Nirvana', 'Tool', 'Deftones', 'Muse'
  ];

  const mockAlbums = [
    'The Dark Side of the Moon', 'Led Zeppelin IV', 'Abbey Road',
    'A Night at the Opera', 'Blackstar', 'OK Computer',
    'Nevermind', 'Lateralus', 'White Pony', 'Origin of Symmetry'
  ];

  const randomIndex = Math.floor(Math.random() * mockArtists.length);
  const seed = input.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'song';

  return {
    success: true,
    title: input.length > 50 ? input.substring(0, 50) + '...' : input,
    artist: mockArtists[randomIndex],
    album: mockAlbums[randomIndex],
    coverUrl: `https://picsum.photos/seed/${seed}${randomIndex}/300/300`,
    duration: `${Math.floor(Math.random() * 5) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  };
};

// YouTube thumbnail URL oluşturma
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export const fetchMetadata = async (input: string): Promise<MetadataResult> => {
  if (!input || input.trim().length === 0) {
    return { success: false, error: 'Lütfen bir link veya arama metni girin.' };
  }

  if (isTauri()) {
    try {
      const result = await tauriInvoke<MetadataResult>('fetch_metadata', { input: input.trim() });
      return result;
    } catch (err) {
      console.warn('Tauri metadata fetch failed, using mock:', err);
      return generateMockMetadata(input);
    }
  }

  // Web ortamında: YouTube URL ise thumbnail al
  if (isUrl(input) && (input.includes('youtube.com') || input.includes('youtu.be'))) {
    const videoId = extractYouTubeId(input);
    if (videoId) {
      const seed = videoId.substring(0, 10);
      return {
        success: true,
        title: input.length > 50 ? input.substring(0, 50) + '...' : input,
        artist: 'YouTube Artist',
        album: 'YouTube',
        coverUrl: getYouTubeThumbnail(videoId),
        duration: `${Math.floor(Math.random() * 5) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      };
    }
  }

  // Fallback: mock metadata
  return generateMockMetadata(input);
};
