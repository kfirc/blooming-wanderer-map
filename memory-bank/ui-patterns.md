# Bloom IL - UI Patterns and Design System

## Design System Foundation

### Color Palette
- **Primary Colors**: Green-to-purple gradient theme reflecting nature and blooming
- **Background**: Clean white backgrounds with subtle shadows
- **Text**: High contrast text for accessibility
- **Accent Colors**: Consistent color scheme across components

### Typography
- **Font Family**: System fonts for optimal performance and readability
- **Font Weights**: Strategic use of bold for emphasis and hierarchy
- **Font Sizes**: Responsive sizing with proper hierarchy

## Component Library (shadcn/ui)

### Core UI Components
- **Button**: Multiple variants (primary, secondary, outline, ghost) with consistent styling
- **Card**: Content containers with subtle shadows and rounded corners
- **Badge**: Tags and labels for categorization with color coding
- **Separator**: Visual separators for content organization
- **ScrollArea**: Custom scrollable areas with styled scrollbars
- **Skeleton**: Loading states with shimmer effects for better UX
- **Toast**: User feedback notifications with proper positioning

### Form Components
- **Input**: Styled input fields with focus states
- **Select**: Dropdown selections with proper keyboard navigation
- **Checkbox**: Custom checkboxes with proper accessibility
- **Button Groups**: Related action groupings

## Layout Patterns

### Responsive Design
- **Mobile-First**: Designed for mobile devices with desktop enhancements
- **Breakpoint Strategy**: Consistent breakpoints across components
- **Flexible Layouts**: Components adapt to different screen sizes
- **Touch-Friendly**: Proper touch targets for mobile interactions

### Sidebar Pattern
- **Overlay on Mobile**: Full-screen overlay for mobile devices
- **Side Panel on Desktop**: Fixed sidebar with proper positioning
- **Animation System**: Smooth open/close animations with proper timing
- **Content Organization**: Hierarchical content structure within sidebar

### Map Integration
- **Full-Screen Map**: Map takes full viewport with overlay UI elements
- **Floating UI**: Header and controls float over map content
- **Marker System**: Custom SVG markers with consistent styling
- **Interactive Elements**: Hover states and click interactions
- **Smooth Keyboard Navigation**: Arrow key navigation with diagonal movement support
  - **Performance-Optimized**: Uses requestAnimationFrame for 60fps smooth movement
  - **Diagonal Movement**: Combining arrow keys (e.g., Up+Right) for diagonal navigation
  - **Acceleration**: Diagonal movement uses normalized speed with 1.8x acceleration factor
  - **Anti-Stuck Keys**: Handles page visibility changes and prevents stuck key states
  - **Smooth Easing**: 0.85 smooth factor for natural movement feeling
  - **Configurable Speed**: 280 pixels per second base pan speed (fast and responsive)
  - **Frame-Based Duration**: Uses 1/60fps duration for consistent movement
  - **Non-Blocking**: Doesn't interfere with zoom shortcuts (Cmd+Plus/Cmd+Minus)

## Visual Effects and Animations

### Loading States
- **Skeleton Loading**: Shimmer effects for content placeholders
- **Spinner Components**: Consistent loading indicators
- **Progressive Loading**: Content loads in logical order
- **Loading Screen**: Spectacular 4-second loading experience with logo animation

### Hover and Interaction States
- **Map Markers**: 30% scale increase on hover with 200ms transitions
- **Button Hover**: Subtle color and shadow changes
- **Card Hover**: Elevation changes for interactive elements
- **Focus States**: Clear focus indicators for accessibility

### Transitions and Animations
- **Smooth Transitions**: 200-300ms duration for most interactions
- **Easing Functions**: Natural easing curves for organic feel
- **Performance**: CSS-based animations for optimal performance
- **Reduced Motion**: Respects user preferences for reduced motion

## Accessibility Patterns

