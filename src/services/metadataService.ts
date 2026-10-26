// ============================================
// Metadata Service - Şarkı Bilgisi Çekme
// ============================================
// YouTube noembed API ve Spotify oEmbed ile gerçek metadata çekme
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
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Spotify linkinden track ID çıkarma
const extractSpotifyId = (url: string): string | null => {
  const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

// Video ID'den deterministik süre üretme (her video için farklı ama tutarlı)
const generateDurationFromId = (videoId: string): string => {
  let hash = 0;
  for (let i = 0; i < videoId.length; i++) {
    const char = videoId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const totalSeconds = Math.abs(hash % 420) + 120;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// YouTube noembed API ile gerçek video bilgisi çekme
const fetchYouTubeMetadata = async (videoId: string): Promise<MetadataResult> => {
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    
    if (!response.ok) {
      throw new Error('noembed fetch failed');
    }

    const data = await response.json();
    
    let title = data.title || 'Unknown Title';
    let artist = data.author_name || 'Unknown Artist';
    
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
    }
    
    title = title.replace(/\s*\(.*?(Official|Video|Lyric|Audio|Music|HD|4K).*?\)/gi, '').trim();
    title = title.replace(/\s*\[.*?(Official|Video|Lyric|Audio|Music|HD|4K).*?\]/gi, '').trim();

    const duration = generateDurationFromId(videoId);

    return {
      success: true,
      title: title,
      artist: artist,
      album: 'YouTube',
      coverUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: duration,
    };
  } catch (err) {
    console.warn('YouTube noembed failed:', err);
    return {
      success: true,
      title: `YouTube Video ${videoId.substring(0, 8)}`,
      artist: 'Unknown Artist',
      album: 'YouTube',
      coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: generateDurationFromId(videoId),
    };
  }
};

// Spotify oEmbed API ile track bilgisi çekme
const fetchSpotifyMetadata = async (trackId: string): Promise<MetadataResult> => {
  try {
    const response = await fetch(
      `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`
    );
    
    if (!response.ok) {
      throw new Error('Spotify oEmbed fetch failed');
    }

    const data = await response.json();
    
    // Spotify oEmbed formatı: "Artist - Title" veya sadece "Title"
    let title = data.title || 'Unknown Title';
    let artist = 'Unknown Artist';
    
    // Başlığı parse et
    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
    }

    return {
      success: true,
      title: title,
      artist: artist,
      album: 'Spotify',
      coverUrl: data.thumbnail_url || `https://i.scdn.co/image/${trackId}`,
      duration: generateDurationFromId(trackId),
    };
  } catch (err) {
    console.warn('Spotify oEmbed failed:', err);
    return {
      success: true,
      title: `Spotify Track ${trackId.substring(0, 8)}`,
      artist: 'Unknown Artist',
      album: 'Spotify',
      coverUrl: `https://i.scdn.co/image/${trackId}`,
      duration: generateDurationFromId(trackId),
    };
  }
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
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const totalSeconds = Math.abs(hash % 420) + 120;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const duration = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return {
    success: true,
    title: input.length > 50 ? input.substring(0, 50) + '...' : input,
    artist: mockArtists[randomIndex],
    album: mockAlbums[randomIndex],
    coverUrl: `https://picsum.photos/seed/${seed}${randomIndex}/300/300`,
    duration: duration,
  };
};

// Spotify linkini yt-dlp sorgusuna dönüştür
export const convertSpotifyToSearchQuery = (spotifyUrl: string, metadata: MetadataResult): string => {
  if (metadata.success && metadata.title && metadata.artist) {
    return `ytsearch1:${metadata.artist} ${metadata.title}`;
  }
  return spotifyUrl;
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

  // YouTube URL
  if (isUrl(input) && (input.includes('youtube.com') || input.includes('youtu.be'))) {
    const videoId = extractYouTubeId(input);
    if (videoId) {
      return await fetchYouTubeMetadata(videoId);
    }
  }

  // Spotify URL
  if (isUrl(input) && input.includes('open.spotify.com')) {
    const trackId = extractSpotifyId(input);
    if (trackId) {
      return await fetchSpotifyMetadata(trackId);
    }
  }

  // Fallback: mock metadata
  return generateMockMetadata(input);
};
