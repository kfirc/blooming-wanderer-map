import React, { useEffect, useRef } from 'react';
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

  // Helper to create marker icon HTML and size
  const getMarkerIcon = (report, isSelected, zoom) => {
    const baseSize = 40;
    const maxSize = 40;
    const scale = Math.pow(2, (zoom - 9) / 2); // 9 is default zoom
    const size = Math.min(Math.round(baseSize * scale), maxSize);
    const flowerTags = report.flower_types.slice(0, 3).map(flower => 
      `<span class="flower-tag">${flower}</span>`
    ).join('');
    const color = report.location.intensity > 0.7 ? '#ef4444' : report.location.intensity > 0.4 ? '#f97316' : '#eab308';
    return L.divIcon({
      html: `
        <div class="relative transform -translate-x-1/2 -translate-y-1/2">
          <div class="rounded-full border-3 shadow-lg flex items-center justify-center transition-all duration-200 ${
            isSelected 
              ? 'bg-orange-500 border-white scale-125' 
              : 'bg-white border-purple-400 hover:border-purple-600'
          }" style="background-color: ${color}; border-color: white; width: ${size}px; height: ${size}px;">
            <svg class="text-white" width="${Math.round(size/2)}" height="${Math.round(size/2)}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          ${flowerTags ? `<div class="flower-tags-container">${flowerTags}</div>` : ''}
        </div>
      `,
      className: 'custom-bloom-marker',
      iconSize: [size, size + 20],
      iconAnchor: [size / 2, size],
    });
  };

  useEffect(() => {
    if (!map || !mapLoaded) return;

    console.log('Updating markers with reports:', reports.length);

    // Helper to update all marker icons on zoom
    const updateMarkerIcons = () => {
      const zoom = map.getZoom();
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
