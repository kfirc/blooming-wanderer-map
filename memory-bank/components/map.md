# Map Components

## Interactive Map (Map.tsx)
- **Leaflet.js Integration**: Interactive map centered on Israel
- **Bloom Report Markers**: Custom markers showing report locations
- **Heatmap Visualization**: Intensity visualization across locations
- **Marker Interactions**: Click handlers for report selection
- **OpenStreetMap Tiles**: Base map layer

## Map Components

### MapMarkers (Refactored)
**Location**: `src/components/MapMarkers.tsx`
- **Purpose**: Orchestrates marker display on Leaflet map
- **Simplified Architecture**: Now uses composition of custom hooks and utilities
- **Dependencies**: 
  - `useMapMarkers` hook for marker management
  - `useZoomHandlers` hook for zoom event handling
- **Props**: map, locations, selectedLocation, onLocationClick, mapLoaded
- **Render**: Returns null (purely functional component)

### MarkerIcon Component
**Location**: `src/components/MarkerIcon.tsx`
- **Purpose**: Creates Leaflet DivIcon with custom SVG content
- **Functions**:
  - `createMarkerIcon()` - Main icon creation function
  - `createTextSVG()` - Generates curved text labels
  - `createTriangleSVG()` - Generates triangle markers with shadows
- **Features**: Intensity-based coloring, hover states, zoom-responsive text

### MapHeader Component
**Location**: `src/components/MapHeader.tsx`
- **Purpose**: Header component with info button functionality
- **Features**: Logo display, info button integration 