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

  // Helper to create marker icon HTML and size
  const getMarkerIcon = (report, isSelected, zoom) => {
    const baseSize = 40;
    const maxSize = 40;
    const scale = Math.pow(2, (zoom - 9) / 2); // 9 is default zoom
    const size = Math.min(Math.round(baseSize * scale), maxSize);
    // const flowerTags = report.flower_types.slice(0, 3).map(flower => 
    //   `<span class="flower-tag">${flower}</span>`
    // ).join('');
    const color = report.location.intensity > 0.7 ? '#ef4444' : report.location.intensity > 0.4 ? '#f97316' : '#eab308';
    return L.divIcon({
      html: `
        <div class="relative flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2">
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
          <div style="
            background-color: ${color};
            opacity: 0.7;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 18px;
          "></div>
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
