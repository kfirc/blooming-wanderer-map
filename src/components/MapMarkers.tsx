import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BloomReport } from '../types/BloomReport';

interface MapMarkersProps {
  map: L.Map | null;
  reports: BloomReport[];
  selectedLocation: BloomReport | null;
  onLocationClick: (report: BloomReport) => void;
  mapLoaded: boolean;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  reports,
  selectedLocation,
  onLocationClick,
  mapLoaded
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [currentZoom, setCurrentZoom] = useState<number>(13);

  // Helper function to calculate current month intensity based on flowers
  const calculateCurrentMonthIntensity = (report) => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    if (!report.flowers || report.flowers.length === 0) {
      return 0.1; // Default low intensity if no flower data
    }
    
    let totalIntensity = 0;
    let flowerCount = 0;
    
    report.flowers.forEach(flower => {
      if (flower.bloom_months && flower.bloom_months.includes(currentMonth)) {
        // Flower is in bloom this month
        const intensity = flower.intensity || 0.5; // Default to medium if no intensity data
        totalIntensity += intensity;
        flowerCount++;
      }
    });
    
    if (flowerCount === 0) {
      // No flowers in bloom this month, use reduced intensity
      return 0.2;
    }
    
    // Average intensity of blooming flowers
    return Math.min(1, totalIntensity / flowerCount);
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
  const getMarkerIcon = (report, isSelected, zoom) => {
    const baseSize = 24;
    const maxSize = 32;
    const scale = Math.pow(2, (zoom - 9) / 2); // 9 is default zoom
    const size = Math.min(Math.round(baseSize * scale), maxSize);
    
    const currentIntensity = calculateCurrentMonthIntensity(report);
    const color = getIntensityColor(currentIntensity);
    
    return L.divIcon({
      html: `
        <div class="relative flex flex-col items-center transform -translate-x-1/2 -translate-y-full">
          <svg width="200" height="80" viewBox="0 0 200 80" style="position: absolute; top: -20px; left: 15%; transform: translateX(-50%); pointer-events: none;">
            <defs>
              <path id="arcPath" d="M 40,60 A 60,60 0 0,1 160,100" fill="none" />
            </defs>
            ${zoom >= 10 ? `
            <text font-size="15" font-weight="bold" fill="black" text-anchor="middle" font-family="Helvetica">
              <textPath href="#arcPath" startOffset="50%">
                ${report.location.name}
              </textPath>
            </text>
            ` : ''}
          </svg>
          <svg width="${size}" height="${size}" style="margin-top: 18px;">
            <defs>
              <filter id="shadow-${report.id}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
              </filter>
            </defs>
            <polygon 
              points="${size/2},${size-4} ${4},${4} ${size-4},${4}"
              fill="${color}"
              filter="url(#shadow-${report.id})"
              opacity="0.9"
            />
          </svg>
        </div>
      `,
      className: 'custom-bloom-marker',
      iconSize: [size, size + 40],
      iconAnchor: [size / 2, size],
    });
  };

  useEffect(() => {
    if (!map || !mapLoaded) return;

    setCurrentZoom(map.getZoom());

    console.log('Updating markers with reports:', reports.length);

    // Helper to update all marker icons on zoom
    const updateMarkerIcons = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        const report = reports.find(r => r.id === id);
        if (report) {
          const isSelected = selectedLocation?.id === report.id;
          marker.setIcon(getMarkerIcon(report, isSelected, zoom));
        }
      });
    };

    // Initial marker creation
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    const zoom = map.getZoom();
    reports.forEach((report) => {
      const { latitude, longitude } = report.location;
      const isSelected = selectedLocation?.id === report.id;
      const markerIcon = getMarkerIcon(report, isSelected, zoom);
      const marker = L.marker([latitude, longitude], { icon: markerIcon })
        .addTo(map);

      // Add popup with report details
      const popupContent = `
        <div class="p-2 max-w-48">
          <div class="flex items-center space-x-2 mb-2">
            <img 
              src="${report.user.profile_photo_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=24&h=24&fit=crop&crop=face'}" 
              alt="${report.user.display_name}"
              class="w-6 h-6 rounded-full"
            />
            <span class="font-medium text-sm">${report.user.display_name}</span>
          </div>
          <p class="text-xs text-gray-600 mb-2 line-clamp-2">${report.description || ''}</p>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-1">
              <span>📸 ${report.images.length}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span>⚡ ${report.likes_count}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        onLocationClick(report);
      });

      markersRef.current[report.id] = marker;
    });

    // Listen for zoom events to update marker size
    map.on('zoomend', updateMarkerIcons);
    return () => {
      map.off('zoomend', updateMarkerIcons);
    };
  }, [map, reports, selectedLocation, onLocationClick, mapLoaded]);

  return null; // This component doesn't render anything directly
};

export default MapMarkers;
