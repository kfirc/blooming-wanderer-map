# Sidebar Components

## Sidebar Architecture (Unified Design)
The sidebar uses a unified approach with the SlidePanel component for consistent UX:

### Container & Layout
- **SidebarContainer.tsx**: Uses SlidePanel with unified close button and backdrop
- **SlidePanel**: Unified component with configurable sides, close buttons (inside/outside), backdrop, animations

### Content Components
- **SidebarHeader.tsx**: Location information and Waze navigation integration
- **SidebarContent.tsx**: Scrollable content area with proper scroll handling
- **SidebarInfoMode.tsx**: Information display mode for location details
- **LocationCard.tsx**: Enhanced location card with improved UX

### Unified UX Features
- **Consistent X Button**: Same design across all sliding panels (map style selector, reports sidebar)
- **Unified Animations**: Smooth slide-in/slide-out transitions
- **Backdrop Handling**: Proper backdrop behavior with close-on-click
- **Mobile Responsive**: Adapts to different screen sizes

## Feature Components in Sidebar

### FlowersList Component (Redesigned - Updated)
**Location**: `src/components/FlowersList.tsx`
**Purpose**: Displays flowers in a horizontal wrapping grid layout for location-specific selection filtering

**Key Features**:
- **Horizontal Wrapping Grid**: Uses `flex flex-wrap` to arrange flower icons in rows that wrap to panel limits
- **Curved Text SVG Labels**: Implements `createFlowerTextSVG()` function using SVG `<textPath>` with arc path for flower names above icons
- **Quarter Circle Text Start**: Text positioned at 25% offset (quarter circle to the right/3 o'clock position) with `text-anchor="start"`
- **Larger Icons**: 64x64px flower icons with enhanced visual presence
- **Selection Indicators**: Circular purple ring (`ring-4 ring-purple-400`) around selected flower icons
- **Removed Like/Dislike**: Eliminated all thumbs up/down functionality and mutation logic
- **Enhanced Interaction**: Hover effects, smooth transitions, and improved visual feedback

**SVG Text Implementation (Fixed)**:
- **Curved Path**: `M 15,25 Q 45,10 75,25` creates proper upward quadratic curve
- **Text Positioning**: `startOffset="25%"` positions text at quarter circle (90 degrees) to the right
- **Text Anchor**: `text-anchor="start"` ensures text flows from starting position
- **Double Rendering**: White stroke outline + black fill for readability
- **Unique IDs**: Prevents conflicts between multiple flower text elements

**Layout Features**:
- **Grid Container**: `flex flex-wrap gap-4 justify-center` for responsive wrapping
- **Icon Size**: 16x16 (w-16 h-16) flower icons with purple borders
- **Selection Ring**: 4px purple ring with 2px offset for selected state
- **Hover Effects**: Scale transform (scale-105) for interactive feedback
- **Spacing**: 16px gap between flower items

**Integration**:
- **MonthlyIntensityChart**: Shows intensity data for hovered flower at the top
- **Filtering System**: Connects to main filtering through `onFilterChange` prop
- **GlowingIcon**: In-season indicator positioned absolutely on flower icons
- **State Management**: Uses React state for hover and selection interactions

**Performance**:
- **Efficient Rendering**: SVG text generated per flower with unique IDs
- **Smooth Animations**: CSS transitions for hover and selection states
- **Optimized Layout**: Flex-based responsive grid without heavy calculations

### Other Feature Components
- **ReportsSection.tsx**: Bloom reports display with filtering and pagination
- **MonthlyIntensityChart.tsx**: Data visualization for bloom intensity trends
- **ImageGallery.tsx**: Image display component for bloom reports 