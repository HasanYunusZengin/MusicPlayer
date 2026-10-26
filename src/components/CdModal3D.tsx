// ============================================
// CdModal3D - Full-Screen 3D CD Inspector
// ============================================
// 3-State Interaction:
//   1. 'closed'  → Kapak kapalı, CD kutusu tam görünür
//   2. 'open'    → Kapak açılmış (120°), CD disk görünüyor
//   3. 'focused' → CD disk kutudan çıkıp odaklanmış, kutu arkada blur
//
// Kontroller:
//   - Kutuya tıkla → kapak açılır
//   - CD diske tıkla → disk odaklanır
//   - ESC → geri adım veya kapat
//   - Boş alana tıkla → kapat

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
// Texture Loader
// ============================================
function useAlbumTexture(coverUrl: string): THREE.Texture {
  return useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(coverUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [coverUrl]);
}

// ============================================
// CD Disc - 3D Dönen Disk
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
  const texture = useAlbumTexture(coverUrl);

  // Focus animasyonu
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetScale = useRef(1);

  useEffect(() => {
    if (isFocused) {
      targetPos.current.set(0, 0, 1.5);
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
        {/* CD Body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.02, 64]} />
          <meshPhysicalMaterial
            color="#d0d0d0"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* CD Label (Album Art) - Top face */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[0.18, 1.05, 64]} />
          <meshStandardMaterial map={texture} side={THREE.FrontSide} />
        </mesh>

        {/* CD Label - Bottom face */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
          <ringGeometry args={[0.18, 1.05, 64]} />
          <meshStandardMaterial map={texture} side={THREE.FrontSide} />
        </mesh>

        {/* Center hole ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.025, 16, 32]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Iridescent ring effect */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
          <ringGeometry args={[0.2, 0.4, 64]} />
          <meshPhysicalMaterial
            color="#a78bfa"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.3}
            clearcoat={1}
          />
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
  isBlurred,
  onCaseClick,
  onDiscClick,
}: {
  coverUrl: string;
  isOpen: boolean;
  isBlurred: boolean;
  onCaseClick: () => void;
  onDiscClick: () => void;
}) {
  const coverRef = useRef<THREE.Group>(null);
  const caseRef = useRef<THREE.Group>(null);
  const texture = useAlbumTexture(coverUrl);
  const targetAngle = isOpen ? -Math.PI * 0.66 : 0; // 120 degrees
  const targetCaseZ = isBlurred ? -1.5 : 0;
  const targetCaseOpacity = isBlurred ? 0.3 : 1;

  useFrame((_, delta) => {
    // Kapak açılma animasyonu
    if (coverRef.current) {
      const current = coverRef.current.rotation.y;
      const diff = targetAngle - current;
      coverRef.current.rotation.y += diff * delta * 4;
    }
    // Kutu geri çekilme animasyonu
    if (caseRef.current) {
      caseRef.current.position.z += (targetCaseZ - caseRef.current.position.z) * delta * 4;
    }
  });

  return (
    <group
      ref={caseRef}
      rotation={[0.1, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOpen) {
          onCaseClick();
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
          opacity={targetCaseOpacity * 0.9}
        />
      </mesh>

      {/* Spine */}
      <mesh position={[-1.32, 0, 0]}>
        <boxGeometry args={[0.08, 2.6, 0.35]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={targetCaseOpacity * 0.3}
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
              opacity={targetCaseOpacity * 0.15}
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
            <meshStandardMaterial
              map={texture}
              side={THREE.FrontSide}
              transparent
              opacity={targetCaseOpacity}
            />
          </mesh>
        </group>
      </group>

      {/* CD Tray */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.02, 64]} />
        <meshStandardMaterial
          color="#222"
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={targetCaseOpacity}
        />
      </mesh>

      {/* Center spindle */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 32]} />
        <meshStandardMaterial
          color="#444"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={targetCaseOpacity}
        />
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
  onCaseClick,
  onDiscClick,
}: {
  track: Track;
  viewMode: ViewMode;
  onCaseClick: () => void;
  onDiscClick: () => void;
}) {
  const isOpen = viewMode === 'open' || viewMode === 'focused';
  const isFocused = viewMode === 'focused';
  const isBlurred = viewMode === 'focused';

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

      {/* Case + Disc */}
      {!isFocused ? (
        <JewelCase
          coverUrl={track.coverUrl}
          isOpen={isOpen}
          isBlurred={isBlurred}
          onCaseClick={onCaseClick}
          onDiscClick={onDiscClick}
        />
      ) : (
        <>
          {/* Blurred case in background */}
          <JewelCase
            coverUrl={track.coverUrl}
            isOpen={isOpen}
            isBlurred={true}
            onCaseClick={() => {}}
            onDiscClick={() => {}}
          />
          {/* Focused disc in foreground */}
          <CdDisc
            coverUrl={track.coverUrl}
            position={[0, 0, 0.03]}
            onClick={() => {}}
            isFocused={true}
          />
        </>
      )}

      {/* Controls - Only enable orbit when disc is focused */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={isFocused ? 1.5 : 3}
        maxDistance={isFocused ? 5 : 8}
        autoRotate={false}
        enabled={isFocused}
        target={isFocused ? [0, 0, 1.5] : [0, 0, 0]}
      />

      <Environment preset="studio" />
    </>
  );
}

// ============================================
// CSS Loading Spinner (no torus mesh)
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

  // ESC handler - geri adım veya kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'focused') {
          setViewMode('open');
        } else if (viewMode === 'open') {
          setViewMode('closed');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, onClose]);

  // Kutuya tıklama → kapak aç
  const handleCaseClick = useCallback(() => {
    if (viewMode === 'closed') {
      setViewMode('open');
    }
  }, [viewMode]);

  // CD diske tıklama → disk odakla
  const handleDiscClick = useCallback(() => {
    if (viewMode === 'open') {
      setViewMode('focused');
    }
  }, [viewMode]);

  // Boş alana tıklama → kapat
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (viewMode === 'focused') {
        setViewMode('open');
      } else {
        onClose();
      }
    }
  }, [viewMode, onClose]);

  // Hint text based on view mode
  const hintText = useMemo(() => {
    switch (viewMode) {
      case 'closed':
        return 'Kutuya tıkla: Kapak aç';
      case 'open':
        return 'CD diske tıkla: İncele';
      case 'focused':
        return 'Sürükle: Döndür • ESC: Geri';
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
              camera={{ position: [0, 0, 5], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <Scene
                track={track}
                viewMode={viewMode}
                onCaseClick={handleCaseClick}
                onDiscClick={handleDiscClick}
              />
            </Canvas>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
