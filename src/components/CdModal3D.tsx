// ============================================
// CdModal3D - Full-Screen 3D CD Inspector
// ============================================
// İki Aşamalı İnceleme:
//   Aşama 1 (closed/open): CD Kutusu görünür, 360° döndürülebilir
//   Aşama 2 (focused): Sadece CD diski görünür, bağımsız döndürülebilir
//
// Kontroller:
//   - Kutuya ÇİFT TIKLA → kapak açılır (sol menteşeden)
//   - CD diske TEK TIKLA → disk odaklanır (kutu kaybolur)
//   - ESC → kademeli çıkış (focused → open → kapat)
//   - Scroll → Zoom in/out
//   - Sürükle → 360° döndür

import { useRef, useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { Track } from '../types';

interface CdModal3DProps {
  track: Track;
  onClose: () => void;
}

type ViewMode = 'closed' | 'open' | 'focused';

// ============================================
// Dairesel CD Texture (Canvas ile Maskeleme)
// ============================================
function useCircularCdTexture(coverUrl: string): THREE.Texture {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      const fallback = new THREE.Texture();
      return fallback;
    }

    // Dairesel clip
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Resmi yükle ve çiz
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512);
      
      // Merkez delik (şeffaf)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(256, 256, 50, 0, Math.PI * 2);
      ctx.fill();
      
      texture.needsUpdate = true;
    };
    img.src = coverUrl;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [coverUrl]);
}

// ============================================
// CD Disc - 3D Disk (DİKEY, STATİK)
// ============================================
function CdDisc({
  coverUrl,
  position,
  onClick,
}: {
  coverUrl: string;
  position: [number, number, number];
  onClick?: () => void;
}) {
  const circularTexture = useCircularCdTexture(coverUrl);

  return (
    <group position={position}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {/* CD Body - İnce silindir (dikey) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.02, 64]} />
          <meshPhysicalMaterial
            color="#d0d0d0"
            metalness={0.9}
            roughness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* CD Label - Ön yüz (dairesel texture) */}
        <mesh position={[0, 0, 0.011]}>
          <circleGeometry args={[1.15, 64]} />
          <meshStandardMaterial
            map={circularTexture}
            side={THREE.FrontSide}
            transparent
          />
        </mesh>

        {/* CD Label - Arka yüz */}
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.011]}>
          <circleGeometry args={[1.15, 64]} />
          <meshStandardMaterial
            map={circularTexture}
            side={THREE.FrontSide}
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}

// ============================================
// CD Jewel Case - Kutu (Kapak Sol Menteşeden Açılır)
// ============================================
function JewelCase({
  coverUrl,
  isOpen,
  onCaseDoubleClick,
  onDiscClick,
}: {
  coverUrl: string;
  isOpen: boolean;
  onCaseDoubleClick: () => void;
  onDiscClick: () => void;
}) {
  const coverRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(coverUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [coverUrl]);

  const targetAngle = isOpen ? -Math.PI * 0.66 : 0; // 120 derece

  useFrame((_, delta) => {
    if (coverRef.current) {
      const current = coverRef.current.rotation.y;
      const diff = targetAngle - current;
      // Yumuşak animasyon
      coverRef.current.rotation.y += diff * delta * 3;
    }
  });

  return (
    <group
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isOpen) {
          onCaseDoubleClick();
        }
      }}
    >
      {/* Arka Panel */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[2.6, 2.6, 0.05]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.1}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Sol Kenar (Spine) */}
      <mesh position={[-1.32, 0, 0]}>
        <boxGeometry args={[0.08, 2.6, 0.35]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>

      {/* Kapak - Sol Menteşeden Döner */}
      <group ref={coverRef} position={[-1.3, 0, 0]}>
        {/* Kapak içeriği (pivot noktasından offset) */}
        <group position={[1.3, 0, 0]}>
          {/* Şeffaf Plastik Kapak */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[2.6, 2.6, 0.04]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.15}
              roughness={0.05}
              transmission={0.8}
              thickness={0.5}
            />
          </mesh>
          
          {/* Albüm Kapağı */}
          <mesh position={[0, 0, 0.18]}>
            <planeGeometry args={[2.4, 2.4]} />
            <meshStandardMaterial map={texture} side={THREE.FrontSide} />
          </mesh>
        </group>
      </group>

      {/* CD Tepsisi */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.02, 64]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Merkez Spindle */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* CD Disk (Kapak Açıkken Görünür) */}
      {isOpen && (
        <CdDisc
          coverUrl={coverUrl}
          position={[0, 0, 0.03]}
          onClick={onDiscClick}
        />
      )}
    </group>
  );
}

