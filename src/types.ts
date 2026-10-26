// ============================================
// 3D CD Media Player - Type Definitions
// ============================================

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  filePath: string;
  format: string;
  addedAt: string;
}

export interface DownloadResult {
  success: boolean;
  track?: Track;
  error?: string;
  filePath?: string;
}

export interface MetadataResult {
  success: boolean;
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  duration?: string;
  error?: string;
}

export interface PlatformInfo {
  os: string;
  musicDir: string;
  ytDlpPath: string;
  ytDlpAvailable: boolean;
}

export interface SearchInput {
  type: 'url' | 'search';
  value: string;
}
