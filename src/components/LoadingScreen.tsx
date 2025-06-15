import React, { useRef, useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  loadingComplete?: boolean;
  startTransition?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "",
  loadingComplete = false,
  startTransition = false
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const [shouldStretch, setShouldStretch] = useState(false);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle || !loadingComplete) return;

    const handleAnimationIteration = () => {
      // Snake has completed one full rotation, now trigger stretch
      setShouldStretch(true);
    };

    circle.addEventListener('animationiteration', handleAnimationIteration);
    
    return () => {
      circle.removeEventListener('animationiteration', handleAnimationIteration);
    };
  }, [loadingComplete]);
  return (
    <div className={`loading-screen ${startTransition ? 'transition-active' : ''}`}>
      <div className="loading-container">
        {/* Animated Logo with Progressive Circle */}
        <div className={`logo-container ${startTransition ? 'move-to-header' : ''}`}>
          <div className="progressive-circle-container">
            <svg 
              className="progressive-circle-svg" 
              width="128" 
              height="128" 
              viewBox="0 0 128 128"
            >
              {/* Background circle for reference */}
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="rgba(124, 58, 237, 0.1)"
                strokeWidth="2"
              />
              
              {/* Progressive drawing circle */}
              <circle
                ref={circleRef}
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="60 317" // Snake pattern: 60px dash + 317px gap = 377px total
                strokeDashoffset="0"
                className={`progressive-circle ${loadingComplete ? 'snake-complete' : ''} ${shouldStretch ? 'stretch-complete' : ''}`}
                transform="rotate(-90 64 64)" // Start from top
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
            
            <img 
              src="/title.jpg" 
              alt="Bloom Israel" 
              className="logo-image"
            />
          </div>
        </div>
        
        {/* Title */}
        <div className={`loading-title ${startTransition ? 'fade-out' : ''}`}>
          <span className="title-text">
            Bloom <span className="title-il">IL</span>
          </span>
        </div>
        
        {/* If message is provided, show it */}
        {message && (
          <div className="loading-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen; 