import React from 'react';
import type { Checkpoint } from '../App';
import './CheckpointControls.css';

interface CheckpointControlsProps {
  checkpoints: Checkpoint[];
  currentCheckpoint: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

const CheckpointControls: React.FC<CheckpointControlsProps> = ({
  checkpoints,
  currentCheckpoint,
  onPrev,
  onNext,
  onSelect,
}) => {
  return (
    <div className="checkpoint-controls">
      <div className="navigation-buttons">
        <button 
          className="nav-button prev-button" 
          onClick={onPrev}
          aria-label="Previous checkpoint"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          PREV
        </button>
        
        <div className="checkpoint-info">
          <span className="checkpoint-counter">
            {currentCheckpoint + 1} of {checkpoints.length}
          </span>
          <span className="checkpoint-name">
            {checkpoints[currentCheckpoint].name}
          </span>
        </div>
        
        <button 
          className="nav-button next-button" 
          onClick={onNext}
          aria-label="Next checkpoint"
        >
          NEXT
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          </svg>
        </button>
      </div>
      
      <div className="checkpoint-list">
        <h3>Checkpoints</h3>
        <div className="checkpoint-items">
          {checkpoints.map((checkpoint, index) => (
            <button
              key={checkpoint.id}
              className={`checkpoint-item ${index === currentCheckpoint ? 'active' : ''}`}
              onClick={() => onSelect(index)}
              aria-label={`Go to ${checkpoint.name}`}
            >
              <span className="checkpoint-number">{checkpoint.id}</span>
              <span className="checkpoint-label">{checkpoint.name}</span>
              {index === currentCheckpoint && (
                <span className="active-indicator">●</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckpointControls; 