import React, { useState } from 'react';
import './ProgressiveCircleDemo.css';

interface ProgressiveCircleDemoProps {
  size?: number;
  duration?: number;
}

const ProgressiveCircleDemo: React.FC<ProgressiveCircleDemoProps> = ({ 
  size = 200, 
  duration = 4 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const radius = (size - 8) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  
  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration * 1000);
  };

  return (
    <div className="progressive-circle-demo">
      <h3>Progressive Circle Drawing Animation</h3>
      
      <div className="demo-container">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="progressive-svg"
        >
          {/* Background circle for reference */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
            className="background-circle"
          />
          
          {/* Progressive drawing circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className={`progressive-circle ${isAnimating ? 'animating' : ''}`}
            style={{
              '--circumference': circumference,
              '--duration': `${duration}s`
            } as React.CSSProperties}
          />
          
          {/* Starting point indicator */}
          <circle
            cx={size / 2}
            cy={size / 2 - radius}
            r="4"
            fill="#16a34a"
            className={`start-point ${isAnimating ? 'pulsing' : ''}`}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="progress-phases">
          <div className="phase-indicator">
            <span className="phase-dot"></span>
            <span>Start Point</span>
          </div>
          <div className="phase-indicator">
            <span className="phase-dot" style={{backgroundColor: '#feca57'}}></span>
            <span>Growing Arc (0-25%)</span>
          </div>
          <div className="phase-indicator">
            <span className="phase-dot" style={{backgroundColor: '#48dbfb'}}></span>
            <span>Half Circle (25-50%)</span>
          </div>
          <div className="phase-indicator">
            <span className="phase-dot" style={{backgroundColor: '#5f27cd'}}></span>
            <span>Three-Quarter (50-75%)</span>
          </div>
          <div className="phase-indicator">
            <span className="phase-dot" style={{backgroundColor: '#00d2d3'}}></span>
            <span>Complete Circle (75-100%)</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleStart}
        disabled={isAnimating}
        className="demo-button"
      >
        {isAnimating ? 'Drawing...' : 'Start Animation'}
      </button>
      
      <div className="description">
        <p>This animation demonstrates how a line can grow progressively from a single point to form a complete circle.</p>
        <p>The technique uses <code>stroke-dasharray</code> and <code>stroke-dashoffset</code> to control the visible portion of the circle.</p>
      </div>
    </div>
  );
};

export default ProgressiveCircleDemo; 