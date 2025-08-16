import React from 'react';
import './FormatToggle.css';

interface FormatToggleProps {
  currentFormat: 'ply' | 'splat';
  onFormatChange: (format: 'ply' | 'splat') => void;
}

const FormatToggle: React.FC<FormatToggleProps> = ({ currentFormat, onFormatChange }) => {
  return (
    <div className="format-toggle">
      <span className="toggle-label">Model Format:</span>
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${currentFormat === 'ply' ? 'active' : ''}`}
          onClick={() => onFormatChange('ply')}
          aria-label="Switch to PLY format"
        >
          PLY
        </button>
        <button
          className={`toggle-button ${currentFormat === 'splat' ? 'active' : ''}`}
          onClick={() => onFormatChange('splat')}
          aria-label="Switch to SPLAT format"
        >
          SPLAT
        </button>
      </div>
    </div>
  );
};

export default FormatToggle; 