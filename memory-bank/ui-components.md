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
- **Styling**: White background with backdrop blur, rounded corners, shadow
- **Logo Circle**: Green-to-purple gradient circle appears on hover with smooth opacity transition

## Interactive Elements
- **Buttons**: Hover effects with Lottie animations
- **Logo**: Hover shows completion circle from loading screen (static)
- **Transitions**: Smooth opacity and scale animations 