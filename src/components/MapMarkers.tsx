import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Location } from '../types/BloomReport';

interface MapMarkersProps {
  map: L.Map | null;
  locations: Location[];
  locationFlowersQueries: Array<{ data?: unknown; isLoading: boolean; error?: unknown }>;
  selectedLocation: Location | null;
  onLocationClick: (location: Location) => void;
  mapLoaded: boolean;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  locations,
  locationFlowersQueries,
  selectedLocation,
  onLocationClick,
  mapLoaded
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  // Helper function to calculate current month intensity based on location
  const calculateCurrentMonthIntensity = (location) => {
    // Use location intensity if available, otherwise default
    return location.intensity || 0.5;
  };

  // Color gradient from red (lowest intensity) to green (highest intensity)
  const getIntensityColor = (intensity) => {
    // Clamp intensity between 0 and 1
    const clampedIntensity = Math.max(0, Math.min(1, intensity));
    
    // Interpolate between red (0) and green (1)
    const red = Math.round(255 * (1 - clampedIntensity));
    const green = Math.round(255 * clampedIntensity);
    const blue = 0;
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Helper to create marker icon HTML and size
  const getMarkerIcon = useCallback((location, isSelected, zoom, isHovered = false) => {
    const baseSize = 24;
    const maxSize = 32;
    const scale = Math.pow(2, (zoom - 9) / 2); // 9 is default zoom
    let size = Math.min(Math.round(baseSize * scale), maxSize);
    
    // Make marker larger when hovered
    if (isHovered) {
      size = Math.min(size * 1.3, maxSize * 1.3);
    }
    
    const currentIntensity = calculateCurrentMonthIntensity(location);
    const color = getIntensityColor(currentIntensity);
    
    return L.divIcon({
      html: `
        <div class="relative flex flex-col items-center transition-transform duration-200 ${isHovered ? 'scale-110' : ''}">
          <svg width="200" height="80" viewBox="0 0 200 80" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); pointer-events: none;">
            <defs>
              <path id="arcPath" d="M 40,60 A 60,60 0 0,1 160,100" fill="none" />
            </defs>
            ${zoom >= 10 ? `
            <text font-size="15" font-weight="bold" fill="black" text-anchor="middle" font-family="Helvetica" stroke="white" stroke-width="3" paint-order="stroke">
              <textPath href="#arcPath" startOffset="50%">
                ${location.name}
              </textPath>
            </text>
            <text font-size="15" font-weight="bold" fill="black" text-anchor="middle" font-family="Helvetica">
              <textPath href="#arcPath" startOffset="50%">
                ${location.name}
              </textPath>
            </text>
            ` : ''}
          </svg>
          <svg width="${size}" height="${size}" style="margin-top: 18px;">
            <defs>
              <filter id="shadow-${location.id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
              </filter>
            </defs>
            <polygon 
              points="${size/2},${size} ${4},${4} ${size-4},${4}"
              fill="${color}"
              filter="url(#shadow-${location.id})"
              opacity="0.9"
            />
          </svg>
        </div>
      `,
      className: 'custom-bloom-marker',
      iconSize: [size, size + 40],
      iconAnchor: [size / 2, size + 18],
    });
  }, []);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    setCurrentZoom(map.getZoom());

    // Guard against undefined locations
    if (!locations || !Array.isArray(locations)) return;

    console.log('Updating markers with locations:', locations.length);

    // Helper to update all marker icons on zoom
    const updateMarkerIcons = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        const location = locations.find(l => l.id === id);
        if (location) {
          const isSelected = selectedLocation?.id === location.id;
          marker.setIcon(getMarkerIcon(location, isSelected, zoom, hoveredMarkerId === location.id));
        }
      });
    };

    // Initial marker creation
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    const zoom = map.getZoom();
    locations.forEach((location) => {
      const { latitude, longitude } = location;
      const isSelected = selectedLocation?.id === location.id;
      const markerIcon = getMarkerIcon(location, isSelected, zoom, hoveredMarkerId === location.id);
      const marker = L.marker([latitude, longitude], { icon: markerIcon })
        .addTo(map);

      // Add popup with location details
      const popupContent = `
        <div class="p-2 max-w-48">
          <div class="flex items-center space-x-2 mb-2">
            <span class="font-medium text-sm">${location.name}</span>
          </div>
          <p class="text-xs text-gray-600 mb-2 line-clamp-2">Location: ${location.name}</p>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-1">
              <span>📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        onLocationClick(location);
      });

      // Add hover handlers
      marker.on('mouseover', () => {
        setHoveredMarkerId(location.id);
      });

      marker.on('mouseout', () => {
        setHoveredMarkerId(null);
      });

      markersRef.current[location.id] = marker;
    });

    // Listen for zoom events to update marker size
    map.on('zoomend', updateMarkerIcons);
    return () => {
      map.off('zoomend', updateMarkerIcons);
    };
  }, [map, locations, selectedLocation, onLocationClick, mapLoaded, getMarkerIcon, hoveredMarkerId]);

  // Update marker icons when hover state changes
  useEffect(() => {
    if (!map || !mapLoaded) return;
    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const location = locations.find(l => l.id === id);
      if (location) {
        const isSelected = selectedLocation?.id === location.id;
        const isHovered = hoveredMarkerId === location.id;
        marker.setIcon(getMarkerIcon(location, isSelected, currentZoom, isHovered));
      }
    });
  }, [hoveredMarkerId, getMarkerIcon, selectedLocation, currentZoom, locations, map, mapLoaded]);

  return null; // This component doesn't render anything directly
};

export default MapMarkers;
