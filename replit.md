# Overview

This is a comprehensive accounting and business management ERP system inspired by Turkey's Logo Tiger 3 software. The application is built as a modern full-stack web application using TypeScript, React, Express.js, and PostgreSQL with Drizzle ORM. It provides complete accounting functionality including chart of accounts, journal entries, supplier/customer management, purchase/sales orders, subcontractor management, and financial reporting with interactive dashboards.

## Recent Changes (August 2025)
- ✅ Successfully migrated from NeonDB to Supabase PostgreSQL database with IPv4 configuration
- ✅ Removed all NeonDB dependencies and references from codebase
- ✅ Fixed DATABASE_URL connectivity issues and session storage configuration
- ✅ Resolved Select component error in PageFormModal (empty value prop issue)
- ✅ Fixed "Yeni Sayfa Ekle" (Add New Page) functionality in sidebar context menu
- ✅ Database authentication and session management working properly
- ✅ All menu page CRUD operations (create, read, update, delete) fully functional
- ✅ Right-click context menu for sidebar page management working correctly

# User Preferences

Preferred communication style: Simple, everyday language.
Technical notes: Server environment only supports IPv4 connections.

# System Architecture

## Frontend Architecture
The client-side is built with **React 18** using functional components and hooks, with **Vite** as the build tool for fast development and optimized production builds. The UI is constructed using **shadcn/ui** components built on top of **Radix UI primitives** and styled with **Tailwind CSS**. State management is handled through **TanStack Query (React Query)** for server state and built-in React hooks for local state. Navigation is implemented using **Wouter** as a lightweight client-side router.

## Backend Architecture
The server uses **Express.js** with TypeScript in ESM format, following a modular route-based architecture. All routes are centralized in `server/routes.ts` with middleware for authentication, logging, and error handling. The application implements a storage pattern through `server/storage.ts` that abstracts database operations, making the codebase more maintainable and testable.

## Database Design
The system uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database interactions. The schema follows Turkish accounting standards with comprehensive tables for:
- Chart of accounts with hierarchical structure
- Double-entry journal system with entries and line items
- Customer and supplier management with detailed contact information
- Purchase and sales order workflows with line items
- Subcontractor management with time tracking
- Bank guarantees and credit management
- Multi-currency support with TRY as default

## Authentication System
Authentication is implemented using **Replit's OIDC (OpenID Connect)** integration with **Passport.js**. Sessions are stored in PostgreSQL using **connect-pg-simple** with a 7-day TTL. The system includes role-based access control with user roles (user, accountant, manager, admin) stored in the users table.

## UI/UX Architecture
The interface follows a dashboard-based layout with a collapsible sidebar navigation and responsive design. Components use a consistent design system with CSS custom properties for theming, supporting both light themes with a neutral color palette. Data visualization is implemented using **Chart.js** for financial charts and **Tabulator** for interactive data tables with features like sorting, filtering, and editing.

## Build and Deployment
The application uses a monorepo structure with shared TypeScript types and schemas. The build process compiles the React frontend with Vite and bundles the Express server with esbuild. The development environment includes hot module replacement and error overlays, while production builds are optimized for performance with code splitting and asset optimization.

# External Dependencies

## Database Services
- **Supabase**: Serverless PostgreSQL hosting platform for all application data
- **Drizzle ORM**: Type-safe database operations and migrations

## Authentication Services
- **Replit OIDC**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express.js

## UI Component Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling

## Data Visualization
- **Chart.js**: JavaScript charting library for financial dashboards
- **Tabulator**: Interactive table library for data grids

## Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migration and introspection tool
- **ESBuild**: JavaScript bundler for server-side code
- **TypeScript**: Type-safe JavaScript development

## Runtime Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and management
- **date-fns**: Date manipulation and formatting
- **Zod**: Runtime type validation and schema definition