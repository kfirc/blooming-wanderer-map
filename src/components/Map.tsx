
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';
import { MapPin, Zap, Camera, Flower2, Facebook, User } from 'lucide-react';
import { BloomReport } from '../types/BloomReport';
import { Button } from '@/components/ui/button';

interface MapProps {
  reports: BloomReport[];
  onLocationClick: (report: BloomReport) => void;
  selectedLocation: BloomReport | null;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map: React.FC<MapProps> = ({ reports, onLocationClick, selectedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    try {
      // Initialize Leaflet map centered on Israel
      leafletMap.current = L.map(mapRef.current, {
        center: [31.5, 34.75],
        zoom: 8,
        zoomControl: false,
        attributionControl: false
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19
      }).addTo(leafletMap.current);

      // Add zoom control to top-left
      L.control.zoom({
        position: 'topleft'
      }).addTo(leafletMap.current);

      // Initialize heatmap layer
      heatmapLayerRef.current = L.layerGroup().addTo(leafletMap.current);

      // Set map as loaded
      setMapLoaded(true);

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!leafletMap.current || !heatmapLayerRef.current || !mapLoaded) return;

    console.log('Updating markers with reports:', reports.length);

    // Clear existing markers and heatmap
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    heatmapLayerRef.current.clearLayers();

    reports.forEach((report) => {
      const { latitude, longitude } = report.location;

      // Create heatmap circle
      const intensity = report.location.intensity;
      const radius = Math.max(50, intensity * 200);
      const color = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f97316' : '#eab308';
      
      const heatCircle = L.circle([latitude, longitude], {
        radius: radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.2
      });
      
      heatmapLayerRef.current!.addLayer(heatCircle);

      // Create flower tags for this location
      const flowerTags = report.flower_types.slice(0, 3).map(flower => 
        `<span class="flower-tag">${flower}</span>`
      ).join('');

      // Create custom marker icon with flower tags
      const isSelected = selectedLocation?.id === report.id;
      const markerIcon = L.divIcon({
        html: `
          <div class="relative transform -translate-x-1/2 -translate-y-1/2">
            <div class="w-10 h-10 rounded-full border-3 shadow-lg flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-orange-500 border-white scale-125' 
                : 'bg-white border-purple-400 hover:border-purple-600'
            }" style="background-color: ${color}; border-color: white;">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            ${flowerTags ? `<div class="flower-tags-container">${flowerTags}</div>` : ''}
          </div>
        `,
        className: 'custom-bloom-marker',
        iconSize: [40, 60],
        iconAnchor: [20, 50],
      });

      // Create marker
      const marker = L.marker([latitude, longitude], { icon: markerIcon })
        .addTo(leafletMap.current!);

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
  }, [reports, selectedLocation, onLocationClick, mapLoaded]);

  return (
    <div className="flex-1 relative">
      {/* Leaflet Map Container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 z-10"
        style={{ height: '100%', width: '100%' }}
      />

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">טוען מפה...</div>
        </div>
      )}

      {/* Floating Header Elements */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
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

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-3">
        {/* Facebook Login */}
        <Button 
          size="sm"
          className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Facebook className="h-5 w-5 text-white" />
        </Button>
        
        {/* Profile Button */}
        <Button 
          size="sm" 
          variant="secondary"
          className="rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Map;
