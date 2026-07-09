'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════
// Particle Network — AI Neural Network Animation
// Mouse-following particle system with connections
// ═══════════════════════════════════════════════

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 1.8;
const MOUSE_INFLUENCE_RADIUS = 2.5;
const MOUSE_ATTRACT_STRENGTH = 0.3;

// Brand colors
const CYAN = new THREE.Color('#00D4FF');
const PURPLE = new THREE.Color('#7B61FF');
const WHITE = new THREE.Color('#ffffff');

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
  color: THREE.Color;
  size: number;
}

function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const mouseRef = useRef(new THREE.Vector2(9999, 9999));
  const { viewport } = useThree();

  // Initialize particles
  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = (Math.random() - 0.5) * 2;
      const pos = new THREE.Vector3(x, y, z);
      // Color: 70% cyan, 20% purple, 10% white
      const r = Math.random();
      const color = r < 0.7 ? CYAN.clone() : r < 0.9 ? PURPLE.clone() : WHITE.clone();
      arr.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          0
        ),
        basePosition: pos.clone(),
        color,
        size: 0.02 + Math.random() * 0.02,
      });
    }
    return arr;
  }, [viewport.width, viewport.height]);

  // Instanced mesh matrix + color buffers
  const { matrices, colors } = useMemo(() => {
    const m = new Float32Array(PARTICLE_COUNT * 16);
    const c = new Float32Array(PARTICLE_COUNT * 3);
    const tempMatrix = new THREE.Matrix4();
    particles.forEach((p, i) => {
      tempMatrix.makeTranslation(p.position.x, p.position.y, p.position.z);
      tempMatrix.toArray(m, i * 16);
      c[i * 3] = p.color.r;
      c[i * 3 + 1] = p.color.g;
      c[i * 3 + 2] = p.color.b;
    });
    return { matrices: m, colors: c };
  }, [particles]);

  // Line geometry buffer (max connections: PARTICLE_COUNT * 6)
  const linePositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 6 * 3), []);
  const lineColors = useMemo(() => new Float32Array(PARTICLE_COUNT * 6 * 3), []);

  // Mouse tracking via window
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

    const tempMatrix = new THREE.Matrix4();
    const mouse3D = new THREE.Vector3(
      mouseRef.current.x * viewport.width * 0.5,
      mouseRef.current.y * viewport.height * 0.5,
      0
    );

    // Update particle positions
    particles.forEach((p, i) => {
      // Drift animation
      const time = state.clock.elapsedTime;
      p.position.x = p.basePosition.x + Math.sin(time * 0.3 + i * 0.5) * 0.08;
      p.position.y = p.basePosition.y + Math.cos(time * 0.25 + i * 0.7) * 0.06;
      p.position.z = p.basePosition.z + Math.sin(time * 0.2 + i * 0.3) * 0.03;

      // Mouse attraction
      const dx = mouse3D.x - p.position.x;
      const dy = mouse3D.y - p.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0.01) {
        const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * MOUSE_ATTRACT_STRENGTH;
        p.position.x += dx * force * 0.02;
        p.position.y += dy * force * 0.02;
      }

      // Update instanced matrix
      tempMatrix.makeTranslation(p.position.x, p.position.y, p.position.z);
      tempMatrix.toArray(matrices, i * 16);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;

    // Build connections
    let connectionCount = 0;
    const maxConnections = PARTICLE_COUNT * 6;

    for (let i = 0; i < particles.length && connectionCount < maxConnections; i++) {
      for (let j = i + 1; j < particles.length && connectionCount < maxConnections; j++) {
        const dx = particles[i].position.x - particles[j].position.x;
        const dy = particles[i].position.y - particles[j].position.y;
        const dz = particles[i].position.z - particles[j].position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          const idx = connectionCount * 6;

          // Line vertices
          linePositions[idx] = particles[i].position.x;
          linePositions[idx + 1] = particles[i].position.y;
          linePositions[idx + 2] = particles[i].position.z;
          linePositions[idx + 3] = particles[j].position.x;
          linePositions[idx + 4] = particles[j].position.y;
          linePositions[idx + 5] = particles[j].position.z;

          // Line colors (cyan with alpha)
          const c = alpha * 0.15;
          lineColors[idx] = CYAN.r * c;
          lineColors[idx + 1] = CYAN.g * c;
          lineColors[idx + 2] = CYAN.b * c;
          lineColors[idx + 3] = CYAN.r * c;
          lineColors[idx + 4] = CYAN.g * c;
          lineColors[idx + 5] = CYAN.b * c;

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
      {/* Particles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.8} />
      </instancedMesh>
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
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </lineSegments>
    </>
  );
}

export default function ParticleNetwork() {
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
