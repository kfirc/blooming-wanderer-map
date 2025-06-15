# Bloom IL - Project Overview

## Application Purpose
Bloom IL is a flower blooming tracking application for Israel that allows users to report and visualize flower blooming locations across the country.

## Key Features
- **Interactive Map**: Leaflet.js-based map centered on Israel showing bloom report locations
- **Bloom Reporting**: Users can submit reports with location, flower types, images, and descriptions
- **Data Visualization**: Heatmap visualization of bloom intensity across different locations
- **Filtering & Search**: Filter reports by flower type, date range, and location
- **Social Features**: User profiles, likes system, and community-driven content
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## Technical Stack
- **Frontend**: React 18 with TypeScript, Vite build system
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Map Library**: Leaflet.js for interactive mapping
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **Deployment**: Vercel with automatic deployments
- **State Management**: React hooks with custom hook patterns

## User Workflow
1. Users view the interactive map showing bloom report locations
2. Users can click on map markers to see detailed report information
3. Users can filter reports by flower type, date, or location
4. Users can submit new bloom reports with photos and location data
5. Reports are displayed in real-time on the map and in the sidebar

## Data Model
- **BloomReport**: Core entity containing location, user, flower types, images, and metadata
- **Location**: Physical places with coordinates and bloom intensity data
- **User**: User profiles with Facebook authentication and social features

## Current Status
- Fully functional application with map visualization and reporting features
- Deployed to production with Vercel hosting
- Active development with ongoing UI improvements and feature additions 