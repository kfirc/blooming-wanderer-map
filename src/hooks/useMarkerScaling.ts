import { useCallback } from 'react';

interface MarkerScalingConfig {
  baseSize: number;
  minSize: number;
  maxSize: number;
  zoomStartLevel: number;
  scaleFactor: number;
  hoverScaleFactor: number;
}

const DEFAULT_CONFIG: MarkerScalingConfig = {
  baseSize: 20,
  minSize: 16,
  maxSize: 36,
  zoomStartLevel: 8,
  scaleFactor: 0.15,
  hoverScaleFactor: 1.2,
};

export const useMarkerScaling = (config: Partial<MarkerScalingConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const calculateMarkerSize = useCallback((zoom: number, isHovered: boolean = false) => {
    const { baseSize, minSize, maxSize, zoomStartLevel, scaleFactor, hoverScaleFactor } = finalConfig;
    
    // More granular scaling with smoother curve
    const normalizedZoom = Math.max(0, zoom - zoomStartLevel);
    const scale = 1 + (normalizedZoom * scaleFactor);
    let size = Math.max(minSize, Math.min(Math.round(baseSize * scale), maxSize));
    
    // Make marker larger when hovered
    if (isHovered) {
      size = Math.min(size * hoverScaleFactor, maxSize * 1.1);
    }
    
    return size;
  }, [finalConfig]);

  return { calculateMarkerSize };
}; 