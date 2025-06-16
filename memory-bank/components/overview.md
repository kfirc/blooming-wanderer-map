# Bloom IL - Component Architecture Overview

## Component Organization Strategy
Bloom IL follows a modular component architecture with clear separation of concerns:

### Main Application Components
- **Index.tsx**: Main page component orchestrating map and sidebar interaction
- **Map.tsx**: Interactive Leaflet map displaying bloom report locations with markers and heatmap
- **Sidebar**: Decomposed into multiple focused components (see Sidebar Architecture below)

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

## Type Safety & Development Experience
- **Full TypeScript Coverage**: All components have proper type definitions
- **Generated Types**: Supabase types automatically generated and maintained
- **Interface Consistency**: Standardized prop interfaces across similar components
- **Development Tools**: ESLint and TypeScript for code quality 