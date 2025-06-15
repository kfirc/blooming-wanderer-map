import React, { useEffect } from 'react';
import L from 'leaflet';
import { Location } from '../../types/BloomReport';
import { useMapMarkers } from '../../hooks/useMapMarkers';
import { useZoomHandlers } from '../../hooks/useZoomHandlers';

interface MapMarkersProps {
  map: L.Map | null;
  locations: Location[];
  locationFlowersQueries: Array<{ data?: unknown; isLoading: boolean; error?: unknown }>;
  selectedLocation: Location | null;
  onLocationClick: (location: Location) => void;
  mapLoaded: boolean;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  locations,
  selectedLocation,
  onLocationClick,
  mapLoaded
}) => {
  const {
    updateMarkerIcons,
    initializeMarkers
  } = useMapMarkers({
    map,
    locations,
    selectedLocation,
    onLocationClick,
    mapLoaded
  });

  const { attachZoomListeners } = useZoomHandlers({
    map,
    onZoomUpdate: updateMarkerIcons
  });

  // Initialize markers when dependencies change
  useEffect(() => {
    initializeMarkers();
  }, [initializeMarkers]);

  // Attach zoom event listeners
  useEffect(() => {
    return attachZoomListeners();
  }, [attachZoomListeners]);

  return null; // This component doesn't render anything directly
};

export default MapMarkers;
