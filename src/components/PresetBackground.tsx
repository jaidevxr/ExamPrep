import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  PerspectiveCamera,
  Float,
  Sparkles,
  Sky,
  Sphere,
  Box,
  Cylinder,
  MeshReflectorMaterial,
  OrbitControls
} from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

// Tree component
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <Cylinder args={[0.2, 0.3, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Cylinder>
      
      {/* Foliage layers */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Sphere args={[0.8, 16, 16]} position={[0, 2.5, 0]}>
          <meshStandardMaterial color="#228B22" roughness={0.7} />
        </Sphere>
        <Sphere args={[0.9, 16, 16]} position={[0, 2, 0]}>
          <meshStandardMaterial color="#2E7D32" roughness={0.7} />
        </Sphere>
        <Sphere args={[0.7, 16, 16]} position={[0, 3, 0]}>
          <meshStandardMaterial color="#1B5E20" roughness={0.7} />
        </Sphere>
      </Float>
    </group>
  );
}

// Rock component
function Rock({ position }: { position: [number, number, number] }) {
  return (
    <Sphere args={[0.5, 8, 8]} position={position}>
      <meshStandardMaterial color="#696969" roughness={0.9} />
    </Sphere>
  );
}

// Mountain component
function Mountain({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0]}>
      <coneGeometry args={[3, 5, 8]} />
      <meshStandardMaterial 
        color="#4A5568" 
        roughness={0.8}
      />
    </mesh>
  );
}

// Animated water
function Water() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[30, 30, 32, 32]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#1e3a8a"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* Sky */}
      <Sky 
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0}
        azimuth={0.25}
      />

      {/* Environment */}
      <Environment preset="forest" />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#FFE4B5" />
      
      {/* Ground/Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#7CB342" roughness={0.8} />
      </mesh>
      
      {/* Water lake */}
      <Water />
      
      {/* Mountains in background */}
      <Mountain position={[-8, 1, -15]} />
      <Mountain position={[-5, 1.5, -18]} />
      <Mountain position={[6, 1.2, -16]} />
      <Mountain position={[10, 0.8, -20]} />
      
      {/* Forest - multiple trees */}
      <Tree position={[-5, 0, -5]} />
      <Tree position={[-7, 0, -3]} />
      <Tree position={[-3, 0, -6]} />
      <Tree position={[4, 0, -4]} />
      <Tree position={[6, 0, -6]} />
      <Tree position={[8, 0, -3]} />
      <Tree position={[-8, 0, 2]} />
      <Tree position={[7, 0, 1]} />
      <Tree position={[-2, 0, -8]} />
      <Tree position={[2, 0, -7]} />
      
      {/* Rocks scattered */}
      <Rock position={[-2, 0, 3]} />
      <Rock position={[3, 0, 2]} />
      <Rock position={[-4, 0, 4]} />
      <Rock position={[5, 0, -1]} />
      
      {/* Floating particles */}
      <Sparkles 
        count={200}
        scale={25}
        size={2}
        speed={0.3}
        opacity={0.4}
        color="#90EE90"
      />
      
      <Sparkles 
        count={100}
        scale={15}
        size={3}
        speed={0.2}
        opacity={0.6}
        color="#FFD700"
        position={[0, 2, -5]}
      />
      
      {/* Floating leaves effect */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Box args={[0.1, 0.1, 0.02]} position={[-3, 2, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
        <Box args={[0.1, 0.1, 0.02]} position={[4, 3, -2]}>
          <meshStandardMaterial color="#228B22" />
        </Box>
      </Float>
      
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.8}>
        <Box args={[0.1, 0.1, 0.02]} position={[0, 2.5, 2]}>
          <meshStandardMaterial color="#2E7D32" />
        </Box>
      </Float>
    </>
  );
}

export const PresetBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows camera={{ position: [0, 3, 12], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
