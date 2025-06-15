- Main pages are located in `src/pages/`.
- `Index.tsx` is the main entry page of the app.
- `NotFound.tsx` handles 404 or unknown routes.
- Pages define the main navigation and routing structure.
- `Index.tsx` manages the sidebar open state, mode (`'location'` or `'info'`), and data fetching for locations and flowers. It coordinates when the sidebar opens and what content is shown, and passes all relevant props to Sidebar and MapHeader.

## Recent Changes (June 2025) - COMPLETED
- ✅ Changed data fetching strategy from bloom reports to locations-first approach
- ✅ Uses `useQuery` to fetch all locations from `bloomReportsService.getLocations`
- ✅ Uses `useQueries` for dependent queries to fetch flowers for each location
- ✅ State management now uses `Location` type instead of `BloomReport`
- ✅ Updated Map component to accept locations and locationFlowersQueries props
- ✅ Fixed MapHeatmap and MapMarkers components to work with Location objects
- ✅ Updated Sidebar component to accept Location directly instead of BloomReport
- ✅ Fixed all TypeScript type errors and runtime errors
- ✅ Added useCallback to getMarkerIcon function to fix React Hook dependency warning

## UI Filter Changes (June 2025) - COMPLETED
- ✅ Modified ReportsSection filters layout to use `justify-between` instead of `justify-end`
- ✅ Clear filters button now positioned on the left side
- ✅ Filter controls (order, date, flower) now positioned on the right side
- ✅ Removed borders from filter selects when they have non-default values selected
- ✅ Added purple background (`bg-purple-50`) to selected filters for visual feedback
- ✅ Filter styling: `border-0 bg-purple-50` when selected, `border` when default
- ✅ Added `focus:ring-0 focus:outline-none` to completely remove black borders on selected filters

## Flower Selection Logic Changes (June 2025) - COMPLETED
- ✅ Modified FlowersList handleFlowerClick function with new selection behavior
- ✅ If all flowers are currently selected, clicking any flower now selects only that flower
- ✅ Maintains existing behavior for partial selections (add/remove individual flowers)
- ✅ Still reverts to all selected when last flower is deselected

## Architecture Notes
- The app now fetches locations first, then flowers for each location using dependent queries
- Map components (MapHeatmap, MapMarkers) now receive `locations` and `locationFlowersQueries` props
- Sidebar receives `Location` objects directly instead of nested `BloomReport.location`
- Loading states and error handling updated to work with the new data structure

 