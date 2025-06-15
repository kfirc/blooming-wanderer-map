import React from 'react';
import { BloomReport } from '@/types/BloomReport';

interface SidebarHeaderProps {
  selectedLocation?: BloomReport['location'] | null;
  title?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  selectedLocation, 
  title = 'דיווחי פריחה' 
}) => {
  const handleWazeNavigation = () => {
    if (!selectedLocation) return;
    
    const wazeUrl = selectedLocation.waze_url || 
      `https://waze.com/ul?ll=${selectedLocation.latitude},${selectedLocation.longitude}`;
    
    window.open(wazeUrl, '_blank');
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-purple-50">
      <h2 className="text-xl font-bold text-gray-800 truncate">
        {selectedLocation ? selectedLocation.name : title}
      </h2>
      
      {selectedLocation && (
        <button
          onClick={handleWazeNavigation}
          className="focus:outline-none hover:scale-110 transition-transform ml-4"
          title="נווט עם Waze"
          aria-label="נווט למיקום עם Waze"
        >
          <img src="/waze.svg" alt="Waze" className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}; 