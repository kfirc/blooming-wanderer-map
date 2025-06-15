# Bloom IL - Data Layer Architecture

## Database Schema (Supabase PostgreSQL)

### Core Tables
- **bloom_reports**: Main entity storing bloom report data
- **locations**: Physical locations with coordinates and metadata
- **users**: User profiles and authentication data
- **flowers**: Flower type definitions and characteristics

### Key Relationships
- **bloom_reports** → **locations**: Many-to-one (reports belong to locations)
- **bloom_reports** → **users**: Many-to-one (reports created by users)
- **bloom_reports** → **flowers**: Many-to-many (reports can have multiple flower types)

## Service Layer Architecture

### bloomReportsService.ts
Centralized API service providing CRUD operations for all data entities:

**Report Operations**:
- `getAllReports()`: Fetch all bloom reports with location and user data
- `getReportsWithPagination()`: Server-side pagination with filtering
- `getReportsForLocationWithPagination()`: Location-specific reports with pagination
- `createReport()`: Create new bloom reports
- `updateReportLikes()`: Update like counts for reports

**Location Operations**:
- `getAllLocations()`: Fetch all available locations
- `createLocation()`: Create new location entries

**User Operations**:
- `createUser()`: Create new user profiles
- `getUserById()`: Fetch user details

### Data Fetching Strategy
- **Backend-Driven Filtering**: All filters applied at database level for performance
- **Server-Side Pagination**: Infinite scroll with offset-based pagination
- **Joined Data**: Reports include related location and user data in single queries
- **Async Operations**: All service methods return Promises for proper async handling

## Type System

### Core Types (BloomReport.ts)
- **BloomReport**: Complete bloom report with all related data
- **Location**: Geographic location with coordinates and intensity data
- **User**: User profile with authentication and social data
- **Flower**: Flower type definitions

### Generated Types
- **Supabase Types**: Auto-generated from database schema
- **Type Safety**: Full TypeScript coverage across all data operations
- **Interface Consistency**: Standardized interfaces for API responses

## Data Flow Architecture

### Read Operations
1. **Component Request** → Custom hook (useReportsData)
2. **Hook Logic** → Service layer (bloomReportsService)
3. **Service Call** → Supabase client
4. **Database Query** → PostgreSQL with joins and filters
5. **Response Processing** → Type-safe data transformation
6. **State Update** → Component re-render with new data

### Write Operations
1. **User Action** → Component event handler
2. **Data Validation** → Client-side validation
3. **Service Call** → bloomReportsService create/update methods
4. **Database Write** → Supabase with proper error handling
5. **State Sync** → Local state updates and cache invalidation

## Performance Optimizations

### Database Level
- **Indexed Queries**: Proper indexing on frequently queried columns
- **Efficient Joins**: Optimized join queries for related data
- **Pagination**: Limit result sets to prevent large data transfers

### Application Level
- **Selective Fetching**: Only fetch required data fields
- **Caching Strategy**: Minimal caching, relying on Supabase optimizations
- **Error Handling**: Consistent error handling patterns across services

## Integration Points

### Supabase Configuration
- **Client Setup**: Configured in `src/integrations/supabase/client.ts`
- **Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Authentication**: Supabase Auth with Facebook integration
- **Storage**: File storage for bloom report images

### Custom Hooks Integration
- **useReportsData**: Manages report fetching with pagination and filtering
- **State Coordination**: Hooks coordinate with service layer for data consistency
- **Loading States**: Proper loading and error state management 