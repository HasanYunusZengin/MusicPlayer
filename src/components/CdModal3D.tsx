// ============================================
// CdModal3D - Full-Screen 3D CD Inspector
// ============================================
// Full-screen overlay, GLB model yükleme, çift tıklama ile kapak açma
// ESC ve boş alana tıklama ile kapatma

import { useRef, useState, useEffect, useMemo, Suspense, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { Track } from '../types';

interface CdModal3DProps {
  track: Track;
  onClose: () => void;
}

// ============================================
// Error Boundary - GLB yükleme hatalarını yakalar
// ============================================
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ============================================
// Texture Loader - Albüm kapağını texture olarak yükler
// ============================================
function useAlbumTexture(coverUrl: string): THREE.Texture | null {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(
      coverUrl,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Texture load failed:', err)
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [coverUrl]);

  return texture;
}

// ============================================
// GLB Model Loader - Harici 3D model yükler
// ============================================
function useGLBModel(modelPath: string) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    setLoading(true);
    setError(null);

    loader.load(
      modelPath,
      (gltf) => {
        setModel(gltf.scene);
        setLoading(false);
      },
      (progress) => {
        // Progress callback (optional)
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Model loading: ${percent.toFixed(1)}%`);
        }
      },
      (err) => {
        console.warn('GLB model load failed:', err);
        setError('Model yüklenemedi');
        setLoading(false);
      }
    );

    return () => {
      // Cleanup
      setModel(null);
    };
  }, [modelPath]);

  return { model, loading, error };
}

// ============================================
// GLB Model Renderer - Yüklenen modeli render eder
// ============================================
function GLBModelRenderer({
  model,
  coverUrl,
  isOpen,
  onDoubleClick,
}: {
  model: THREE.Group;
  coverUrl: string;
  isOpen: boolean;
  onDoubleClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useAlbumTexture(coverUrl);

  // Model klonla ve texture uygula
  const clonedModel = useMemo(() => {
    const clone = model.clone();
    
    // Traverse and apply texture to materials
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // Apply album cover texture to the cover material
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                if (texture) {
                  mat.map = texture;
                  mat.needsUpdate = true;
                }
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshPhysicalMaterial) {
            if (texture) {
              child.material.map = texture;
              child.material.needsUpdate = true;
            }
          }
        }
      }
    });

    return clone;
  }, [model, texture]);

  // Kapak açılma animasyonu
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Gentle rotation when not interacting
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      <primitive object={clonedModel} scale={2} />
    </group>
  );
}

// ============================================
// Fallback Model - GLB yoksa procedural model gösterir
// ============================================
function FallbackCdModel({
  coverUrl,
  isOpen,
  onDoubleClick,
}: {
  coverUrl: string;
  isOpen: boolean;
  onDoubleClick: () => void;
}) {
  const coverRef = useRef<THREE.Group>(null);
  const discRef = useRef<THREE.Mesh>(null);
  const texture = useAlbumTexture(coverUrl);
  const targetAngle = isOpen ? -Math.PI * 0.66 : 0;

  // Kapak açılma animasyonu
  useFrame((_, delta) => {
    if (coverRef.current) {
      const current = coverRef.current.rotation.y;
      const diff = targetAngle - current;
      coverRef.current.rotation.y += diff * delta * 3;
    }
    if (discRef.current && isOpen) {
      discRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group
      rotation={[0.2, 0, 0]}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
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
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.02, 64]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* CD Disc */}
      {isOpen && (
        <group position={[0, 0, 0.02]}>
          <mesh ref={discRef}>
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
          {/* CD Label */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
            <ringGeometry args={[0.2, 1.08, 64]} />
            <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Center spindle */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 32]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ============================================
// Loading Indicator - Three.js sahne içinde yükleme göstergesi
// ============================================
function LoadingSpinner() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.5, 0.1, 16, 32]} />
      <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
    </mesh>
  );
}

// ============================================
// 3D Scene - Ana sahne bileşeni
// ============================================
function Scene({ track, isOpen, onDoubleClick }: { track: Track; isOpen: boolean; onDoubleClick: () => void }) {
  const { model, loading } = useGLBModel('/models/cd_case.glb');

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

      {/* Model */}
      <ModelErrorBoundary
        fallback={
          <FallbackCdModel
            coverUrl={track.coverUrl}
            isOpen={isOpen}
            onDoubleClick={onDoubleClick}
          />
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : model ? (
          <GLBModelRenderer
            model={model}
            coverUrl={track.coverUrl}
            isOpen={isOpen}
            onDoubleClick={onDoubleClick}
          />
        ) : (
          <FallbackCdModel
            coverUrl={track.coverUrl}
            isOpen={isOpen}
            onDoubleClick={onDoubleClick}
          />
        )}
      </ModelErrorBoundary>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
        autoRotate={!isOpen}
        autoRotateSpeed={1.5}
      />

      {/* Environment */}
      <Environment preset="studio" />
    </>
  );
}

// ============================================
// Main Modal Component
// ============================================
export default function CdModal3D({ track, onClose }: CdModal3DProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Çift tıklama ile kapak açma/kapatma
  const handleDoubleClick = () => {
    setIsOpen(!isOpen);
  };

  // Boş alana tıklama ile kapatma
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />

      {/* Content container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Track info header */}
        <div className="absolute top-6 left-6 z-10 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-1 truncate">
            {track.title}
          </h2>
          <p className="text-sm text-gray-400">
            {track.artist} • {track.album}
          </p>
        </div>

        {/* Hint text */}
        <div className="absolute top-6 right-6 z-10 text-xs text-gray-500 text-right">
          <p>Çift tıkla: Kapak aç/kapat</p>
          <p>Sürükle: Döndür • ESC: Kapat</p>
        </div>

        {/* 3D Canvas - Full screen */}
        <div className="flex-1 w-full h-full">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Scene
                track={track}
                isOpen={isOpen}
                onDoubleClick={handleDoubleClick}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}
