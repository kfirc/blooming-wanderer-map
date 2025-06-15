import { Location } from '../types/BloomReport';

/**
 * Calculate current month intensity based on location
 */
export const calculateCurrentMonthIntensity = (location: Location): number => {
  return location.intensity || 0.5;
};

/**
 * Generate color gradient from red (lowest intensity) to green (highest intensity)
 */
export const getIntensityColor = (intensity: number): string => {
  // Clamp intensity between 0 and 1
  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  
  // Interpolate between red (0) and green (1)
  const red = Math.round(255 * (1 - clampedIntensity));
  const green = Math.round(255 * clampedIntensity);
  const blue = 0;
  
  return `rgb(${red}, ${green}, ${blue})`;
};

/**
 * Generate popup content HTML for a location
 */
export const createPopupContent = (location: Location): string => {
  return `
    <div class="p-2 max-w-48">
      <div class="flex items-center space-x-2 mb-2">
        <span class="font-medium text-sm">${location.name}</span>
      </div>
      <p class="text-xs text-gray-600 mb-2 line-clamp-2">Location: ${location.name}</p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center space-x-1">
          <span>📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</span>
        </div>
      </div>
    </div>
  `;
}; 