# Bloom IL - Component Architecture

## Component Organization Strategy
Bloom IL follows a modular component architecture with clear separation of concerns:

### Main Application Components
- **Index.tsx**: Main page component orchestrating map and sidebar interaction
- **Map.tsx**: Interactive Leaflet map displaying bloom report locations with markers and heatmap
- **Sidebar**: Decomposed into multiple focused components (see Sidebar Architecture below)

### Sidebar Architecture (Unified Design)
The sidebar uses a unified approach with the SlidePanel component for consistent UX:

**Container & Layout**:
- **SidebarContainer.tsx**: Uses SlidePanel with unified close button and backdrop
- **SlidePanel**: Unified component with configurable sides, close buttons (inside/outside), backdrop, animations

**Content Components**:
- **SidebarHeader.tsx**: Location information and Waze navigation integration
- **SidebarContent.tsx**: Scrollable content area with proper scroll handling
- **SidebarInfoMode.tsx**: Information display mode for location details
- **LocationCard.tsx**: Enhanced location card with improved UX

**Unified UX Features**:
- **Consistent X Button**: Same design across all sliding panels (map style selector, reports sidebar)
- **Unified Animations**: 300ms smooth transitions for open/close
- **Backdrop Integration**: Blur backdrop with click-to-close functionality
- **Keyboard Support**: ESC key closes any open panel
- **Responsive Design**: Mobile-first with proper touch interactions

### Feature Components
- **FlowersList.tsx**: Flower type selection and filtering interface
- **ReportsSection.tsx**: Bloom reports display with filtering and pagination
- **MonthlyIntensityChart.tsx**: Data visualization for bloom intensity trends
- **MapHeader.tsx**: Header component with info button functionality
- **ImageGallery.tsx**: Image display component for bloom reports

### UI Component System (shadcn/ui)
Consistent design system with reusable components:
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Card**: Content containers with consistent styling
- **Badge**: Tags and labels for categorization
- **ScrollArea**: Custom scrollable areas with proper styling
- **Skeleton**: Loading states for better UX
- **Toast**: User feedback and notifications

## Component Design Principles

### Single Responsibility Principle
Each component has a focused, single purpose:
- **Presentational Components**: Focus on UI rendering and user interaction
- **Container Components**: Handle state management and data coordination
- **Custom Hooks**: Extract reusable logic and state management

### State Management Pattern
- **Local State**: Component-specific state using useState
- **Shared State**: Custom hooks for cross-component state coordination
- **Data Fetching**: Service layer with proper loading and error states
- **No Global State**: Avoided Redux/Context for application simplicity

### Performance Optimizations
- **Memoization**: useMemo and useCallback for expensive computations
- **Component Splitting**: Logical separation to prevent unnecessary re-renders
- **Backend-Driven Operations**: Filtering and pagination handled server-side

## Custom Hooks Architecture
Reusable state logic extracted into focused custom hooks:

- **useSidebarState**: Sidebar open/close state management
- **useReportsData**: Data fetching with pagination and filtering
- **useDateFormatter**: Consistent date formatting across components
- **useFilters**: Centralized filter state management (orderBy, flower types, date ranges)
- **use-toast**: Toast notification logic for user feedback
- **use-mobile**: Mobile device detection for responsive behavior

## Map Component Features

### Interactive Map (Map.tsx)
- **Leaflet.js Integration**: Interactive map centered on Israel
- **Bloom Report Markers**: Custom markers showing report locations
- **Heatmap Visualization**: Intensity visualization across locations
- **Marker Interactions**: Click handlers for report selection
- **OpenStreetMap Tiles**: Base map layer

### Map Components

#### MapMarkers (Refactored)
**Location**: `src/components/MapMarkers.tsx`
- **Purpose**: Orchestrates marker display on Leaflet map
- **Simplified Architecture**: Now uses composition of custom hooks and utilities
- **Dependencies**: 
  - `useMapMarkers` hook for marker management
  - `useZoomHandlers` hook for zoom event handling
- **Props**: map, locations, selectedLocation, onLocationClick, mapLoaded
- **Render**: Returns null (purely functional component)

#### MarkerIcon Component
**Location**: `src/components/MarkerIcon.tsx`
- **Purpose**: Creates Leaflet DivIcon with custom SVG content
- **Functions**:
  - `createMarkerIcon()` - Main icon creation function
  - `createTextSVG()` - Generates curved text labels
  - `createTriangleSVG()` - Generates triangle markers with shadows
- **Features**: Intensity-based coloring, hover states, zoom-responsive text

#### Custom Hooks

##### useMapMarkers
**Location**: `src/hooks/useMapMarkers.ts`
- **Purpose**: Manages marker lifecycle and state
- **Returns**: updateMarkerIcons, initializeMarkers, currentZoom, hoveredMarkerId
- **Features**: Marker creation, event handling, cleanup

##### useMarkerScaling  
**Location**: `src/hooks/useMarkerScaling.ts`
- **Purpose**: Handles marker size calculations
- **Configuration**: baseSize, minSize, maxSize, scaleFactor, hoverScaleFactor
- **Returns**: calculateMarkerSize function

##### useZoomHandlers
**Location**: `src/hooks/useZoomHandlers.ts`
- **Purpose**: Manages zoom event listeners and throttling
- **Features**: Anti-jump logic, smooth transitions, event cleanup

#### Utilities

##### markerUtils
**Location**: `src/utils/markerUtils.ts`
- **Functions**:
  - `calculateCurrentMonthIntensity()` - Gets location intensity
  - `getIntensityColor()` - Converts intensity to RGB color
  - `createPopupContent()` - Generates popup HTML

## Loading Experience

### Loading Screen System
- **Three-Phase Animation**: Snake dash → stretch → spectacular transition
- **Seamless Transitions**: 4-second total experience with coordinated timing
- **Logo Animation**: Moves from center to header position with scaling
- **Background Collapse**: Circular collapse animation revealing map
- **Performance**: Pure CSS animations with 60fps smooth transitions

## Type Safety & Development Experience
- **Full TypeScript Coverage**: All components have proper type definitions
- **Generated Types**: Supabase types automatically generated and maintained
- **Interface Consistency**: Standardized prop interfaces across similar components
- **Development Tools**: ESLint and TypeScript for code quality

**Build Issues Fixed:**
- Fixed CSS syntax error in `