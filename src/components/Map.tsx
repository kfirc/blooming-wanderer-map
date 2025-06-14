
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Zap, Camera } from 'lucide-react';
import { BloomReport } from '../types/BloomReport';

interface MapProps {
  reports: BloomReport[];
  onLocationClick: (report: BloomReport) => void;
  selectedLocation: BloomReport | null;
}

const Map: React.FC<MapProps> = ({ reports, onLocationClick, selectedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 31.5, lng: 34.75 }); // Israel center
  const [zoom, setZoom] = useState(8);

  // Convert lat/lng to pixel coordinates (simplified)
  const coordinateToPixel = (lat: number, lng: number) => {
    const mapBounds = mapRef.current?.getBoundingClientRect();
    if (!mapBounds) return { x: 0, y: 0 };

    // Simple mercator-like projection for Israel
    const x = ((lng - 34.2) / (35.5 - 34.2)) * mapBounds.width;
    const y = ((32.5 - lat) / (32.5 - 31.0)) * mapBounds.height;
    
    return { x: Math.max(0, Math.min(x, mapBounds.width)), y: Math.max(0, Math.min(y, mapBounds.height)) };
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            linear-gradient(-45deg, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)
          `,
        }}
      >
        {/* Heatmap Overlay */}
        <div className="absolute inset-0">
          {reports.map((report) => {
            const pos = coordinateToPixel(report.location.latitude, report.location.longitude);
            return (
              <div
                key={`heatmap-${report.id}`}
                className="absolute pointer-events-none"
                style={{
                  left: pos.x - 60,
                  top: pos.y - 60,
                  width: 120,
                  height: 120,
                }}
              >
                <div
                  className="w-full h-full rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, 
                      rgba(249, 115, 22, ${report.location.intensity * 0.3}) 0%, 
                      rgba(168, 85, 247, ${report.location.intensity * 0.2}) 40%, 
                      transparent 70%)`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Location Pins */}
        {reports.map((report) => {
          const pos = coordinateToPixel(report.location.latitude, report.location.longitude);
          const isSelected = selectedLocation?.id === report.id;
          
          return (
            <div
              key={report.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: pos.x,
                top: pos.y,
                zIndex: isSelected ? 50 : 20,
              }}
              onClick={() => onLocationClick(report)}
            >
              {/* Pin */}
              <div className={`relative transition-all duration-200 ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>
                <div className={`w-8 h-8 rounded-full border-3 shadow-lg flex items-center justify-center ${
                  isSelected 
                    ? 'bg-orange-500 border-white' 
                    : 'bg-white border-purple-400 group-hover:border-purple-600'
                }`}>
                  <MapPin className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                </div>
                
                {/* Intensity indicator */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  report.location.intensity > 0.7 ? 'bg-red-500' :
                  report.location.intensity > 0.4 ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
              </div>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white rounded-lg shadow-lg p-3 min-w-48 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <img 
                      src={report.user.profile_photo_url || `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=24&h=24&fit=crop&crop=face`} 
                      alt={report.user.display_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-sm">{report.user.display_name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Camera className="h-3 w-3" />
                      <span>{report.images.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>{report.likes_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 1, 12))}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-bold text-gray-700">+</span>
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 1, 6))}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-bold text-gray-700">−</span>
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold text-sm mb-3 text-gray-800">עוצמת פריחה</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">גבוהה</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600">בינונית</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">נמוכה</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
