import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Sparkles, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function FloatingGeometry({ position, geometry, color, emissive }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
    
    // Pulsating glow effect
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial 
          color={color} 
          emissive={emissive || color}
          emissiveIntensity={0.5}
          wireframe 
          transparent 
          opacity={0.8} 
        />
      </mesh>
    </Float>
  );
}

function GlowingSphere({ position, color }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={3}>
      <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    const colorOptions = [
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#6366f1'),
    ];
    for (let i = 0; i < count; i++) {
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function MouseInteraction() {
  const { camera } = useThree();
  const [mouse] = useState(() => new THREE.Vector2());

  useFrame((state) => {
    mouse.x = (state.mouse.x * Math.PI) / 10;
    mouse.y = (state.mouse.y * Math.PI) / 10;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y, 0.05);
  });

  return null;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[0, 0, 10]} intensity={1} color="#06b6d4" />
      <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#a855f7" />
      
      <Stars radius={150} depth={80} count={8000} factor={6} saturation={0.5} fade speed={1.5} />
      <Sparkles count={200} scale={25} size={3} speed={0.6} opacity={0.8} color="#8b5cf6" />
      <Sparkles count={150} scale={20} size={2} speed={0.4} opacity={0.6} color="#06b6d4" />
      
      <MouseInteraction />
      
      <GlowingSphere position={[-5, 3, -2]} color="#8b5cf6" />
      <GlowingSphere position={[5, -3, -3]} color="#3b82f6" />
      <GlowingSphere position={[0, 0, -5]} color="#06b6d4" />
      
      <FloatingGeometry 
        position={[-3, 2, 0]} 
        geometry={<boxGeometry args={[1.5, 1.5, 1.5]} />}
        color="#3b82f6"
        emissive="#1e40af"
      />
      <FloatingGeometry 
        position={[3, -2, -2]} 
        geometry={<octahedronGeometry args={[1.2]} />}
        color="#8b5cf6"
        emissive="#6d28d9"
      />
      <FloatingGeometry 
        position={[0, 4, -3]} 
        geometry={<torusGeometry args={[1.5, 0.4, 16, 100]} />}
        color="#06b6d4"
        emissive="#0e7490"
      />
      <FloatingGeometry 
        position={[-4, -3, -1]} 
        geometry={<icosahedronGeometry args={[1.2]} />}
        color="#a855f7"
        emissive="#7e22ce"
      />
      <FloatingGeometry 
        position={[4, 1, -4]} 
        geometry={<tetrahedronGeometry args={[1.3]} />}
        color="#6366f1"
        emissive="#4338ca"
      />
      <FloatingGeometry 
        position={[-2, -4, -2]} 
        geometry={<dodecahedronGeometry args={[1]} />}
        color="#ec4899"
        emissive="#be185d"
      />
      <FloatingGeometry 
        position={[2, 4, -5]} 
        geometry={<torusKnotGeometry args={[0.8, 0.3, 100, 16]} />}
        color="#f59e0b"
        emissive="#d97706"
      />
      
      <ParticleField />
    </>
  );
}

export const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <fog attach="fog" args={['#000000', 10, 50]} />
        <Scene />
      </Canvas>
    </div>
  );
};
