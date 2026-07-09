'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { aiCoreVertexShader, aiCoreFragmentShader } from './AICoreShader';

// ═══════════════════════════════════════════════
// AI Neural Core — 5-layer interactive visualization
// L1: Glowing AI core sphere (custom shader)
// L2: Inner ring nodes (orbiting core)
// L3: Connection lines with data pulses
// L4: Outer floating particles
// L5: Background grid
// ═══════════════════════════════════════════════

const OUTER_PARTICLES = 50;
const INNER_NODES = 10;
const MAX_CONNECTIONS = 40;
const MAX_PULSES = 6;

const CYAN = new THREE.Color('#00D4FF');
const PURPLE = new THREE.Color('#7B61FF');

// ─── Data Pulse ───────────────────────────────
interface Pulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
}

// ─── L1: AI Core Sphere ───────────────────────
function AICore({ mouseRef }: { mouseRef: React.MutableRefObject<THREE.Vector2> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPulse: { value: 1.0 },
    uColor1: { value: CYAN },
    uColor2: { value: PURPLE },
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const time = state.clock.elapsedTime;
    materialRef.current.uniforms.uTime.value = time;

    // Pulse breathing
    materialRef.current.uniforms.uPulse.value = 0.85 + Math.sin(time * 1.5) * 0.15;

    // Mouse follow with elastic easing
    const targetX = mouseRef.current.x * 0.3;
    const targetY = mouseRef.current.y * 0.2;
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.03;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.03;

    // Slow rotation
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.x = Math.sin(time * 0.15) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.6, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={aiCoreVertexShader}
        fragmentShader={aiCoreFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── L2+L3+L4: Particles + Connections + Pulses ───
function NeuralNetwork({ mouseRef }: { mouseRef: React.MutableRefObject<THREE.Vector2> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Core position (follows mouse with delay)
  const corePos = useRef(new THREE.Vector3(0, 0, 0));

  // Inner ring nodes
  const innerData = useMemo(() => {
    const positions = new Float32Array(INNER_NODES * 3);
    const colors = new Float32Array(INNER_NODES * 3);
    const orbitAngles: number[] = [];
    const orbitRadius = 1.2;

    for (let i = 0; i < INNER_NODES; i++) {
      const angle = (i / INNER_NODES) * Math.PI * 2;
      orbitAngles.push(angle);
      positions[i * 3] = Math.cos(angle) * orbitRadius;
      positions[i * 3 + 1] = Math.sin(angle) * orbitRadius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      // Cyan with slight variation
      colors[i * 3] = CYAN.r * (0.8 + Math.random() * 0.2);
      colors[i * 3 + 1] = CYAN.g * (0.8 + Math.random() * 0.2);
      colors[i * 3 + 2] = CYAN.b;
    }
    return { positions, colors, orbitAngles, orbitRadius };
  }, []);

  // Outer floating particles
  const outerData = useMemo(() => {
    const positions = new Float32Array(OUTER_PARTICLES * 3);
    const colors = new Float32Array(OUTER_PARTICLES * 3);
    const basePositions: THREE.Vector3[] = [];

    for (let i = 0; i < OUTER_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 2.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 1.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions.push(new THREE.Vector3(x, y, z));

      const r = Math.random();
      const color = r < 0.7 ? CYAN : r < 0.9 ? PURPLE : new THREE.Color('#ffffff');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors, basePositions };
  }, []);

  // Combined positions (inner + outer)
  const allPositions = useMemo(() => {
    const combined = new Float32Array((INNER_NODES + OUTER_PARTICLES) * 3);
    combined.set(innerData.positions, 0);
    combined.set(outerData.positions, INNER_NODES * 3);
    return combined;
  }, [innerData, outerData]);

  const allColors = useMemo(() => {
    const combined = new Float32Array((INNER_NODES + OUTER_PARTICLES) * 3);
    combined.set(innerData.colors, 0);
    combined.set(outerData.colors, INNER_NODES * 3);
    return combined;
  }, [innerData, outerData]);

  // Line buffers
  const linePositions = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), []);
  const lineColors = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), []);

  // Pulse positions/colors
  const pulsePositions = useMemo(() => new Float32Array(MAX_PULSES * 3), []);
  const pulseSizes = useMemo(() => new Float32Array(MAX_PULSES), []);

  // Pulse state
  const pulses = useRef<Pulse[]>([]);

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
  }, [mouseRef]);

  // Animation loop
  useFrame((state) => {
    if (!pointsRef.current || !lineRef.current || !pulseRef.current) return;

    const time = state.clock.elapsedTime;
    const allPos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    // Update core position (follows mouse)
    const targetCoreX = mouseRef.current.x * 0.3;
    const targetCoreY = mouseRef.current.y * 0.2;
    corePos.current.x += (targetCoreX - corePos.current.x) * 0.03;
    corePos.current.y += (targetCoreY - corePos.current.y) * 0.03;

    // L2: Update inner ring nodes (orbit around core)
    for (let i = 0; i < INNER_NODES; i++) {
      const angle = innerData.orbitAngles[i] + time * 0.3;
      const r = innerData.orbitRadius;
      allPos[i * 3] = corePos.current.x + Math.cos(angle) * r;
      allPos[i * 3 + 1] = corePos.current.y + Math.sin(angle) * r;
      allPos[i * 3 + 2] = Math.sin(time * 0.5 + i) * 0.2;
    }

    // L4: Update outer particles
    for (let i = 0; i < OUTER_PARTICLES; i++) {
      const base = outerData.basePositions[i];
      const idx = INNER_NODES + i;

      // Drift
      let x = base.x + Math.sin(time * 0.2 + i * 0.7) * 0.15;
      let y = base.y + Math.cos(time * 0.18 + i * 0.5) * 0.12;

      // Mouse attraction (only within radius)
      const dx = mouseRef.current.x * viewport.width * 0.5 - x;
      const dy = mouseRef.current.y * viewport.height * 0.5 - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.0 && dist > 0.01) {
        const force = (1 - dist / 2.0) * 0.15;
        x += dx * force;
        y += dy * force;
      }

      allPos[idx * 3] = x;
      allPos[idx * 3 + 1] = y;
      allPos[idx * 3 + 2] = base.z + Math.sin(time * 0.15 + i * 0.3) * 0.1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // L3: Build connections (inner-to-inner + inner-to-outer)
    let connectionCount = 0;

    // Inner-to-inner connections
    for (let i = 0; i < INNER_NODES && connectionCount < MAX_CONNECTIONS; i++) {
      for (let j = i + 1; j < INNER_NODES && connectionCount < MAX_CONNECTIONS; j++) {
        const dx = allPos[i * 3] - allPos[j * 3];
        const dy = allPos[i * 3 + 1] - allPos[j * 3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2.5) {
          const alpha = (1 - dist / 2.5) * 0.4;
          const idx = connectionCount * 6;
          linePositions[idx] = allPos[i * 3];
          linePositions[idx + 1] = allPos[i * 3 + 1];
          linePositions[idx + 2] = allPos[i * 3 + 2];
          linePositions[idx + 3] = allPos[j * 3];
          linePositions[idx + 4] = allPos[j * 3 + 1];
          linePositions[idx + 5] = allPos[j * 3 + 2];
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

    // Inner-to-outer connections (sparser)
    for (let i = 0; i < INNER_NODES && connectionCount < MAX_CONNECTIONS; i += 2) {
      for (let j = INNER_NODES; j < INNER_NODES + OUTER_PARTICLES && connectionCount < MAX_CONNECTIONS; j += 3) {
        const dx = allPos[i * 3] - allPos[j * 3];
        const dy = allPos[i * 3 + 1] - allPos[j * 3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2.0) {
          const alpha = (1 - dist / 2.0) * 0.15;
          const idx = connectionCount * 6;
          linePositions[idx] = allPos[i * 3];
          linePositions[idx + 1] = allPos[i * 3 + 1];
          linePositions[idx + 2] = allPos[i * 3 + 2];
          linePositions[idx + 3] = allPos[j * 3];
          linePositions[idx + 4] = allPos[j * 3 + 1];
          linePositions[idx + 5] = allPos[j * 3 + 2];
          lineColors[idx] = PURPLE.r * alpha;
          lineColors[idx + 1] = PURPLE.g * alpha;
          lineColors[idx + 2] = PURPLE.b * alpha;
          lineColors[idx + 3] = PURPLE.r * alpha;
          lineColors[idx + 4] = PURPLE.g * alpha;
          lineColors[idx + 5] = PURPLE.b * alpha;
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

    // L3: Data pulses
    // Spawn new pulses occasionally
    if (pulses.current.length < MAX_PULSES && Math.random() < 0.02 && connectionCount > 0) {
      const randomConn = Math.floor(Math.random() * Math.min(connectionCount, 20));
      pulses.current.push({
        fromIdx: randomConn * 2,
        toIdx: randomConn * 2 + 1,
        progress: 0,
        speed: 0.01 + Math.random() * 0.02,
      });
    }

    // Update pulses
    for (let i = pulses.current.length - 1; i >= 0; i--) {
      const p = pulses.current[i];
      p.progress += p.speed;
      if (p.progress >= 1) {
        pulses.current.splice(i, 1);
        continue;
      }

      // Interpolate position along connection
      const fromX = linePositions[p.fromIdx * 3];
      const fromY = linePositions[p.fromIdx * 3 + 1];
      const fromZ = linePositions[p.fromIdx * 3 + 2];
      const toX = linePositions[p.toIdx * 3];
      const toY = linePositions[p.toIdx * 3 + 1];
      const toZ = linePositions[p.toIdx * 3 + 2];

      pulsePositions[i * 3] = fromX + (toX - fromX) * p.progress;
      pulsePositions[i * 3 + 1] = fromY + (toY - fromY) * p.progress;
      pulsePositions[i * 3 + 2] = fromZ + (toZ - fromZ) * p.progress;
      pulseSizes[i] = 0.08 + Math.sin(p.progress * Math.PI) * 0.04;
    }

    // Clear unused pulse slots
    for (let i = pulses.current.length; i < MAX_PULSES; i++) {
      pulsePositions[i * 3] = 0;
      pulsePositions[i * 3 + 1] = 0;
      pulsePositions[i * 3 + 2] = 100; // Off-screen
      pulseSizes[i] = 0;
    }

    pulseRef.current.geometry.attributes.position.needsUpdate = true;
    pulseRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <>
      {/* L4+L2: All particles (inner + outer) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[allPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[allColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* L3: Connection lines */}
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={1} depthWrite={false} />
      </lineSegments>

      {/* L3: Data pulses (glowing dots along connections) */}
      <points ref={pulseRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
          <bufferAttribute attach="attributes-size" args={[pulseSizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#ffffff"
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ─── L5: Background Grid ──────────────────────
function BackgroundGrid() {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.z = -2 + Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
  });

  return (
    <gridHelper
      ref={ref}
      args={[20, 40, '#00D4FF', '#00D4FF']}
      position={[0, 0, -2]}
      material-transparent
      material-opacity={0.03}
    />
  );
}

// ─── WebGL Detection ──────────────────────────
function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function StaticFallback() {
  return (
    <div className="absolute inset-0 z-0">
      <div
        className="w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at 40% 45%, rgba(0,212,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 55%, rgba(123,97,255,0.08) 0%, transparent 45%), #0a0a0f',
        }}
      />
    </div>
  );
}

// ─── Main Export ───────────────────────────────
export default function ParticleNetwork() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const mouseRef = useRef(new THREE.Vector2(9999, 9999));

  useEffect(() => {
    setWebglSupported(hasWebGL());
  }, []);

  if (webglSupported === null) return <StaticFallback />;
  if (!webglSupported) return <StaticFallback />;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        {/* L1: AI Core Sphere */}
        <AICore mouseRef={mouseRef} />
        {/* L2+L3+L4: Neural Network */}
        <NeuralNetwork mouseRef={mouseRef} />
        {/* L5: Background Grid */}
        <BackgroundGrid />
        {/* Ambient light for shader */}
        <ambientLight intensity={0.3} />
      </Canvas>
    </div>
  );
}
