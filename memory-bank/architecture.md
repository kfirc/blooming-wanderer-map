# Bloom IL - System Architecture

## Application Architecture
Bloom IL follows a modern React architecture with clear separation of concerns:

### Frontend Architecture
- **Component Layer**: React components organized by feature and responsibility
- **Hook Layer**: Custom hooks for state management and data fetching
- **Service Layer**: API services for backend communication
- **Type Layer**: TypeScript definitions for type safety

### Data Flow
1. **User Interaction** → Component events
2. **State Management** → Custom hooks manage local state
3. **Data Fetching** → Services communicate with Supabase backend
4. **State Updates** → Components re-render with new data
5. **UI Updates** → Map and sidebar reflect current state

## Backend Architecture (Supabase)
- **Database**: PostgreSQL with structured schema for bloom reports, locations, users
- **Authentication**: Supabase Auth with Facebook integration
- **Storage**: File storage for bloom report images
- **Real-time**: Supabase real-time subscriptions for live updates

## Key Technical Decisions

### Component Organization
- **Modular Components**: Large components decomposed into smaller, focused components
- **Custom Hooks**: Reusable state logic extracted into custom hooks
- **Presentational vs Container**: Clear separation between data and presentation logic

### State Management Strategy
- **Local State**: React useState for component-specific state
- **Shared State**: Custom hooks for cross-component state
- **Server State**: Direct API calls with loading/error handling
- **No Global State**: Avoided Redux/Context for simplicity

### Performance Optimizations
- **Backend-Driven Filtering**: Filters applied at database level, not in-memory
- **Pagination**: Infinite scroll with server-side pagination
- **Memoization**: useMemo and useCallback for expensive computations
- **Component Splitting**: Code splitting for better loading performance

### Data Management
- **Service Layer**: Centralized API communication through bloomReportsService
- **Type Safety**: Full TypeScript coverage with generated Supabase types
- **Error Handling**: Consistent error handling patterns across services
- **Caching**: Minimal caching, relying on Supabase's built-in optimizations

## File Structure
```
src/
├── components/          # React components organized by feature
│   ├── Sidebar/        # Sidebar components (decomposed)
│   └── ui/             # Reusable UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── integrations/       # Third-party integrations (Supabase)
├── lib/                # Utility functions
└── pages/              # Page components
```

## Integration Points
- **Supabase Client**: Configured in `src/integrations/supabase/client.ts`
- **Map Integration**: Leaflet.js integrated through React components
- **UI Components**: shadcn/ui components with Tailwind CSS styling
- **Build System**: Vite for fast development and optimized production builds 