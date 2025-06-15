import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Location } from '../types/BloomReport';
import { createMarkerIcon } from '../components/map/MarkerIcon';
import { createPopupContent } from '../utils/markerUtils';
import { useMarkerScaling } from './useMarkerScaling';

interface UseMapMarkersProps {
  map: L.Map | null;
  locations: Location[];
  selectedLocation: Location | null;
  onLocationClick: (location: Location) => void;
  mapLoaded: boolean;
}

export const useMapMarkers = ({
  map,
  locations,
  selectedLocation,
  onLocationClick,
  mapLoaded
}: UseMapMarkersProps) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const { calculateMarkerSize } = useMarkerScaling();

  // Create marker icon with current state
  const getMarkerIcon = useCallback((location: Location, zoom: number, isHovered: boolean = false) => {
    const size = calculateMarkerSize(zoom, isHovered);
    return createMarkerIcon({ location, size, zoom, isHovered });
  }, [calculateMarkerSize]);

  // Update all marker icons
  const updateMarkerIcons = useCallback((targetZoom?: number) => {
    const zoom = targetZoom ?? map?.getZoom() ?? currentZoom;
    setCurrentZoom(zoom);
    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const location = locations.find(l => l.id === id);
      if (location) {
        const isHovered = hoveredMarkerId === location.id;
        marker.setIcon(getMarkerIcon(location, zoom, isHovered));
      }
    });
  }, [map, currentZoom, locations, hoveredMarkerId, getMarkerIcon]);

  // Create individual marker
  const createMarker = useCallback((location: Location, zoom: number) => {
    const { latitude, longitude } = location;
    const isHovered = hoveredMarkerId === location.id;
    const markerIcon = getMarkerIcon(location, zoom, isHovered);
    const marker = L.marker([latitude, longitude], { icon: markerIcon });

    // Add popup
    marker.bindPopup(createPopupContent(location));

    // Add event handlers
    marker.on('click', () => {
      setHoveredMarkerId(null); // Clear hover state on click
      onLocationClick(location);
    });
    marker.on('mouseover', () => setHoveredMarkerId(location.id));
    marker.on('mouseout', () => setHoveredMarkerId(null));

    return marker;
  }, [hoveredMarkerId, getMarkerIcon, onLocationClick]);

  // Initialize markers
  const initializeMarkers = useCallback(() => {
    if (!map || !mapLoaded || !locations?.length) return;

    // Clean up existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const zoom = map.getZoom();
    setCurrentZoom(zoom);

    // Create new markers
    locations.forEach((location) => {
      const marker = createMarker(location, zoom);
      marker.addTo(map);
      markersRef.current[location.id] = marker;
    });
  }, [map, mapLoaded, locations, createMarker]);

  return {
    currentZoom,
    hoveredMarkerId,
    updateMarkerIcons,
    initializeMarkers,
    markersRef
  };
}; 