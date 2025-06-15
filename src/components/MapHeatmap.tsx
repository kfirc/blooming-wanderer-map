
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Location } from '../types/BloomReport';

interface MapHeatmapProps {
  map: L.Map | null;
  locations: Location[];
  locationFlowersQueries: Array<{ data?: any; isLoading: boolean; error?: any }>;
  mapLoaded: boolean;
}

const MapHeatmap: React.FC<MapHeatmapProps> = ({ map, locations, locationFlowersQueries, mapLoaded }) => {
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Initialize heatmap layer if not exists
    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = L.layerGroup().addTo(map);
    }

    // Clear existing heatmap
    heatmapLayerRef.current.clearLayers();

    // Guard against undefined locations
    if (!locations || !Array.isArray(locations)) return;

    locations.forEach((location) => {
      const { latitude, longitude } = location;
      const intensity = location.intensity || 0.5; // Default intensity if not provided
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
    });
  }, [map, locations, locationFlowersQueries, mapLoaded]);

  return null; // This component doesn't render anything directly
};

export default MapHeatmap;
