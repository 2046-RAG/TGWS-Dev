'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════
// Particle Network — AI Neural Network Animation
// Mouse-following particle system with connections
// Uses spatial grid for O(n) performance
// ═══════════════════════════════════════════════

const PARTICLE_COUNT = 80; // Reduced for performance
const CONNECTION_DISTANCE = 1.8;
const MOUSE_INFLUENCE_RADIUS = 2.5;
const MOUSE_ATTRACT_STRENGTH = 0.3;
const GRID_CELL_SIZE = 2.0; // Spatial grid cell size

// Brand colors
const CYAN = new THREE.Color('#00D4FF');
const PURPLE = new THREE.Color('#7B61FF');
const WHITE = new THREE.Color('#ffffff');

interface Particle {
  position: THREE.Vector3;
  basePosition: THREE.Vector3;
  color: THREE.Color;
}

// Spatial grid for O(n) neighbor lookup
class SpatialGrid {
  private cells: Map<string, number[]> = new Map();

  clear() {
    this.cells.clear();
  }

  getKey(x: number, y: number): string {
    const gx = Math.floor(x / GRID_CELL_SIZE);
    const gy = Math.floor(y / GRID_CELL_SIZE);
    return `${gx},${gy}`;
  }

  insert(index: number, x: number, y: number) {
    const key = this.getKey(x, y);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key)!.push(index);
  }

  getNearby(x: number, y: number): number[] {
    const gx = Math.floor(x / GRID_CELL_SIZE);
    const gy = Math.floor(y / GRID_CELL_SIZE);
    const result: number[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gx + dx},${gy + dy}`;
        const cell = this.cells.get(key);
        if (cell) result.push(...cell);
      }
    }
    return result;
  }
}

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef(new THREE.Vector2(9999, 9999));
  const { viewport, size } = useThree();
  const gridRef = useRef(new SpatialGrid());

  // Initialize particles
  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions: THREE.Vector3[] = [];
    const particleColors: THREE.Color[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = (Math.random() - 0.5) * 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const r = Math.random();
      const color = r < 0.7 ? CYAN.clone() : r < 0.9 ? PURPLE.clone() : WHITE.clone();
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      basePositions.push(new THREE.Vector3(x, y, z));
      particleColors.push(color);
    }

    return { positions, colors, basePositions, particleColors };
  }, [viewport.width, viewport.height]);

  // Line geometry buffer
  const linePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 6 * 3), []);
  const lineColors = useMemo(() => new Float32Array(PARTICLE_COUNT * 6 * 3), []);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current || !lineRef.current) return;

    const time = state.clock.elapsedTime;
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    const mouse3D = new THREE.Vector3(
      mouseRef.current.x * viewport.width * 0.5,
      mouseRef.current.y * viewport.height * 0.5,
      0
    );

    // Rebuild spatial grid
    gridRef.current.clear();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const base = particleData.basePositions[i];
      const x = base.x + Math.sin(time * 0.3 + i * 0.5) * 0.08;
      const y = base.y + Math.cos(time * 0.25 + i * 0.7) * 0.06;
      const z = base.z + Math.sin(time * 0.2 + i * 0.3) * 0.03;

      // Mouse attraction
      const dx = mouse3D.x - x;
      const dy = mouse3D.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let fx = x, fy = y;
      if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0.01) {
        const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * MOUSE_ATTRACT_STRENGTH;
        fx = x + dx * force * 0.02;
        fy = y + dy * force * 0.02;
      }

      posArray[i * 3] = fx;
      posArray[i * 3 + 1] = fy;
      posArray[i * 3 + 2] = z;

      gridRef.current.insert(i, fx, fy);
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Build connections using spatial grid (O(n) average)
    let connectionCount = 0;
    const maxConnections = PARTICLE_COUNT * 4;

    for (let i = 0; i < PARTICLE_COUNT && connectionCount < maxConnections; i++) {
      const ix = posArray[i * 3];
      const iy = posArray[i * 3 + 1];
      const iz = posArray[i * 3 + 2];
      const nearby = gridRef.current.getNearby(ix, iy);

      for (const j of nearby) {
        if (j <= i || connectionCount >= maxConnections) continue;

        const jx = posArray[j * 3];
        const jy = posArray[j * 3 + 1];
        const jz = posArray[j * 3 + 2];
        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.2;
          const idx = connectionCount * 6;

          linePositions[idx] = ix;
          linePositions[idx + 1] = iy;
          linePositions[idx + 2] = iz;
          linePositions[idx + 3] = jx;
          linePositions[idx + 4] = jy;
          linePositions[idx + 5] = jz;

          lineColors[idx] = CYAN.r * alpha;
          lineColors[idx + 1] = CYAN.g * alpha;
          lineColors[idx + 2] = CYAN.b * alpha;
          lineColors[idx + 3] = CYAN.r * alpha;
          lineColors[idx + 4] = CYAN.g * alpha;
          lineColors[idx + 5] = CYAN.b * alpha;

          connectionCount++;
        }
      }
    }

    // Update line geometry
    const geom = lineRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    posAttr.array.set(linePositions);
    posAttr.needsUpdate = true;
    colAttr.array.set(lineColors);
    colAttr.needsUpdate = true;
    geom.setDrawRange(0, connectionCount * 2);
  });

  return (
    <>
      {/* Particles as points — much more efficient than instanced spheres */}
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Connections */}
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={1} depthWrite={false} />
      </lineSegments>
    </>
  );
}

// WebGL detection
function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Static fallback background
function StaticFallback() {
  return (
    <div className="absolute inset-0 z-0">
      <div
        className="w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(123,97,255,0.06) 0%, transparent 50%), #0a0a0f',
        }}
      />
    </div>
  );
}

export default function ParticleNetwork() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(hasWebGL());
  }, []);

  // Still loading — show nothing (will be wrapped in Suspense)
  if (webglSupported === null) return <StaticFallback />;

  // No WebGL — show static fallback
  if (!webglSupported) return <StaticFallback />;

  // WebGL available — show particle network
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
