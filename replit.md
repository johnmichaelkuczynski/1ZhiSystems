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

### Render Deployment Ready (August 19, 2025)
- **Status**: Deployment issue resolved - missing Vite and ESBuild dependencies fixed
- **Configuration**: `render.yaml` with all required environment variables and PostgreSQL setup
- **Build Fixed**: Added missing Vite and ESBuild dependencies that were causing deployment failures
- **Build Verified**: Production build successful (508KB frontend, 50.6KB server)
- **Files Created**: Complete deployment configuration, documentation, and setup guide
- **Database**: PostgreSQL integration ready with Drizzle ORM
- **Health Check**: Configured for `/api/journal` endpoint
- **Environment**: Added graceful API key handling with proper error messages
- **Documentation**: Created `DEPLOYMENT_SETUP.md` with comprehensive deployment instructions

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
- **Implementation**: Complete blog system called "Zhi Systems Journal" with AI-powered interactive features
- **Date**: January 27, 2025 (Updated August 8, 2025)
- **Audio Migration**: August 8, 2025 - Migrated from Azure Speech Services to OpenAI TTS-1 model with Alloy voice support
- **Features**: Volume/issue numbering with Roman numerals, markdown support, admin interface
- **URL Structure**: `/journal/vol-[roman]/no-[number]` format for SEO-friendly URLs
- **Components**: Journal listing, individual issue pages, admin panel for CRUD operations
- **AI Features**: Text selection with 8 AI-powered functions (rewrite, study guides, tests, podcasts, visual cognitive maps, thesis analysis, deep dives, suggested readings)
- **Full Article Processing**: August 22, 2025 - Complete suite of 8 full-article analysis buttons implemented:
  - **CREATE FULL PODCAST** (orange) - Configurable audio generation with OpenAI TTS-1
  - **CREATE FULL COGNITIVE MAP** (purple) - Visual knowledge mapping of entire article
  - **CREATE FULL STUDY GUIDE** (green) - Comprehensive study materials generation
  - **CREATE FULL REWRITE** (blue) - Article rewriting with customizable parameters
  - **CREATE FULL TEST** (red) - Assessment creation from complete content
  - **CREATE FULL SUGGESTED READINGS** (yellow) - Related resource recommendations
  - **CREATE FULL SUMMARY + THESIS** (cyan) - Executive summary with thesis analysis
  - **CREATE THESIS DEEP DIVE** (indigo) - In-depth thesis argument examination
  - **UI Design**: Compact button layout with shortened labels, small icons (12px), and color-coded functionality to prevent page overflow
- **Download Functionality**: August 22, 2025 - Complete download system for all AI-generated content:
  - **Text Downloads**: All analysis results can be downloaded as formatted .txt files
  - **Audio Downloads**: Podcast audio files downloadable as .mp3 format
  - **File Naming**: Auto-generated filenames include article title for organization
  - **Content Types**: Cognitive maps, study guides, rewrites, test questions/results, suggested readings, summary+thesis, and thesis deep dives
  - **Format Structure**: Professional formatting with headers, sections, and proper text organization
  - **User Experience**: Download buttons (📥) positioned next to existing copy buttons for seamless workflow
