import React from 'react';

const MapHeader: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 z-30 flex items-center space-x-3">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <img src="/title.jpg" alt="Bloom Israel" className="h-10 w-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-green-700 to-purple-700 bg-clip-text text-transparent leading-tight flex items-end gap-1">
            Bloom <span className="text-xs align-baseline">IL</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapHeader;