### Keyboard Navigation
- **Tab Order**: Logical tab order through interactive elements
- **Focus Management**: Proper focus handling in modals and overlays
- **Keyboard Shortcuts**: Standard keyboard interactions supported
- **Map Navigation**: Smooth arrow key navigation with diagonal movement
  - **Arrow Keys**: Up, Down, Left, Right for map panning
  - **Diagonal Movement**: Combining arrows (e.g., Up+Right) for smooth diagonal panning
  - **Smooth Animation**: requestAnimationFrame-based movement for 60fps performance
  - **Zoom Shortcuts**: Cmd+Plus/Cmd+Minus for zoom in/out (separate from navigation)

### Screen Reader Support
- **Semantic HTML**: Proper HTML structure for screen readers
- **ARIA Labels**: Descriptive labels for complex interactions
- **Alt Text**: Meaningful alt text for images and visual elements
- **Heading Hierarchy**: Proper heading structure for navigation

### Color and Contrast
- **High Contrast**: Text meets WCAG contrast requirements
- **Color Independence**: Information not conveyed by color alone
- **Focus Indicators**: Clear visual focus indicators

## Data Visualization Patterns

### Map Components
- **Interactive Map**: Leaflet-based map with custom styling
- **Custom Markers**: SVG-based markers with consistent styling
  - **Triangle Shape**: Polygon with black stroke border (`stroke="black"` and `stroke-width="1"`)
  - **Real-time Smooth Scaling**: Markers scale smoothly during zoom using CSS transforms applied in real-time
  - **Dual-Phase Scaling**: CSS transforms for immediate visual feedback + icon updates for final positioning
  - **Transform Properties**: `transform: scale()`, `transform-origin: center bottom`, `transition: transform 0.1s ease-out`
  - **Enhanced Transitions**: 0.5s duration with custom cubic-bezier for smoother shrinking on zoom out
  - **Anti-Jump Logic**: Prevents size jumping during zoom by using transform-based scaling during animation
  - **Granular Sizing**: Size range 16-36px with gentler scaling curve (0.15 factor per zoom level)
  - **Zoom Event Handling**: Uses `zoomstart`, `zoom`, and `zoomend` events for precise control
  - **Text Positioning**: Marker text uses `startOffset="50%"` on arc path for optimal centering
  - **Arc Path**: Text follows curved path `d="M 30,60 A 60,60 0 0,1 150,100"` with center shifted left for better alignment
  - **Responsive Text**: Text visibility controlled by zoom level (>=10)
- **Heatmap Layer**: Intensity visualization with color gradients
- **Zoom-Responsive**: Elements scale appropriately with zoom level
- **Information Hierarchy**: Clear visual hierarchy for map elements
- **Keyboard Zoom Control**: Intercepts Cmd+Plus/Cmd+Minus shortcuts to control map zoom instead of browser zoom

### Chart Components
- **Monthly Intensity Chart**: Data visualization for bloom trends
- **Consistent Styling**: Charts match overall design system
- **Interactive Elements**: Hover states and tooltips for data points

## Content Patterns

### Image Handling
- **Image Gallery**: Consistent image display patterns
- **Lazy Loading**: Performance optimization for image loading
- **Responsive Images**: Proper sizing for different screen sizes
- **Fallback States**: Graceful handling of missing images

### Text Content
- **Content Hierarchy**: Clear heading and text hierarchy
- **Reading Flow**: Logical content organization
- **Truncation**: Proper text truncation with ellipsis
- **Line Height**: Optimal line spacing for readability

## Performance Considerations

### CSS Optimization
- **Tailwind CSS**: Utility-first CSS for consistent styling
- **Purged CSS**: Unused styles removed in production
- **Critical CSS**: Above-the-fold styles prioritized
- **CSS-in-JS**: Minimal runtime CSS generation

### Animation Performance
- **GPU Acceleration**: Transform and opacity animations for smooth performance
- **Frame Rate**: 60fps animations with proper timing
- **Memory Management**: Efficient animation cleanup
- **Battery Consideration**: Reduced animations on low-power devices 