- **Content**: Fifteen published issues across thirteen volumes:
  - **Volume I**: "On the Optimal Number of Truth Values", "The Incompleteness of Logic", "Veblen Utility Functions" (13-chapter analysis), "The Tarski's World Problem"
  - **Volume II**: "McTaggart's Proof of the Unreality of Time: A Refutation"  
  - **Volume III**: "Markets, Value, and the Myth of Worth-as-Wage" (complete with abstract, keywords, and academic formatting)
  - **Volume IV**: "Conspicuous Asceticism: A Veblenian Analysis of Self-Abasement as Status Display" (extending Veblen's theory to ascetic practices)
  - **Volume V**: "Zen as Pseudo-Boot Camp: A Clinical and Cultural Analysis" (examining Zen monastic practice through clinical and cultural lens)
  - **Volume VI**: "Law as Prosthesis, Law as Prison: Cognitive Divergence in Legal Education and Practice" (analyzing how legal education affects different cognitive types)
  - **Volume VII**: "Fiction, Translation, and the Perceptualization of Judgment" (literary theory examining Kafka and the nature of artistic representation)
  - **Volume VIII**: "Is Love Blind, or Does It See Differently? On the Epistemic Status of Love" (epistemological analysis of love as a form of perception)
  - **Volume IX**: "The Myth of the Gettier Problem: Why 'No False Lemmas' Was Never Refuted" (critical analysis of epistemological counterexamples to the no false lemmas condition)
  - **Volume X**: "Naturalized Epistemology and Its Aftermath: Why the Rejection Was Premature" (defending Quine's naturalized epistemology program against traditional objections)
  - **Volume XI**: "The Collapse of Logical Form: Why Grammar, Not FOL, Guides Reasoning" (critique of logical form theory in favor of grammatical inference patterns)
  - **Volume XII**: "Morality as Coalition Software" (functional analysis of moral codes as group coordination mechanisms)
  - **Volume XIII**: "Truth Without Teeth: A Post-Philosophy Critique of Crispin Wright" (critique of Wright's minimalist truth theory and neo-Fregean program)
- **Audio System**: OpenAI TTS-1 integration with Alloy voice support, automatic audio generation for all podcasts, saved to public/audio directory
- **URL Updates**: August 22, 2025 - Updated Intelligence Meter application URL from intelligencemeter.biz to intelligencemeter.xyz in Core Applications section

## Recent Changes

### September 3, 2025
- **Journal Content**: Added Volume XII, Issue 1 - "Morality as Coalition Software" (functional analysis of moral codes as group coordination mechanisms)
- **Journal Content**: Added Volume XIII, Issue 1 - "Truth Without Teeth: A Post-Philosophy Critique of Crispin Wright" (comprehensive critique of Wright's minimalist truth theory and neo-Fregean program with detailed examples throughout)
- **Branding Update**: Changed Living Books section header from "By Kuczynski / Zhi Systems" to "By Zhi Systems"
- **Content Enhancement**: Updated Volume XIII article with enhanced formatting, proper paragraph breaks, and extensive "For example:" clauses to illustrate philosophical points
- **Bug Fix**: Resolved formatting issues in journal article display to ensure proper paragraph structure and readability

### August 30, 2025
- **Journal Content**: Added Volume VIII, Issue 1 - "Is Love Blind, or Does It See Differently? On the Epistemic Status of Love" (epistemological analysis of love as a form of perception)
- **Journal Content**: Added Volume IX, Issue 1 - "The Myth of the Gettier Problem: Why 'No False Lemmas' Was Never Refuted" (critical analysis of epistemological counterexamples)
- **Journal Content**: Added Volume X, Issue 1 - "Naturalized Epistemology and Its Aftermath: Why the Rejection Was Premature" (defending Quine's naturalized epistemology program)
- **Journal Content**: Added Volume XI, Issue 1 - "The Collapse of Logical Form: Why Grammar, Not FOL, Guides Reasoning" (critique of logical form theory in favor of grammatical inference patterns)
- **Living Books Update**: Added "Russell's Mathematical Philosophy (Second Edition)" at mathematicalphilosophy.xyz to the Kuczynski/Zhi Systems collection (now 22 total books)
- **Core Applications Update**: Added "HTML Converter" at htmlconverter.xyz to the applications list (now 19 total apps)
- **Bug Fix**: Removed duplicate "Cognitive Enhancer" entries that were causing React key warnings
- **Bug Fix**: Extended Roman numeral conversion function to support Volume XI (xi = 11) and beyond, fixing issue where new articles wouldn't display

### Component Library Choice
- **Decision**: shadcn/ui over pre-built component libraries
- **Rationale**: Provides full control over styling while maintaining accessibility
- **Trade-off**: More setup required but better customization

### Static Content Approach
- **Decision**: Hardcoded book and application data in components
- **Rationale**: Content is relatively static and doesn't require dynamic updates
- **Benefit**: Simplifies architecture and improves performance