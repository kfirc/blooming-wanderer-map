import L from 'leaflet';
import { Location } from '../../types/BloomReport';
import { calculateCurrentMonthIntensity, getIntensityColor } from '../../utils/markerUtils';

interface MarkerIconProps {
  location: Location;
  size: number;
  zoom: number;
  isHovered: boolean;
}

/**
 * Creates a Leaflet DivIcon for a marker with custom SVG content
 */
export const createMarkerIcon = ({ location, size, zoom, isHovered }: MarkerIconProps): L.DivIcon => {
  const currentIntensity = calculateCurrentMonthIntensity(location);
  const color = getIntensityColor(currentIntensity);
  
  const showText = zoom >= 10;
  const hoverClass = isHovered ? 'scale-110' : '';
  
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center transition-all duration-500 ease-in-out ${hoverClass}">
        ${showText ? createTextSVG(location.name) : ''}
        ${createTriangleSVG(location.id, size, color)}
      </div>
    `,
    className: 'custom-bloom-marker',
    iconSize: [size, size + 40],
    iconAnchor: [size / 2, size + 18],
  });
};

/**
 * Creates the text SVG element for marker labels
 */
const createTextSVG = (locationName: string): string => {
  return `
    <svg width="200" height="80" viewBox="0 0 200 80" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); pointer-events: none; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
      <defs>
        <path id="arcPath" d="M 30,60 A 60,60 0 0,1 150,100" fill="none" />
      </defs>
      <text font-size="15" font-weight="bold" fill="black" text-anchor="middle" font-family="Helvetica" stroke="white" stroke-width="3" paint-order="stroke">
        <textPath href="#arcPath" startOffset="50%">
          ${locationName}
        </textPath>
      </text>
      <text font-size="15" font-weight="bold" fill="black" text-anchor="middle" font-family="Helvetica">
        <textPath href="#arcPath" startOffset="50%">
          ${locationName}
        </textPath>
      </text>
    </svg>
  `;
};

/**
 * Creates the triangle SVG element for the marker
 */
const createTriangleSVG = (locationId: string, size: number, color: string): string => {
  return `
    <svg width="${size}" height="${size}" style="margin-top: 18px; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
      <defs>
        <filter id="shadow-${locationId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
        </filter>
      </defs>
      <polygon 
        points="${size/2},${size} ${4},${4} ${size-4},${4}"
        fill="${color}"
        stroke="black"
        stroke-width="1"
        filter="url(#shadow-${locationId})"
        opacity="0.9"
        style="transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);"
      />
    </svg>
  `;
}; 