
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';
import { MapPin, Zap, Camera } from 'lucide-react';
import { BloomReport } from '../types/BloomReport';

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

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Initialize Leaflet map centered on Israel
    leafletMap.current = L.map(mapRef.current, {
      center: [31.5, 34.75],
      zoom: 8,
      zoomControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(leafletMap.current);

    // Add zoom control to top-left
    L.control.zoom({
      position: 'topleft'
    }).addTo(leafletMap.current);

    // Initialize heatmap layer
    heatmapLayerRef.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!leafletMap.current || !heatmapLayerRef.current) return;

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

      // Create custom marker icon
      const isSelected = selectedLocation?.id === report.id;
      const markerIcon = L.divIcon({
        html: `
          <div class="relative transform -translate-x-1/2 -translate-y-1/2">
            <div class="w-8 h-8 rounded-full border-3 shadow-lg flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-orange-500 border-white scale-125' 
                : 'bg-white border-purple-400 hover:border-purple-600'
            }">
              <svg class="h-4 w-4 ${isSelected ? 'text-white' : 'text-purple-600'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              intensity > 0.7 ? 'bg-red-500' :
              intensity > 0.4 ? 'bg-orange-500' : 'bg-yellow-500'
            }"></div>
          </div>
        `,
        className: 'custom-bloom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
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
  }, [reports, selectedLocation, onLocationClick]);

  // Update selected marker style
  useEffect(() => {
    if (!selectedLocation) return;

    // Update all markers to show selected state
    Object.entries(markersRef.current).forEach(([reportId, marker]) => {
      const isSelected = reportId === selectedLocation.id;
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      const intensity = report.location.intensity;
      const markerIcon = L.divIcon({
        html: `
          <div class="relative transform -translate-x-1/2 -translate-y-1/2">
            <div class="w-8 h-8 rounded-full border-3 shadow-lg flex items-center justify-center transition-all duration-200 ${
              isSelected 
                ? 'bg-orange-500 border-white scale-125' 
                : 'bg-white border-purple-400 hover:border-purple-600'
            }">
              <svg class="h-4 w-4 ${isSelected ? 'text-white' : 'text-purple-600'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              intensity > 0.7 ? 'bg-red-500' :
              intensity > 0.4 ? 'bg-orange-500' : 'bg-yellow-500'
            }"></div>
          </div>
        `,
        className: 'custom-bloom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      marker.setIcon(markerIcon);
    });
  }, [selectedLocation, reports]);

  return (
    <div className="flex-1 relative">
      {/* Leaflet Map Container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 z-10"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-20">
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

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/75 px-2 py-1 rounded z-20">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default Map;
