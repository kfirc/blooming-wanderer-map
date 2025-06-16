import React from 'react';
import { Location } from '../../types/BloomReport';

interface WazeButtonProps {
  location: Location;
}

export const WazeButton: React.FC<WazeButtonProps> = ({ location }) => {
  const handleWazeNavigation = () => {
    const wazeUrl = location.waze_url || 
      `https://waze.com/ul?ll=${location.latitude},${location.longitude}`;
    
    window.open(wazeUrl, '_blank');
  };

  return (
    <button
      onClick={handleWazeNavigation}
      className="focus:outline-none hover:scale-110 transition-transform"
      title="נווט עם Waze"
      aria-label="נווט למיקום עם Waze"
    >
      <img src="/waze.svg" alt="Waze" className="h-8 w-8" />
    </button>
  );
}; 