import { MapStyle } from '../types/BloomReport';

export interface MapStyleHebrew extends MapStyle {
  nameHebrew: string;
  descriptionHebrew: string;
}

export const mapStyles: MapStyleHebrew[] = [
  {
    id: 'osm-standard',
    name: 'OpenStreetMap',
    nameHebrew: 'מפת רחובות סטנדרטית',
    description: 'Standard detailed street map',
    descriptionHebrew: 'מפת רחובות מפורטת וסטנדרטית',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    category: 'standard',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="40" fill="#f8f9fa"/>
        <rect x="10" y="8" width="40" height="3" fill="#e8e8e8"/>
        <rect x="15" y="15" width="30" height="2" fill="#d0d0d0"/>
        <rect x="8" y="22" width="35" height="2" fill="#d0d0d0"/>
        <rect x="12" y="29" width="25" height="2" fill="#d0d0d0"/>
        <circle cx="20" cy="20" r="3" fill="#4285f4"/>
        <text x="30" y="37" font-family="Arial" font-size="8" fill="#666">OSM</text>
      </svg>
    `)}`
  },
  {
    id: 'cartodb-positron',
    name: 'Light',
    nameHebrew: 'מפה בהירה',
    description: 'Clean light theme perfect for data visualization',
    descriptionHebrew: 'עיצוב בהיר ונקי המושלם להצגת מידע',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    attribution: '© CartoDB, © OpenStreetMap contributors',
    maxZoom: 18,
    category: 'standard',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="40" fill="#fcfcfc"/>
        <rect x="12" y="10" width="36" height="2" fill="#e8e8e8"/>
        <rect x="18" y="17" width="24" height="1.5" fill="#f0f0f0"/>
        <rect x="10" y="24" width="28" height="1.5" fill="#f0f0f0"/>
        <rect x="16" y="31" width="20" height="1.5" fill="#f0f0f0"/>
        <circle cx="25" cy="20" r="2.5" fill="#7fcdcd"/>
        <text x="30" y="37" font-family="Arial" font-size="8" fill="#999">Light</text>
      </svg>
    `)}`
  },
  {
    id: 'cartodb-dark',
    name: 'Dark',
    nameHebrew: 'מפה כהה',
    description: 'Dark theme for enhanced focus and night viewing',
    descriptionHebrew: 'עיצוב כהה לפוקוס טוב יותר וצפייה לילית',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    attribution: '© CartoDB, © OpenStreetMap contributors',
    maxZoom: 18,
    category: 'standard',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="40" fill="#2c3e50"/>
        <rect x="12" y="10" width="36" height="2" fill="#4a5568"/>
        <rect x="18" y="17" width="24" height="1.5" fill="#5a6578"/>
        <rect x="10" y="24" width="28" height="1.5" fill="#5a6578"/>
        <rect x="16" y="31" width="20" height="1.5" fill="#5a6578"/>
        <circle cx="25" cy="20" r="2.5" fill="#a0aec0"/>
        <text x="30" y="37" font-family="Arial" font-size="8" fill="#cbd5e0">Dark</text>
      </svg>
    `)}`
  },
  {
    id: 'stamen-toner',
    name: 'Toner',
    nameHebrew: 'מפה אמנותית שחור-לבן',
    description: 'High contrast black and white artistic style',
    descriptionHebrew: 'סגנון אמנותי בניגודיות גבוהה שחור ולבן',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
    attribution: '© Stamen Design, © OpenStreetMap contributors',
    maxZoom: 18,
    category: 'artistic',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="40" fill="#ffffff"/>
        <rect x="8" y="8" width="44" height="3" fill="#000000"/>
        <rect x="12" y="15" width="36" height="2" fill="#333333"/>
        <rect x="6" y="22" width="40" height="2" fill="#333333"/>
        <rect x="10" y="29" width="32" height="2" fill="#333333"/>
        <circle cx="22" cy="20" r="3" fill="#000000"/>
        <text x="28" y="37" font-family="Arial" font-size="8" fill="#000">Toner</text>
      </svg>
    `)}`
  },
  {
    id: 'stamen-watercolor',
    name: 'Watercolor',
    nameHebrew: 'מפת צבעי מים',
    description: 'Artistic watercolor painting style',
    descriptionHebrew: 'סגנון אמנותי של ציור בצבעי מים',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
    attribution: '© Stamen Design, © OpenStreetMap contributors',
    maxZoom: 16,
    category: 'artistic',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="watercolor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e3f2fd"/>
            <stop offset="30%" style="stop-color:#bbdefb"/>
            <stop offset="70%" style="stop-color:#90caf9"/>
            <stop offset="100%" style="stop-color:#64b5f6"/>
          </linearGradient>
        </defs>
        <rect width="60" height="40" fill="url(#watercolor)"/>
        <ellipse cx="15" cy="12" rx="12" ry="6" fill="#c8e6c9" opacity="0.7"/>
        <ellipse cx="45" cy="25" rx="10" ry="8" fill="#fff3e0" opacity="0.8"/>
        <ellipse cx="30" cy="32" rx="8" ry="5" fill="#f3e5f5" opacity="0.6"/>
        <circle cx="25" cy="18" r="3" fill="#ff7043" opacity="0.8"/>
        <text x="25" y="37" font-family="Arial" font-size="7" fill="#5d4037">Water</text>
      </svg>
    `)}`
  },
  {
    id: 'satellite',
    name: 'Satellite',
    nameHebrew: 'תמונת לוויין',
    description: 'High-resolution satellite imagery',
    descriptionHebrew: 'תמונות לוויין ברזולוציה גבוהה',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    category: 'satellite',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="terrain" cx="50%" cy="30%">
            <stop offset="0%" style="stop-color:#8bc34a"/>
            <stop offset="40%" style="stop-color:#689f38"/>
            <stop offset="80%" style="stop-color:#558b2f"/>
            <stop offset="100%" style="stop-color:#33691e"/>
          </radialGradient>
        </defs>
        <rect width="60" height="40" fill="url(#terrain)"/>
        <ellipse cx="45" cy="15" rx="8" ry="12" fill="#795548" opacity="0.6"/>
        <ellipse cx="20" cy="30" rx="15" ry="8" fill="#4caf50" opacity="0.8"/>
        <rect x="10" y="10" width="25" height="2" fill="#81c784" opacity="0.7"/>
        <circle cx="40" cy="28" r="4" fill="#2196f3" opacity="0.9"/>
        <text x="22" y="37" font-family="Arial" font-size="7" fill="#ffffff">Satellite</text>
      </svg>
    `)}`
  },
  {
    id: 'terrain',
    name: 'Terrain',
    nameHebrew: 'מפת שטח',
    description: 'Topographical map with elevation and contours',
    descriptionHebrew: 'מפה טופוגרפית עם קווי גובה ותווי שטח',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 17,
    category: 'terrain',
    preview: `data:image/svg+xml;base64,${btoa(`
      <svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="40" fill="#f5f3f0"/>
        <path d="M0,30 Q15,20 30,25 T60,22" stroke="#8d6e63" stroke-width="1.5" fill="none"/>
        <path d="M0,35 Q20,25 40,30 T60,28" stroke="#a1887f" stroke-width="1" fill="none"/>
        <path d="M5,25 L15,15 L25,20 L35,12 L45,18 L55,10" stroke="#6d4c41" stroke-width="2" fill="none"/>
        <circle cx="30" cy="18" r="1.5" fill="#795548"/>
        <circle cx="45" cy="25" r="1" fill="#8d6e63"/>
        <text x="25" y="37" font-family="Arial" font-size="7" fill="#5d4037">Terrain</text>
      </svg>
    `)}`
  }
];

export const getMapStyleById = (id: string): MapStyleHebrew | undefined => {
  return mapStyles.find(style => style.id === id);
};

export const getMapStylesByCategory = (category: MapStyle['category']): MapStyleHebrew[] => {
  return mapStyles.filter(style => style.category === category);
};

// Hebrew translations for categories
export const categoryLabelsHebrew = {
  standard: 'סטנדרטי',
  artistic: 'אמנותי', 
  satellite: 'לוויין',
  terrain: 'שטח',
  all: 'הכל'
}; 