// ============================================
// TrackList - Spotify Tarzı 2D Şarkı Listesi
// ============================================

import type { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  onInspect: (track: Track) => void;
  onDelete: (trackId: string) => void;
}

export default function TrackList({ tracks, onInspect, onDelete }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        {/* Empty state illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center border border-white/5">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400/60">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-xs">🎵</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Koleksiyonun Boş</h3>
        <p className="text-gray-400 text-center max-w-md text-sm leading-relaxed">
          Henüz koleksiyonunda hiç şarkı yok. Yukarıdaki arama çubuğuna bir YouTube linki
          yapıştır veya şarkı adı yazarak indirmeye başla.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>yt-dlp hazır • FLAC formatı aktif</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_1fr_80px_100px] gap-4 px-4 py-2 border-b border-white/5 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span>#</span>
        <span>Şarkı</span>
        <span>Albüm</span>
        <span>Süre</span>
        <span className="text-right">İşlem</span>
      </div>

      {/* Track Rows */}
      <div className="divide-y divide-white/[0.03]">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="group grid grid-cols-[40px_1fr_1fr_80px_100px] gap-4 px-4 py-3 items-center hover:bg-white/[0.04] rounded-lg transition-all duration-200"
          >
            {/* Index / Play icon */}
            <span className="text-sm text-gray-500 group-hover:hidden">
              {index + 1}
            </span>
            <span className="text-sm text-green-400 hidden group-hover:block">
              ▶
            </span>

            {/* Title + Artist */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-800 shadow-lg">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${track.id}/100/100`;
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {track.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {track.artist}
                </p>
              </div>
            </div>

            {/* Album */}
            <span className="text-sm text-gray-400 truncate">
              {track.album}
            </span>

            {/* Duration */}
            <span className="text-sm text-gray-400">
              {track.duration}
            </span>

            {/* Actions - Minimalist info icon */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => onInspect(track)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
                title="3D CD Kutusunu İncele"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(track.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                title="Sil"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 mt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {tracks.length} şarkı • Koleksiyon
        </span>
        <span className="text-xs text-gray-500">
          FLAC • Lossless Kalite
        </span>
      </div>
    </div>
  );
}
