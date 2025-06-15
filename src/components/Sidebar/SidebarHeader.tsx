import React from 'react';
import { BloomReport } from '@/types/BloomReport';

interface SidebarHeaderProps {
  selectedLocation?: BloomReport['location'] | null;
  title?: string;
  sidebarMode?: 'location' | 'info';
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  selectedLocation, 
  title = 'כל הדיווחים',
  sidebarMode = 'location'
}) => {
  const handleWazeNavigation = () => {
    if (!selectedLocation) return;
    
    const wazeUrl = selectedLocation.waze_url || 
      `https://waze.com/ul?ll=${selectedLocation.latitude},${selectedLocation.longitude}`;
    
    window.open(wazeUrl, '_blank');
  };

  // Determine the display text based on mode and location
  const getDisplayText = () => {
    if (sidebarMode === 'info') {
      return 'מידע על הדף';
    }
    return selectedLocation ? selectedLocation.name : title;
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-purple-50">
      {selectedLocation && sidebarMode !== 'info' ? (
        <button
          onClick={handleWazeNavigation}
          className="focus:outline-none hover:scale-110 transition-transform"
          title="נווט עם Waze"
          aria-label="נווט למיקום עם Waze"
        >
          <img src="/waze.svg" alt="Waze" className="h-8 w-8" />
        </button>
      ) : (
        <div></div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 truncate text-right">
        {getDisplayText()}
      </h2>
    </div>
  );
}; 