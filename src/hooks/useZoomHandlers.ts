import { useCallback, useRef } from 'react';
import L from 'leaflet';

interface UseZoomHandlersProps {
  map: L.Map | null;
  onZoomUpdate: (zoom?: number) => void;
}

export const useZoomHandlers = ({ map, onZoomUpdate }: UseZoomHandlersProps) => {
  const zoomUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const isZoomingRef = useRef<boolean>(false);

  const handleZoomStart = useCallback(() => {
    isZoomingRef.current = true;
  }, []);

  const handleZoomEnd = useCallback(() => {
    isZoomingRef.current = false;
    onZoomUpdate(); // Final update with correct zoom level
  }, [onZoomUpdate]);

  const handleZoom = useCallback(() => {
    if (isZoomingRef.current) return; // Skip intermediate updates during zoom animation
    
    if (zoomUpdateTimeoutRef.current) {
      clearTimeout(zoomUpdateTimeoutRef.current);
    }
    
    zoomUpdateTimeoutRef.current = setTimeout(() => {
      onZoomUpdate();
    }, 16); // ~60fps
  }, [onZoomUpdate]);

  const attachZoomListeners = useCallback(() => {
    if (!map) return;

    map.on('zoomstart', handleZoomStart);
    map.on('zoom', handleZoom);
    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('zoom', handleZoom);
      map.off('zoomend', handleZoomEnd);
      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }
    };
  }, [map, handleZoomStart, handleZoom, handleZoomEnd]);

  return { attachZoomListeners };
}; 