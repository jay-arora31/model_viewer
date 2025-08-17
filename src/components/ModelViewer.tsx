import React, { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Checkpoint } from '../App';
import { OptimizedPLYLoader, SplatLoader, createFallbackModel } from '../utils/modelLoader';
import type { LoadingProgress } from '../utils/modelLoader';


interface ModelViewerProps {
  format: 'ply' | 'splat';
  checkpoint: Checkpoint;
  onLoadingChange: (loading: boolean) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ format, checkpoint, onLoadingChange }) => {
  // Refs for 3D objects
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // State management
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState<THREE.Material | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup function for geometry and material
  const cleanupResources = () => {
    if (geometry) {
      geometry.dispose();
    }
    if (material) {
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose());
      } else {
        material.dispose();
      }
    }
  };

  // Load PLY model with error handling
  const loadPLYModel = async () => {
    console.log('Loading PLY model...');
    onLoadingChange(true);
    setError(null);
    setLoadingProgress(null);
    
    try {
      const loader = new OptimizedPLYLoader();
      
      // Add loading timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout')), 10000);
      });
      
      const loadPromise = loader.load(
        '/models/patchwork_chair.ply',
        (progress) => setLoadingProgress(progress)
      );
      
      const { geometry: loadedGeometry, material: loadedMaterial } = await Promise.race([
        loadPromise,
        timeoutPromise
      ]);
      
      // Clean up previous resources
      cleanupResources();
      
      setGeometry(loadedGeometry);
      setMaterial(loadedMaterial);
      console.log('PLY model loaded successfully');
      
    } catch (loadError) {
      console.warn('Failed to load PLY model, using fallback:', loadError);
      setError(`PLY loading failed: ${loadError}`);
      
      // Use fallback model
      const { geometry: fallbackGeometry, material: fallbackMaterial } = createFallbackModel();
      cleanupResources();
      setGeometry(fallbackGeometry);
      setMaterial(fallbackMaterial);
    } finally {
      onLoadingChange(false);
      setLoadingProgress(null);
    }
  };

  // Load SPLAT model with error handling
  const loadSPLATModel = async () => {
    console.log('Loading SPLAT model...');
    onLoadingChange(true);
    setError(null);
    setLoadingProgress(null);
    
    try {
      const loader = new SplatLoader();
      
      // Add loading timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Loading timeout')), 10000);
      });
      
      const loadPromise = loader.load(
        '/models/dino_30k_cropped.splat',
        (progress) => setLoadingProgress(progress)
      );
      
      const { geometry: loadedGeometry, material: loadedMaterial } = await Promise.race([
        loadPromise,
        timeoutPromise
      ]);
      
      // Clean up previous resources
      cleanupResources();
      
      setGeometry(loadedGeometry);
      setMaterial(loadedMaterial);
      console.log('SPLAT model loaded successfully');
      
    } catch (loadError) {
      console.warn('Failed to load SPLAT model, using fallback:', loadError);
      setError(`SPLAT loading failed: ${loadError}`);
      
      // Use fallback model
      const { geometry: fallbackGeometry, material: fallbackMaterial } = createFallbackModel();
      cleanupResources();
      setGeometry(fallbackGeometry);
      setMaterial(fallbackMaterial);
    } finally {
      onLoadingChange(false);
      setLoadingProgress(null);
    }
  };

  // Load model based on format
  useEffect(() => {
    // Display immediate fallback to prevent blank screen
    const { geometry: immediateGeometry, material: immediateMaterial } = createFallbackModel();
    setGeometry(immediateGeometry);
    setMaterial(immediateMaterial);

    if (format === 'ply') {
      loadPLYModel();
    } else if (format === 'splat') {
      loadSPLATModel();
    }
  }, [format]);

  // Animate camera when checkpoint changes
  useEffect(() => {
    const startPosition = camera.position.clone();
    const targetPosition = new THREE.Vector3(...checkpoint.position);
    const targetLookAt = new THREE.Vector3(...checkpoint.target);
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const easedProgress = easeInOut(progress);
      
      camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
      camera.lookAt(targetLookAt);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  }, [checkpoint, camera]);

  // Final cleanup on unmount
  useEffect(() => {
    return cleanupResources;
  }, [cleanupResources]);

  // Apply proper rotation to fix model orientation
  useEffect(() => {
    if (groupRef.current) {
      // Reset rotation first
      groupRef.current.rotation.set(0, 0, 0);
      
      // Apply standard orientation corrections
      if (format === 'ply') {
        // PLY model orientation fix
        groupRef.current.rotation.x = Math.PI / 2; // +90 degrees
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = 0;
        
      } else if (format === 'splat') {
        // SPLAT model - final combination attempt
        groupRef.current.rotation.x = Math.PI / 2; // +90 degrees (same as PLY)
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = Math.PI; // 180 degrees Z-axis flip
      }
    }
  }, [format, geometry]);

  return (
    <group ref={groupRef}>
      {geometry && material && (
        <>
          {format === 'splat' ? (
            <points 
              ref={pointsRef} 
              geometry={geometry} 
              material={material} 
            />
          ) : (
            <mesh 
              ref={meshRef} 
              geometry={geometry} 
              material={material} 
            />
          )}
        </>
      )}
      
      {/* Loading progress indicator */}
      {loadingProgress && (
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[2 * (loadingProgress.percentage / 100), 0.1, 0.1]} />
          <meshBasicMaterial color={0x3b82f6} />
        </mesh>
      )}
      
      {/* Error indicator */}
      {error && (
        <mesh position={[0, -2, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color={0xff4444} />
        </mesh>
      )}
    </group>
  );
};

export default ModelViewer; 