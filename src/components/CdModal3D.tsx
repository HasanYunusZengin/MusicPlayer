// ============================================
// CdModal3D - Full-Screen 3D CD Inspector
// ============================================
// 3-State Interaction:
//   1. 'closed'  → Kapak kapalı, CD kutusu tam görünür
//   2. 'open'    → Kapak açılmış (120°), CD disk görünüyor
//   3. 'focused' → CD disk tek başına odaklanmış, kutu GÖRÜNMEZ
//
// Kontroller:
//   - Kutuya ÇİFT TIKLA → kapak açılır
//   - CD diske TEK TIKLA → disk odaklanır (case kaybolur)
//   - ESC → geri adım veya kapat
//   - Boş alana tıkla → kapat
//   - Scroll → Zoom in/out

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
// Dairesel CD Texture Oluşturucu
// Albüm kapağını dairesel olarak maskeler
// ============================================
function useCircularCdTexture(coverUrl: string): THREE.Texture {
  return useMemo(() => {
    const loader = new THREE.TextureLoader();
    const image = loader.load(coverUrl);
    image.colorSpace = THREE.SRGBColorSpace;

    // Canvas ile dairesel maskeleme
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return image;

    // Dairesel clip
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Resmi çiz (center crop)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = coverUrl;
    
    // Eğer resim zaten yüklenmişse hemen çiz
    if (image.image) {
      const src = image.image as HTMLImageElement;
      const size = Math.min(src.width, src.height);
      const sx = (src.width - size) / 2;
      const sy = (src.height - size) / 2;
      ctx.drawImage(src, sx, sy, size, size, 0, 0, 512, 512);
    }

    // Merkez delik (transparent) - büyütülmüş (0.25 radius)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(256, 256, 53, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [coverUrl]);
}

// ============================================
// CD Disc - 3D Dönen Disk (DAİRESEL TEXTURE)
// ============================================
function CdDisc({
  coverUrl,
  position,
  onClick,
  isFocused,
}: {
  coverUrl: string;
  position: [number, number, number];
  onClick?: () => void;
  isFocused: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const discGroupRef = useRef<THREE.Group>(null);
  const circularTexture = useCircularCdTexture(coverUrl);

  // Focus animasyonu
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetScale = useRef(1);

  useEffect(() => {
    if (isFocused) {
      targetPos.current.set(0, 0, 0); // CD tam ortada
      targetScale.current = 1.8;
    } else {
      targetPos.current.set(...position);
      targetScale.current = 1;
    }
  }, [isFocused, position]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.lerp(targetPos.current, delta * 4);
      const s = groupRef.current.scale.x;
      const ts = targetScale.current;
      const ns = s + (ts - s) * delta * 4;
      groupRef.current.scale.setScalar(ns);
    }
    // Disk yavaşça döner (sadece focused modda belirgin)
    if (discGroupRef.current && isFocused) {
      discGroupRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group
        ref={discGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {/* CD Body - Metalik disk (ortası delik) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 1.2, 64]} />
          <meshPhysicalMaterial
            color="#c8c8c8"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* CD Label - Dairesel maskeleme ile albüm kapağı (ön yüz, ortası delik) */}
        <mesh rotation={[0, 0, 0]} position={[0, 0, 0.011]}>
          <ringGeometry args={[0.25, 1.15, 64]} />
          <meshStandardMaterial
            map={circularTexture}
            side={THREE.FrontSide}
            transparent
          />
        </mesh>

        {/* CD Label - Arka yüz (ortası delik) */}
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.011]}>
          <ringGeometry args={[0.25, 1.15, 64]} />
          <meshStandardMaterial
            map={circularTexture}
            side={THREE.FrontSide}
            transparent
          />
        </mesh>

        {/* CD kenar halkası */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1.18, 0.02, 16, 64]} />
          <meshStandardMaterial color="#999" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Merkez delik halkası (büyütülmüş) */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.25, 0.03, 16, 32]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================
// CD Jewel Case - Şeffaf Plastik Kutu
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
  const targetAngle = isOpen ? -Math.PI * 0.66 : 0;

  useFrame((_, delta) => {
    if (coverRef.current) {
      const current = coverRef.current.rotation.y;
      const diff = targetAngle - current;
      coverRef.current.rotation.y += diff * delta * 4;
    }
  });

  return (
    <group
      rotation={[0.1, 0, 0]}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isOpen) {
          onCaseDoubleClick();
        }
      }}
    >
      {/* Back panel */}
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

      {/* Spine */}
      <mesh position={[-1.32, 0, 0]}>
        <boxGeometry args={[0.08, 2.6, 0.35]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.6}
        />
      </mesh>

      {/* Front cover - Açılır kapak */}
      <group ref={coverRef} position={[-1.3, 0, 0]}>
        <group position={[1.3, 0, 0]}>
          {/* Şeffaf plastik kapak */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[2.6, 2.6, 0.04]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.15}
              roughness={0.05}
              metalness={0.0}
              transmission={0.8}
              thickness={0.5}
              clearcoat={1}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {/* Albüm kapağı */}
          <mesh position={[0, 0, 0.18]}>
            <planeGeometry args={[2.4, 2.4]} />
            <meshStandardMaterial map={texture} side={THREE.FrontSide} />
          </mesh>
        </group>
      </group>

      {/* CD Tray */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.02, 64]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Center spindle */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 32]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* CD inside the case (visible when open) */}
      {isOpen && (
        <CdDisc
          coverUrl={coverUrl}
          position={[0, 0, 0.03]}
          onClick={onDiscClick}
          isFocused={false}
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
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 3, 2]} intensity={0.5} color="#6366f1" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#ffffff" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.6}
        color="#a78bfa"
      />

      {/* Case + Disc - Focused modda case GÖRÜNMEZ */}
      {!isFocused ? (
        <JewelCase
          coverUrl={track.coverUrl}
          isOpen={isOpen}
          onCaseDoubleClick={onCaseDoubleClick}
          onDiscClick={onDiscClick}
        />
      ) : (
        /* Sadece CD diski - Case tamamen yok */
        <CdDisc
          coverUrl={track.coverUrl}
          position={[0, 0, 0]}
          onClick={() => {}}
          isFocused={true}
        />
      )}

      {/* OrbitControls - Her zaman aktif, zoom enabled */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={isFocused ? 1.5 : 3}
        maxDistance={isFocused ? 6 : 12}
        autoRotate={false}
        zoomSpeed={0.8}
        rotateSpeed={0.8}
      />

      <Environment preset="studio" />
    </>
  );
}

