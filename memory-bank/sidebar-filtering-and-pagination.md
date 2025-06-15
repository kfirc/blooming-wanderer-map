# Sidebar Filtering and Pagination Architecture (Spring 2025)

## Current State
- `ReportsSection` is a **fully controlled, presentational component**. It receives all filter state and the filtered reports array as props. It does **not** manage any internal state or perform any data fetching.
- **All filter state, pagination, and data fetching now live in the parent** (Sidebar). The parent fetches only the current batch of reports from the backend (using `bloomReportsService.getReportsWithPagination` or `getReportsForLocationWithPagination`), applying all filters (date, flowers, order, etc.) in the database query, and passes the current batch to `ReportsSection` via the `reports` prop.
- **This approach is scalable**: only the needed reports are fetched for the current view, supporting infinite scroll and large datasets.

## Known Technical Debt
- The previous approach of fetching all reports and filtering in-memory has been removed. Filtering and pagination are now backend-driven.
- **Infinite scroll or paging** is implemented in the parent (Sidebar), which manages pagination state (`offset`, `hasMore`, `loadingMore`, etc.) and only passes the current batch of reports to `ReportsSection`.
- This context is critical for future agents: **do NOT reintroduce the anti-pattern of fetching all reports**. Continue to use backend-driven filtering and pagination for scalability and performance.

## Summary for Future Agents
- `ReportsSection` = presentational, receives all state as props (notably `reports`).
- Parent (Sidebar) = owns all filter state, pagination logic, and fetches only the needed reports from the backend.
- **Current best practice:** Filtering and pagination are backend-driven, and only the current batch is passed to the presentational component. 