// ============================================
// 3D Scene
// ============================================
function Scene({
  track,
  viewMode,
  onCaseDoubleClick,
  onDiscClick,
}: {
  track: Track;
  viewMode: ViewMode;
  onCaseDoubleClick: () => void;
  onDiscClick: () => void;
}) {
  const isOpen = viewMode === 'open' || viewMode === 'focused';
  const isFocused = viewMode === 'focused';

  return (
    <>
      {/* Işıklandırma */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 3, 2]} intensity={0.4} color="#6366f1" />
      <pointLight position={[0, 0, 3]} intensity={0.6} />

      {/* Focused modda kutu GÖRÜNMEZ */}
      {!isFocused ? (
        <JewelCase
          coverUrl={track.coverUrl}
          isOpen={isOpen}
          onCaseDoubleClick={onCaseDoubleClick}
          onDiscClick={onDiscClick}
        />
      ) : (
        <CdDisc
          coverUrl={track.coverUrl}
          position={[0, 0, 0]}
          onClick={() => {}}
        />
      )}

      {/* OrbitControls - Her zaman aktif, auto-rotate YOK */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        zoomSpeed={0.8}
        rotateSpeed={0.8}
      />

      <Environment preset="studio" />
    </>
  );
}

// ============================================
// Loading Indicator
// ============================================
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        <p className="text-xs text-white/40">Yükleniyor...</p>
      </div>
    </div>
  );
}

// ============================================
// Main Modal Component
// ============================================
export default function CdModal3D({ track, onClose }: CdModal3DProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('closed');
  const [isVisible, setIsVisible] = useState(false);

  // Fade-in
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // ESC Handler - KADEMELİ ÇIKIŞ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'focused') {
          // CD odak modu → Kutu moduna dön
          setViewMode('open');
        } else {
          // Kutu modu → Modalı kapat
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, onClose]);

  // Kutuya çift tıklama → Kapak aç
  const handleCaseDoubleClick = useCallback(() => {
    if (viewMode === 'closed') {
      setViewMode('open');
    }
  }, [viewMode]);

  // CD diske tıklama → Odakla (kutu kaybolur)
  const handleDiscClick = useCallback(() => {
    if (viewMode === 'open') {
      setViewMode('focused');
    }
  }, [viewMode]);

  // Boş alana tıklama
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (viewMode === 'focused') {
        setViewMode('open');
      } else {
        onClose();
      }
    }
  }, [viewMode, onClose]);

  // Hint text
  const hintText = useMemo(() => {
    switch (viewMode) {
      case 'closed':
        return 'Çift tıkla: Kapak aç • Sürükle: Döndür • Scroll: Zoom';
      case 'open':
        return 'CD\'ye tıkla: İncele • Sürükle: Döndür • ESC: Kapat';
      case 'focused':
        return 'Sürükle: Döndür • Scroll: Zoom • ESC: Kutuya Dön';
    }
  }, [viewMode]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />

      {/* Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Track Info */}
        <div className="absolute top-6 left-6 z-20 max-w-md pointer-events-none">
          <h2 className="text-2xl font-bold text-white mb-1 truncate">
            {track.title}
          </h2>
          <p className="text-sm text-gray-300">
            {track.artist} • {track.album}
          </p>
        </div>

        {/* Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <p className="text-xs text-white/70 text-center">{hintText}</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 3D Canvas */}
        <div className="flex-1 w-full h-full">
          <Suspense fallback={<LoadingOverlay />}>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <Scene
                track={track}
                viewMode={viewMode}
                onCaseDoubleClick={handleCaseDoubleClick}
                onDiscClick={handleDiscClick}
              />
            </Canvas>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
