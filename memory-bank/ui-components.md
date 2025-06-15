# UI Components

## Loading Screen
- **File**: `src/components/LoadingScreen.tsx` and `src/components/LoadingScreen.css`
- **Animation**: Progressive circle drawing with snake-then-stretch animation
- **Timing**: 2s circle completion + 600ms pause + 1.7s transition to header
- **Transition**: Logo moves to header position, background collapses to circle
- **Accessibility**: Respects `prefers-reduced-motion` preference

## Map Header
- **File**: `src/components/MapHeader.tsx`
- **Position**: Absolute top-left (top-4 left-4)
- **Features**: 
  - Logo with title "Bloom IL"
  - Info button with Lottie animation
  - Coffee donation button with Lottie animation
  - **Hover Effect**: Logo shows static full circle on hover matching loading screen design
- **Styling**: White background, rounded corners, shadow

## Map Markers
- **File**: `src/components/MapMarkers.tsx`
- **Shape**: Upside-down triangles pointing to location
- **Color System**: Current month bloom intensity-based gradient from red (lowest) to green (highest)
  - **Algorithm**: RGB interpolation where red = 255*(1-intensity), green = 255*intensity, blue = 0
  - **Intensity Calculation**: Based on flowers blooming in current month
    - Averages intensity of all flowers in bloom this month
    - Fallback to 0.1 if no flower data, 0.2 if no flowers blooming
    - Uses flower.intensity or defaults to 0.5 per flower
- **Features**:
  - **Zoom-responsive sizing**: Base size 24px, max 32px, scales with zoom level
  - **Location labels**: Curved text above markers (visible at zoom >= 10)
  - **Visual effects**: Drop shadow, 90% opacity, no border for clean appearance
  - **Positioning**: Anchored at triangle point (bottom tip)
- **Popups**: Show user info, description, image count, and likes

## Sidebar Header
- **File**: `src/components/Sidebar/SidebarHeader.tsx`
- **Layout**: Fixed positioning layout with justify-between and spacer div
- **Structure**: Left element (Waze icon or empty div) + Text content (fixed right, right-aligned)
- **Mode Support**: 
  - **Location mode**: Shows location name or "כל הדיווחים" with Waze icon
  - **Info mode**: Shows "מידע על הדף" without Waze icon
- **Styling**: Green-to-purple gradient background, border bottom
- **Waze Navigation**: Opens Waze app/website with location coordinates (location mode only)
- **Responsive**: Truncates long location names
- **Text Direction**: Right-aligned for Hebrew text support
- **Layout Fix**: Always renders left element (Waze or empty div) to ensure right alignment works

## Image Gallery
- **File**: `src/components/ImageGallery.tsx`
- **Layout**: Grid-based image display within report cards
- **Padding**: Horizontal (`px-4`) and bottom (`pb-4`) padding to ensure images are fully contained
- **Purpose**: Displays report images with proper spacing from card edges

## Interactive Elements
- **Buttons**: Hover effects with Lottie animations
- **Logo**: Hover shows completion circle from loading screen (static)
- **Waze Icon**: Scale animation on hover (110% scale)
- **Image Gallery**: Hover opacity effects and modal interactions
- **Transitions**: Smooth opacity and scale animations 