import { useState, useCallback, useRef, useEffect } from 'react';
import { MapStyle } from '../types/BloomReport';
import { getMapStyleById } from '../utils/mapStyles';
import L from 'leaflet';

interface UseMapStyleOptions {
  defaultStyleId?: string;
  mapInstance?: L.Map | null;
}

export const useMapStyle = ({ defaultStyleId = 'osm-standard', mapInstance }: UseMapStyleOptions) => {
  const [currentStyleId, setCurrentStyleId] = useState<string>(defaultStyleId);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const currentStyle = getMapStyleById(currentStyleId);

  const changeMapStyle = useCallback((style: MapStyle) => {
    if (!mapInstance) return;

    // Remove existing tile layer
    if (currentTileLayerRef.current) {
      mapInstance.removeLayer(currentTileLayerRef.current);
    }

    // Add new tile layer with smooth transition
    const newTileLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      maxZoom: style.maxZoom,
      className: 'map-tile-layer',
    });

    // Add with fade-in effect
    newTileLayer.addTo(mapInstance);
    currentTileLayerRef.current = newTileLayer;
    setCurrentStyleId(style.id);

    // Store preference in localStorage
    localStorage.setItem('bloomMap_preferredStyle', style.id);
  }, [mapInstance]);

  // Initialize with stored preference or default
  useEffect(() => {
    const storedStyleId = localStorage.getItem('bloomMap_preferredStyle');
    if (storedStyleId && getMapStyleById(storedStyleId)) {
      setCurrentStyleId(storedStyleId);
    }
  }, []);

  // Initialize tile layer when map instance is available
  useEffect(() => {
    if (mapInstance && currentStyle && !currentTileLayerRef.current) {
      const initialTileLayer = L.tileLayer(currentStyle.url, {
        attribution: currentStyle.attribution,
        maxZoom: currentStyle.maxZoom,
        className: 'map-tile-layer',
      });
      
      initialTileLayer.addTo(mapInstance);
      currentTileLayerRef.current = initialTileLayer;
    }
  }, [mapInstance, currentStyle]);

  return {
    currentStyleId,
    currentStyle,
    changeMapStyle,
    isLoading: !currentStyle,
  };
}; 