// ============================================
// CSS Loading Spinner
// ============================================
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
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

  // Fade-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // ESC handler - 2 aşamalı navigasyon
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'focused') {
          // CD inceleme modundaysa → CD kutusuna geri dön (modal kapanmaz)
          setViewMode('open');
        } else {
          // CD kutusu modundaysa → modalı kapat
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, onClose]);

  // Kutuya ÇİFT TIKLAMA → kapak aç
  const handleCaseDoubleClick = useCallback(() => {
    if (viewMode === 'closed') {
      setViewMode('open');
    }
  }, [viewMode]);

  // CD diske TEK TIKLAMA → disk odakla (case kaybolur)
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
        return 'Kutuya çift tıkla: Kapak aç • Scroll: Yakınlaş/Uzaklaş';
      case 'open':
        return 'CD diske tıkla: İncele • Sürükle: Döndür • ESC: Kapat';
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
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />

      {/* Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Track info header */}
        <div className="absolute top-6 left-6 z-20 max-w-md pointer-events-none">
          <h2 className="text-2xl font-bold text-white mb-1 truncate drop-shadow-lg">
            {track.title}
          </h2>
          <p className="text-sm text-gray-300 drop-shadow">
            {track.artist} • {track.album}
          </p>
        </div>

        {/* Hint text */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <p className="text-xs text-white/70 text-center">{hintText}</p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 3D Canvas - Full screen */}
        <div className="flex-1 w-full h-full">
          <Suspense fallback={<LoadingOverlay />}>
            <Canvas
              camera={{ position: [0, 0, 6.5], fov: 50 }}
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
