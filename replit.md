# Zhi Systems Website

## Overview

This is a React-based single-page website for Zhi Systems that showcases their collection of Living Books and AI-powered applications. The site is built with a modern tech stack focusing on simplicity and direct functionality without unnecessary animations or templates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API**: RESTful API structure (currently minimal)
- **Session Storage**: In-memory storage with planned database integration

### Data Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (via Neon Database serverless)
- **Migrations**: Drizzle Kit for schema management
- **Current State**: Database fully integrated with Drizzle ORM and PostgreSQL backend

## Key Components

### Frontend Components
- **Home Page**: Main landing page displaying all books and applications in organized sections
- **Journal System**: Complete blog system with listing, individual issues, and admin interface
- **UI Components**: Comprehensive set of reusable components from shadcn/ui
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Components
- **Express Server**: Basic server setup with middleware for logging and error handling
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Vite Integration**: Development server integration for hot reloading

### Database Schema
- **Users Table**: Basic user entity with id, username, and password fields
- **Journal Issues Table**: Complete blog system for "Zhi Systems Journal" with volume/issue numbering
- **Schema Location**: `shared/schema.ts` for type sharing between client and server

## Data Flow

1. **Static Content**: All book and application data is hardcoded in the frontend component
2. **Client Routing**: Single-page application with minimal routing (home page and 404)
3. **API Calls**: TanStack Query setup for future API integration
4. **Error Handling**: Centralized error boundary and toast notifications

## External Dependencies

### UI and Styling
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Utility for creating component variants

### Development Tools
- **Replit Integration**: Custom plugins for development environment
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production builds

### Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **Drizzle ORM**: Type-safe database toolkit
- **Drizzle Zod**: Schema validation integration

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/`
2. **Backend Build**: ESBuild compiles TypeScript server to `dist/index.js`
3. **Static Assets**: Served directly by Express in production

### Environment Configuration
- **Development**: `NODE_ENV=development` with Vite dev server
- **Production**: `NODE_ENV=production` serving static files
- **Database**: Configured via `DATABASE_URL` environment variable

### Scripts
- `npm run dev`: Development server with hot reloading
- `npm run build`: Production build for both client and server
- `npm run start`: Production server
- `npm run db:push`: Push database schema changes

### Render Deployment Ready (January 30, 2025)
- **Status**: Fully configured and ready for deployment
- **Configuration**: `render.yaml` with automatic PostgreSQL database setup
- **Build Verified**: Production build successful (416KB frontend, 10.5KB server)
- **Files Created**: Complete deployment configuration and documentation
- **Database**: PostgreSQL integration ready with Drizzle ORM
- **Health Check**: Configured for `/api/journal` endpoint

## Notable Architectural Decisions

### Monorepo Structure
- **Problem**: Need to share types between client and server
- **Solution**: Shared folder with common schema and types
- **Benefit**: Type safety across the full stack

### Database Integration
- **Implementation**: Replaced in-memory storage with PostgreSQL database
- **Date**: January 26, 2025
- **Changes**: Created DatabaseStorage class, added db.ts configuration, pushed schema to database
- **Rationale**: Provides persistent data storage and prepares for production deployment

### Journal System Implementation
- **Implementation**: Complete blog system called "Zhi Systems Journal"
- **Date**: January 27, 2025
- **Features**: Volume/issue numbering with Roman numerals, markdown support, admin interface
- **URL Structure**: `/journal/vol-[roman]/no-[number]` format for SEO-friendly URLs
- **Components**: Journal listing, individual issue pages, admin panel for CRUD operations

### Component Library Choice
- **Decision**: shadcn/ui over pre-built component libraries
- **Rationale**: Provides full control over styling while maintaining accessibility
- **Trade-off**: More setup required but better customization

### Static Content Approach
- **Decision**: Hardcoded book and application data in components
- **Rationale**: Content is relatively static and doesn't require dynamic updates
- **Benefit**: Simplifies architecture and improves performance