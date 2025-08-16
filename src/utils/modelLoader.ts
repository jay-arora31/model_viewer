import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

// Constants
const DEFAULT_SCALE_FACTOR = 2;
const SPLAT_BYTES_PER_ENTRY = 32;
const POSITION_OFFSET = 0;
const SCALE_OFFSET = 12;
const COLOR_OFFSET = 24;

export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ModelLoadResult {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

/**
 * Optimized PLY loader with chunked loading for large files
 */
export class OptimizedPLYLoader {
  private loader: PLYLoader;
  private abortController: AbortController | null = null;

  constructor() {
    this.loader = new PLYLoader();
  }

  /**
   * Load PLY file with progress tracking
   */
  async load(
    url: string,
    onProgress?: (progress: LoadingProgress) => void,
    signal?: AbortSignal
  ): Promise<ModelLoadResult> {
    this.abortController = new AbortController();
    
    if (signal) {
      signal.addEventListener('abort', () => this.abortController?.abort());
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (geometry: THREE.BufferGeometry) => {
          try {
            this.optimizeGeometry(geometry);
            const material = this.createOptimizedMaterial(geometry);
            resolve({ geometry, material });
          } catch (error) {
            reject(new Error(`Failed to process PLY geometry: ${error}`));
          }
        },
        (progressEvent: ProgressEvent<EventTarget>) => {
          if (onProgress && progressEvent.lengthComputable) {
            const progress: LoadingProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: (progressEvent.loaded / progressEvent.total) * 100
            };
            onProgress(progress);
          }
        },
        (error: unknown) => {
          reject(new Error(`Failed to load PLY file: ${error}`));
        }
      );
    });
  }

  /**
   * Optimize geometry for rendering
   */
  private optimizeGeometry(geometry: THREE.BufferGeometry): void {
    if (!geometry.getAttribute('normal')) {
      geometry.computeVertexNormals();
    }

    geometry.center();

    // Scale to fit in viewport
    const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const box = new THREE.Box3().setFromBufferAttribute(positionAttr);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    
    if (maxSize > 0) {
      const scale = DEFAULT_SCALE_FACTOR / maxSize;
      geometry.scale(scale, scale, scale);
    }
  }

  /**
   * Create optimized material based on geometry attributes
   */
  private createOptimizedMaterial(geometry: THREE.BufferGeometry): THREE.Material {
    const hasColors = geometry.getAttribute('color') !== undefined;

    return new THREE.MeshStandardMaterial({
      vertexColors: hasColors,
      color: hasColors ? 0xffffff : 0x888888,
      metalness: hasColors ? 0.1 : 0.3,
      roughness: hasColors ? 0.8 : 0.7,
      transparent: false,
    });
  }

  /**
   * Abort the current loading operation
   */
  abort(): void {
    this.abortController?.abort();
  }
}

/**
 * SPLAT loader for Gaussian Splat files
 */
export class SplatLoader {
  /**
   * Load SPLAT file with progress tracking
   */
  async load(
    url: string,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<ModelLoadResult> {
    console.log('Starting SPLAT file load:', url);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await this.readFileWithProgress(response, onProgress);
      const { positions, colors, sizes } = this.parseSplatData(buffer);
      
      this.centerAndScale(positions, positions.length / 3);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
      });

      return { geometry, material };
      
    } catch (error) {
      throw new Error(`SPLAT loading failed: ${error}`);
    }
  }

  /**
   * Read file with progress tracking
   */
  private async readFileWithProgress(
    response: Response,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<Uint8Array> {
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total > 0) {
        onProgress({
          loaded,
          total,
          percentage: (loaded / total) * 100
        });
      }
    }

    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    console.log('SPLAT file loaded, size:', buffer.length, 'bytes');
    return buffer;
  }

  /**
   * Parse SPLAT binary data
   */
  private parseSplatData(buffer: Uint8Array): {
    positions: Float32Array;
    colors: Float32Array;
    sizes: Float32Array;
  } {
    const splatCount = Math.floor(buffer.length / SPLAT_BYTES_PER_ENTRY);
    console.log('Parsing', splatCount, 'splats');

    const positions = new Float32Array(splatCount * 3);
    const colors = new Float32Array(splatCount * 3);
    const sizes = new Float32Array(splatCount);

    for (let i = 0; i < splatCount; i++) {
      const offset = i * SPLAT_BYTES_PER_ENTRY;
      const view = new DataView(buffer.buffer, offset, SPLAT_BYTES_PER_ENTRY);
      
      // Read position
      positions[i * 3] = view.getFloat32(POSITION_OFFSET, true);
      positions[i * 3 + 1] = view.getFloat32(POSITION_OFFSET + 4, true);
      positions[i * 3 + 2] = view.getFloat32(POSITION_OFFSET + 8, true);
      
      // Read scale and calculate average size
      const scaleX = view.getFloat32(SCALE_OFFSET, true);
      const scaleY = view.getFloat32(SCALE_OFFSET + 4, true);
      const scaleZ = view.getFloat32(SCALE_OFFSET + 8, true);
      sizes[i] = Math.max(0.001, (Math.abs(scaleX) + Math.abs(scaleY) + Math.abs(scaleZ)) / 3);
      
      // Read color
      colors[i * 3] = view.getUint8(COLOR_OFFSET) / 255;
      colors[i * 3 + 1] = view.getUint8(COLOR_OFFSET + 1) / 255;
      colors[i * 3 + 2] = view.getUint8(COLOR_OFFSET + 2) / 255;
    }

    return { positions, colors, sizes };
  }

  /**
   * Center and scale positions to fit in viewport
   */
  private centerAndScale(positions: Float32Array, count: number): void {
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }
    
    // Calculate center and scale
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    const maxSize = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const scale = maxSize > 0 ? DEFAULT_SCALE_FACTOR / maxSize : 1;
    
    // Apply transformation
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (positions[i * 3] - centerX) * scale;
      positions[i * 3 + 1] = (positions[i * 3 + 1] - centerY) * scale;
      positions[i * 3 + 2] = (positions[i * 3 + 2] - centerZ) * scale;
    }
    
    console.log(`SPLAT model processed: ${count} points, scale: ${scale.toFixed(3)}`);
  }
}

/**
 * Create a fallback model when loading fails
 */
export function createFallbackModel(): ModelLoadResult {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xff4444,
    transparent: true,
    opacity: 0.8
  });
  
  return { geometry, material };
} 