// ============================================
// Platform Service - Windows/Tauri Backend
// ============================================
// Tauri ortamında invoke ile çalışır.
// Web ortamında (geliştirme/demo) mock data döndürür.

import type { PlatformInfo } from '../types';

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

const getMockPlatformInfo = (): PlatformInfo => {
  const username = 'User';
  return {
    os: 'win32',
    musicDir: `C:\\Users\\${username}\\Music\\CDPlayer`,
    ytDlpPath: `C:\\Users\\${username}\\AppData\\Local\\Programs\\yt-dlp\\yt-dlp.exe`,
    ytDlpAvailable: true,
  };
};

export const getPlatformInfo = async (): Promise<PlatformInfo> => {
  if (isTauri()) {
    try {
      const info = await tauriInvoke<PlatformInfo>('get_platform_info');
      return info;
    } catch (err) {
      console.warn('Tauri invoke failed, using mock:', err);
      return getMockPlatformInfo();
    }
  }
  return getMockPlatformInfo();
};

export const getMusicDirectory = async (): Promise<string> => {
  const info = await getPlatformInfo();
  return info.musicDir;
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
};

export const isYtDlpAvailable = async (): Promise<boolean> => {
  const info = await getPlatformInfo();
  return info.ytDlpAvailable;
};
