
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BloomReport } from '../types/BloomReport';

interface MapHeatmapProps {
  map: L.Map | null;
  reports: BloomReport[];
  mapLoaded: boolean;
}

const MapHeatmap: React.FC<MapHeatmapProps> = ({ map, reports, mapLoaded }) => {
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Initialize heatmap layer if not exists
    if (!heatmapLayerRef.current) {
      heatmapLayerRef.current = L.layerGroup().addTo(map);
    }

    // Clear existing heatmap
    heatmapLayerRef.current.clearLayers();

    reports.forEach((report) => {
      const { latitude, longitude } = report.location;
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
    });
  }, [map, reports, mapLoaded]);

  return null; // This component doesn't render anything directly
};

export default MapHeatmap;
