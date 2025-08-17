import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from './components/ModelViewer';
import CheckpointControls from './components/CheckpointControls';
import FormatToggle from './components/FormatToggle';
import './App.css';

// Types
export interface Checkpoint {
  id: number;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

// Constants
const CHECKPOINTS: Checkpoint[] = [
  {
    id: 1,
    name: "Front View",
    position: [5, 0, 0],
    target: [0, 0, 0]
  },
  {
    id: 2,
    name: "Side View",
    position: [0, 0, 5],
    target: [0, 0, 0]
   
  },
  {
    id: 3,
    name: "Top View",
    position: [0, 5, 0],
    target: [0, 0, 0]
  },
  {
    id: 4,
    name: "Isometric View",
    position: [3, 3, 3],
    target: [0, 0, 0]
  }
];

const CAMERA_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 1000
};

const LIGHTING_CONFIG = {
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  directionalSecondaryIntensity: 0.5
};

function App() {
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [modelFormat, setModelFormat] = useState<'ply' | 'splat'>('ply');
  const [isLoading, setIsLoading] = useState(false);

  const handlePrevCheckpoint = () => {
    setCurrentCheckpoint(prev => 
      prev === 0 ? CHECKPOINTS.length - 1 : prev - 1
    );
  };

  const handleNextCheckpoint = () => {
    setCurrentCheckpoint(prev => 
      prev === CHECKPOINTS.length - 1 ? 0 : prev + 1
    );
  };

  const handleCheckpointSelect = (index: number) => {
    if (index >= 0 && index < CHECKPOINTS.length) {
      setCurrentCheckpoint(index);
    }
  };

  const handleFormatChange = (format: 'ply' | 'splat') => {
    setModelFormat(format);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Model Viewer</h1>
          </div>
          <FormatToggle 
            currentFormat={modelFormat}
            onFormatChange={handleFormatChange}
          />
        </div>
      </header>
      
      <div className="viewer-container">
        <Canvas
          camera={{ 
            position: CHECKPOINTS[currentCheckpoint].position, 
            fov: CAMERA_CONFIG.fov,
            near: CAMERA_CONFIG.near,
            far: CAMERA_CONFIG.far
          }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={LIGHTING_CONFIG.ambientIntensity} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={LIGHTING_CONFIG.directionalIntensity} 
          />
          <directionalLight 
            position={[-10, -10, -5]} 
            intensity={LIGHTING_CONFIG.directionalSecondaryIntensity} 
          />
          
          <ModelViewer 
            format={modelFormat}
            checkpoint={CHECKPOINTS[currentCheckpoint]}
            onLoadingChange={setIsLoading}
          />
          
          <OrbitControls 
            target={CHECKPOINTS[currentCheckpoint].target}
            enableDamping={true}
            dampingFactor={0.05}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
          />
        </Canvas>
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading model...</p>
          </div>
        )}
      </div>
      
      <CheckpointControls
        checkpoints={CHECKPOINTS}
        currentCheckpoint={currentCheckpoint}
        onPrev={handlePrevCheckpoint}
        onNext={handleNextCheckpoint}
        onSelect={handleCheckpointSelect}
      />
    </div>
  );
}

export default App;
