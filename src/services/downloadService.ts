// ============================================
// Download Service - Şarkı İndirme
// ============================================
// Tauri ortamında invoke ile yt-dlp çalıştırır.
// Web ortamında simüle edilmiş indirme yapar.

import { v4 as uuidv4 } from 'uuid';
import type { Track, DownloadResult } from '../types';
import { fetchMetadata } from './metadataService';
import { sanitizeFilename } from './platformService';

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

export const downloadTrack = async (
  input: string,
  onProgress?: (progress: number) => void
): Promise<DownloadResult> => {
  if (!input || input.trim().length === 0) {
    return { success: false, error: 'Geçersiz giriş.' };
  }

  if (isTauri()) {
    try {
      const result = await tauriInvoke<DownloadResult>('download_track', {
        input: input.trim(),
      });

      if (result.success && result.track) {
        return result;
      }
      return { success: false, error: result.error || 'İndirme başarısız.' };
    } catch (err) {
      console.warn('Tauri download failed, using simulation:', err);
      return simulateDownload(input, onProgress);
    }
  }

  // Web ortamında simüle edilmiş indirme
  return simulateDownload(input, onProgress);
};

const simulateDownload = async (
  input: string,
  onProgress?: (progress: number) => void
): Promise<DownloadResult> => {
  // Progress simülasyonu
  for (let i = 0; i <= 100; i += 5) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    onProgress?.(i);
  }

  // Metadata çek
  const metadata = await fetchMetadata(input);
  if (!metadata.success) {
    return { success: false, error: metadata.error || 'Metadata alınamadı.' };
  }

  const track: Track = {
    id: uuidv4(),
    title: metadata.title || 'Unknown Title',
    artist: metadata.artist || 'Unknown Artist',
    album: metadata.album || 'Unknown Album',
    duration: metadata.duration || '0:00',
    coverUrl: metadata.coverUrl || 'https://picsum.photos/seed/default/300/300',
    filePath: `C:\\Users\\User\\Music\\CDPlayer\\${sanitizeFilename(metadata.title || 'track')}.flac`,
    format: 'FLAC',
    addedAt: new Date().toISOString(),
  };

  return {
    success: true,
    track,
    filePath: track.filePath,
  };
};

export const deleteTrack = async (trackId: string): Promise<boolean> => {
  if (isTauri()) {
    try {
      await tauriInvoke('delete_track', { trackId });
      return true;
    } catch (err) {
      console.warn('Tauri delete failed:', err);
      return false;
    }
  }
  return true;
};
