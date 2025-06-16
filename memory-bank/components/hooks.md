# Custom Hooks Architecture

## Reusable State Logic
Reusable state logic extracted into focused custom hooks:

### General Hooks
- **useSidebarState**: Sidebar open/close state management
- **useReportsData**: Data fetching with pagination and filtering
- **useDateFormatter**: Consistent date formatting across components
- **useFilters**: Centralized filter state management (orderBy, flower types, date ranges)
- **use-toast**: Toast notification logic for user feedback
- **use-mobile**: Mobile device detection for responsive behavior

### Map-Specific Hooks

#### useMapMarkers
**Location**: `src/hooks/useMapMarkers.ts`
- **Purpose**: Manages marker lifecycle and state
- **Returns**: updateMarkerIcons, initializeMarkers, currentZoom, hoveredMarkerId
- **Features**: Marker creation, event handling, cleanup

#### useMarkerScaling  
**Location**: `src/hooks/useMarkerScaling.ts`
- **Purpose**: Handles marker size calculations
- **Configuration**: baseSize, minSize, maxSize, scaleFactor, hoverScaleFactor
- **Returns**: calculateMarkerSize function

#### useZoomHandlers
**Location**: `src/hooks/useZoomHandlers.ts`
- **Purpose**: Manages zoom event listeners and throttling
- **Features**: Anti-jump logic, smooth transitions, event cleanup 