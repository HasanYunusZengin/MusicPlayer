// ============================================
// CdModal3D - 3D CD Jewel Case Modal
// ============================================
// Three.js ile 3D CD kutusu, OrbitControls ve açılma animasyonu

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Track } from '../types';

interface CdModal3DProps {
  track: Track;
  onClose: () => void;
}

// CD Disc - Dönen disk
function CdDisc({ coverUrl }: { coverUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(coverUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [coverUrl]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0.02]}>
      {/* CD Disk */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[1.1, 1.1, 0.02, 64]} />
        <meshPhysicalMaterial
          color="#c0c0c0"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      {/* CD Label (cover image on top) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.2, 1.08, 64]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* Center hole */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// CD Jewel Case - Şeffaf plastik kutu
function JewelCase({ coverUrl, isOpen }: { coverUrl: string; isOpen: boolean }) {
  const coverRef = useRef<THREE.Group>(null);
  const targetAngle = isOpen ? -Math.PI * 0.66 : 0; // 120 degrees

  useFrame((_, delta) => {
    if (coverRef.current) {
      const current = coverRef.current.rotation.y;
      const diff = targetAngle - current;
      coverRef.current.rotation.y += diff * delta * 3;
    }
  });

  const coverTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(coverUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [coverUrl]);

  return (
    <group>
      {/* Back panel (arka panel) */}
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

      {/* Spine (sırt) */}
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
            <meshStandardMaterial map={coverTexture} side={THREE.FrontSide} />
          </mesh>
        </group>
      </group>

      {/* CD Tray (disk tepsisi) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.02, 64]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Center spindle */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 32]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Ana 3D sahne
function Scene({ track, isOpen }: { track: Track; isOpen: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
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

      <group rotation={[0.2, 0, 0]}>
        <JewelCase coverUrl={track.coverUrl} isOpen={isOpen} />
        {isOpen && <CdDisc coverUrl={track.coverUrl} />}
      </group>

      {/* Track info text */}
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
      >
        {track.title}
      </Text>
      <Text
        position={[0, -2.05, 0]}
        fontSize={0.1}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
      >
        {track.artist} — {track.album}
      </Text>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={8}
        autoRotate={!isOpen}
        autoRotateSpeed={1}
      />
      <Environment preset="studio" />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">3D Sahne Yükleniyor...</span>
      </div>
    </div>
  );
}

export default function CdModal3D({ track, onClose }: CdModal3DProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCanvasClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[90vw] max-w-[700px] h-[80vh] max-h-[600px] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Track info header */}
        <div className="absolute top-4 left-6 z-10">
          <h2 className="text-lg font-bold text-white truncate max-w-[300px]">
            {track.title}
          </h2>
          <p className="text-sm text-gray-400">
            {track.artist} • {track.album}
          </p>
        </div>

        {/* 3D Canvas */}
        <div className="w-full h-full relative cursor-pointer" onClick={handleCanvasClick}>
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              camera={{ position: [0, 0, 4.5], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <Scene track={track} isOpen={isOpen} />
            </Canvas>
          </Suspense>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="px-4 py-2 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm"
          >
            {isOpen ? '📀 Kapağı Kapat' : '💿 Kapağı Aç'}
          </button>
        </div>

        {/* Hint */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          Sürükle: Döndür • Tıkla: Aç/Kapat
        </div>
      </div>
    </div>
  );
}
