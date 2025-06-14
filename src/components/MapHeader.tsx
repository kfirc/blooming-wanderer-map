
import React from 'react';
import { Flower2 } from 'lucide-react';

const MapHeader: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 z-30 flex items-center space-x-3">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <div className="p-2 bg-gradient-to-r from-green-500 to-purple-500 rounded-full">
          <Flower2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-green-700 to-purple-700 bg-clip-text text-transparent">
            פריחת ישראל
          </h1>
        </div>
      </div>
    </div>
  );
};

export default MapHeader;
