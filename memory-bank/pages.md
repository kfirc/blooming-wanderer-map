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
- ✅ Updated Sidebar component to accept `Location` directly instead of `BloomReport`
- ✅ Fixed MapHeatmap.tsx to work with locations array and added null checks
- ✅ Fixed MapMarkers.tsx to work with Location objects instead of BloomReport objects
- ✅ Updated marker creation logic and popup content for Location-based data
- ✅ All TypeScript errors resolved and runtime errors fixed

## Architecture Notes
- The app now fetches locations first, then flowers for each location using dependent queries
- Map components (MapHeatmap, MapMarkers) now receive `locations` and `locationFlowersQueries` props
- Sidebar receives `Location` objects directly instead of nested `BloomReport.location`
- Loading states and error handling updated to work with the new data structure

 