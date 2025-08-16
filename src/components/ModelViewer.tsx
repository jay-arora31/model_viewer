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
      const modelPaths = ['/models/patchwork_chair.ply'];
      
      let result = null;
      for (const modelPath of modelPaths) {
        try {
          result = await loader.load(
            modelPath,
            (progress) => setLoadingProgress(progress)
          );
          console.log('PLY model loaded successfully');
          break;
        } catch (err) {
          console.warn(`Failed to load ${modelPath}:`, err);
        }
      }
      
      // Use fallback if all paths fail
      if (!result) {
        console.warn('All PLY model paths failed, using fallback model');
        result = createFallbackModel();
        setError('PLY model not found, showing fallback geometry');
      }

      setGeometry(result.geometry);
      setMaterial(result.material);
      
    } catch (error) {
      console.error('Failed to load PLY model:', error);
      const fallback = createFallbackModel();
      setGeometry(fallback.geometry);
      setMaterial(fallback.material);
      setError('Failed to load PLY model');
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
      const result = await loader.load(
        '/models/dino_30k_cropped.splat',
        (progress) => setLoadingProgress(progress)
      );

      setGeometry(result.geometry);
      setMaterial(result.material);
      console.log('SPLAT model loaded successfully');
      
    } catch (error) {
      console.error('Failed to load SPLAT model:', error);
      const fallback = createFallbackModel();
      setGeometry(fallback.geometry);
      setMaterial(fallback.material);
      setError('Failed to load SPLAT model');
    } finally {
      onLoadingChange(false);
      setLoadingProgress(null);
    }
  };

  // Initialize with fallback model immediately
  useEffect(() => {
    const fallback = createFallbackModel();
    setGeometry(fallback.geometry);
    setMaterial(fallback.material);
    setError(null);
    onLoadingChange(false); // Ensure loading is off initially
  }, []);

  // Load model based on format
  useEffect(() => {
    if (format === 'ply') {
      loadPLYModel();
    } else if (format === 'splat') {
      loadSPLATModel();
    }
  }, [format]);

  // Animate camera to checkpoint position
  useEffect(() => {
    if (!camera) return;

    const startPosition = camera.position.clone();
    const targetPosition = new THREE.Vector3(...checkpoint.position);
    const targetLookAt = new THREE.Vector3(...checkpoint.target);
    const startTime = Date.now();
    const duration = 1000;

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