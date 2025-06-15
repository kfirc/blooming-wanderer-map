import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';
import { Location } from '../types/BloomReport';
import MapMarkers from './map/MapMarkers';
import MapHeatmap from './MapHeatmap';
import MapHeader from './MapHeader';
import MapActionButtons from './MapActionButtons';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface MapProps {
  locations: Location[];
  locationFlowersQueries: Array<{ data?: unknown; isLoading: boolean; error?: unknown }>;
  onLocationClick: (location: Location) => void;
  selectedLocation: Location | null;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map: React.FC<MapProps> = ({ locations, locationFlowersQueries, onLocationClick, selectedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Enable smooth keyboard navigation with diagonal movement
  useKeyboardNavigation({ map: leafletMap.current, mapLoaded });

  // Initialize map
  useEffect(() => {
    console.log('Map effect running, mapRef.current:', !!mapRef.current, 'leafletMap.current:', !!leafletMap.current);
    
    if (!mapRef.current || leafletMap.current) return;

    // Initialize Leaflet map centered on Israel (more accurate center)
    leafletMap.current = L.map(mapRef.current, {
      center: [32, 35], // Geographic center of Israel
      zoom: 9,
      zoomControl: false,
      attributionControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19
    }).addTo(leafletMap.current);

    // Set map as loaded
    setMapLoaded(true);
    setMapError(null);

    return () => {
      if (leafletMap.current) {
        console.log('Cleaning up map...');
        leafletMap.current.remove();
        leafletMap.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Add keyboard event handling for custom zoom (separate from navigation)
  useEffect(() => {
    if (!leafletMap.current) return;

    const handleZoomKeys = (e: KeyboardEvent) => {
      // Only handle zoom shortcuts, let useKeyboardNavigation handle arrow keys
      const isZoomKey = (e.metaKey || e.ctrlKey) && (
        e.key === '+' || e.key === '=' || // Plus key variations
        e.key === '-' || e.key === '_' || // Minus key variations
        e.code === 'Equal' || e.code === 'Minus' || // Key codes
        e.code === 'NumpadAdd' || e.code === 'NumpadSubtract' // Numpad keys
      );

      if (isZoomKey && leafletMap.current) {
        e.preventDefault(); // Prevent browser zoom
        e.stopPropagation();

        const currentZoom = leafletMap.current.getZoom();
        const zoomStep = 1;

        if (e.key === '+' || e.key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd') {
          // Zoom in
          const newZoom = Math.min(currentZoom + zoomStep, leafletMap.current.getMaxZoom());
          leafletMap.current.setZoom(newZoom);
        } else if (e.key === '-' || e.key === '_' || e.code === 'Minus' || e.code === 'NumpadSubtract') {
          // Zoom out
          const newZoom = Math.max(currentZoom - zoomStep, leafletMap.current.getMinZoom());
          leafletMap.current.setZoom(newZoom);
        }
      }
    };

    // Add event listener with passive: false to allow preventDefault
    document.addEventListener('keydown', handleZoomKeys, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleZoomKeys);
    };
  }, [mapLoaded]);

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">
          <p className="mb-2">שגיאה בטעינת המפה</p>
          <p className="text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Leaflet Map Container */}
      <div 
        ref={mapRef}
        className="h-full w-full z-10"
        style={{ minHeight: '400px' }}
      />

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">טוען מפה...</div>
        </div>
      )}

      {/* Map Components */}
      <MapHeatmap 
        map={leafletMap.current}
        locations={locations}
        locationFlowersQueries={locationFlowersQueries}
        mapLoaded={mapLoaded}
      />
      
      <MapMarkers 
        map={leafletMap.current}
        locations={locations}
        locationFlowersQueries={locationFlowersQueries}
        selectedLocation={selectedLocation}
        onLocationClick={onLocationClick}
        mapLoaded={mapLoaded}
      />

      {/* UI Components */}
      <MapHeader />
      <MapActionButtons />
    </div>
  );
};

export default Map;
