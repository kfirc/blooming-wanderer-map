- Main UI components are located in `src/components/`.
- `Sidebar.tsx` provides navigation or filtering options for the app.
- `Header.tsx` displays the app title or navigation bar.
- `ImageGallery.tsx` displays images related to bloom reports.
- Components are designed for modularity and reuse in the UI.
- `Sidebar.tsx` now receives its open state, mode (`'location'` or `'info'`), and data as props from the main page. It displays either location details (including flowers and reports) or info content, depending on mode.
- The sidebar opens immediately when a location is clicked, and shows a loading spinner for flowers until the data is loaded.
- `FlowersList.tsx` receives its data and loading state as props, and no longer fetches data internally.
- The reports section in the sidebar shows a loading spinner if reports are loading (placeholder for now).
- `MapHeader.tsx` receives an `onInfoClick` prop, which opens the sidebar in info mode when triggered.
- The sidebar content resets to default only after the close animation completes (300ms delay).

**Build Issues Fixed:**
- Fixed CSS syntax error in `LoadingScreen.css`: removed extra closing brace at line 267
- Error was caused by mismatched braces in `@media (prefers-reduced-motion: reduce)` block
- Build now completes successfully with `npm run build` command
- PostCSS parsing error resolved

**Loading Screen Spectacular Transition System (Updated 2025-01-19):**
- **Three-Phase Experience**: 
  1. **Phase 1 (0-1s)**: Snake dash completes final rotation
  2. **Phase 2 (1-2s)**: Fast stretch to full circle (same speed as snake)
  3. **Phase 3 (2-4s)**: Spectacular transition to map view
- **Seamless Animation**: `snake-then-stretch 2s linear forwards`
  - Both phases run at equal speed for consistent visual rhythm
  - No delays or gaps between animation phases
- **Spectacular Transition Effects**:
  - **Logo Movement**: Animates from center to exact header position with precise scaling (`move-logo-to-header 2.2s ease-in-out`)
  - **Background Collapse**: White screen collapses into the logo itself at header position (`collapse-to-circle 2.2s ease-in-out`)
  - **Title Fade**: Loading title fades out during transition (`fade-out 0.5s ease-out`)
  - **Map Reveal**: Map loads behind and becomes visible as circle collapses into logo
- **Advanced CSS Techniques**:
  - `clip-path: circle()` for smooth circular collapse animation
  - Absolute positioning with transform animations for logo movement
  - Z-index layering for proper overlay management
  - Coordinated timing between multiple animation phases
- **SVG Implementation**: Uses `stroke-dasharray` and `stroke-dashoffset` for smooth animation
- **Technical Details**: 
  - Circle radius: 60px, circumference ≈ 377px
  - Snake pattern: `stroke-dasharray: 60 317` (60px dash + 317px gap = 377px total)
  - Logo scales from 1.0 to 0.4 while moving to header position
  - Collapse animation uses clip-path from 100% to 0% at header position
- **Timing Logic**: 
  - Snake + stretch: 2s (1s each phase)
  - Spectacular transition: 2s (logo movement + background collapse)
  - Total experience: 4s (2s animation + 2s transition)
- **Visual Design**: 
  - Gradient stroke with green-to-purple color transition
  - Smooth morphing from loading screen to map interface
  - Logo seamlessly becomes part of header
- **Enhanced UX**: 
  - Cinematic transition experience
  - No jarring cuts or sudden changes
  - Logo continuity from loading to interface
  - Map revealed dramatically through circular collapse
- **Performance**: Pure CSS animations with optimal timing and smooth 60fps transitions 