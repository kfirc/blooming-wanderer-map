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

    // Add new tile layer with advanced preloading configuration
    const newTileLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      maxZoom: style.maxZoom,
      className: 'map-tile-layer',
      // Advanced buffering options for extensive preloading
      keepBuffer: 8, // Keep 8 tiles around visible area (user's setting)
      updateWhenIdle: false, // Load tiles during panning for smoother experience
      updateWhenZooming: true, // Continue updating during zoom
      // Additional preloading optimizations
      updateInterval: 0, // Remove throttling for immediate tile requests (user disabled this)
      crossOrigin: true, // Enable CORS for better caching
      // Performance and caching enhancements
      detectRetina: true, // Auto-detect retina displays for higher quality tiles
      // Tile loading strategies
      zIndex: 1, // Ensure proper layering
      opacity: 1, // Full opacity for immediate visibility
      // Ensure tiles load even outside immediate bounds
      bounds: undefined, // Don't restrict tile loading to specific bounds
    });

    // Add event listeners for aggressive preloading
    newTileLayer.on('tileload', () => {
      // Trigger additional tile loading when tiles complete
      setTimeout(() => {
        if (mapInstance && mapInstance.getZoom) {
          mapInstance.fire('moveend'); // Trigger additional tile checks
        }
      }, 50);
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
        // Advanced buffering options for extensive preloading
        keepBuffer: 8, // Keep 8 tiles around visible area (user's setting)
        updateWhenIdle: false, // Load tiles during panning for smoother experience
        updateWhenZooming: true, // Continue updating during zoom
        // Additional preloading optimizations
        updateInterval: 0, // Remove throttling for immediate tile requests (user disabled this)
        crossOrigin: true, // Enable CORS for better caching
        // Performance and caching enhancements
        detectRetina: true, // Auto-detect retina displays for higher quality tiles
        // Tile loading strategies
        zIndex: 1, // Ensure proper layering
        opacity: 1, // Full opacity for immediate visibility
        // Ensure tiles load even outside immediate bounds
        bounds: undefined, // Don't restrict tile loading to specific bounds
      });

      // Add event listeners for aggressive preloading
      initialTileLayer.on('tileload', () => {
        // Trigger additional tile loading when tiles complete
        setTimeout(() => {
          if (mapInstance && mapInstance.getZoom) {
            mapInstance.fire('moveend'); // Trigger additional tile checks
          }
        }, 50);
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