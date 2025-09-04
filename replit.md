# Zhi Systems Website

## Overview

This React-based single-page website showcases Zhi Systems' Living Books and AI-powered applications. It focuses on simplicity, direct functionality, and a modern tech stack to highlight their offerings, including an interactive journal system with AI-powered features. The project aims to provide persistent data storage and a robust platform for their intellectual property.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Design**: Mobile-first, responsive, minimal animations, direct functionality.
- **Components**: Home Page, Journal System (listing, individual issues, admin), reusable shadcn/ui components.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API**: RESTful (minimal, designed for future expansion)
- **Session Storage**: In-memory (planned database integration)

### Data Management
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon Database serverless)
- **Migrations**: Drizzle Kit
- **Schema**: Shared `shared/schema.ts` for type consistency across client and server (monorepo structure).
- **Data Flow**: Static content for books/apps, client-side routing, TanStack Query for future API calls, centralized error handling.

### Key Features
- **Journal System**: Full blog system ("Zhi Systems Journal") with volume/issue numbering (Roman numerals), markdown support, and an admin interface.
  - **AI Features**: Text selection and full-article analysis via 8 AI-powered functions (rewrite, study guides, tests, podcasts, visual cognitive maps, thesis analysis, deep dives, suggested readings, summary + thesis).
  - **Audio**: OpenAI TTS-1 integration with Alloy voice for podcast generation.
  - **Download Functionality**: Ability to download all AI-generated content (text as .txt, audio as .mp3) with structured formatting and auto-generated filenames.
  - **Current Status**: 22 issues across 19 volumes (as of September 2025), featuring interdisciplinary research in philosophy, cognitive science, political analysis, psychology, film studies, and AI studies.
  - **Recent Volumes**: Volume XVII - "The Psychodynamics of Mass Violence: Sexuality, Aggression, and the Khmer Rouge" (psychological analysis of violence patterns); Volume XVIII - "Friction and Error-Tolerance: How Human Prose Differs from AI Prose" (cognitive science analysis distinguishing human from AI writing engines); Volume XIX - "Podsters and Bureaucrats: On Agency, Identity, and the Horror of Absorption" (cultural analysis connecting Invasion of the Body Snatchers to bureaucratic psychology and modern institutional thinking).
- **Deployment**: Configured for Render, including all dependencies and PostgreSQL setup.

### Architectural Decisions
- **Monorepo**: Shared folder for client/server types.
- **Database Integration**: Shifted from in-memory to PostgreSQL for persistent storage.
- **Component Library**: Chose shadcn/ui for control over styling and accessibility, accepting higher setup.
- **Static Content**: Hardcoded book and application data due to their static nature, simplifying architecture.

## External Dependencies

### UI and Styling
- **Radix UI**: Unstyled, accessible UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Class Variance Authority**: Utility for creating component variants.

### Development Tools
- **Replit Integration**: Custom plugins.
- **TypeScript**: For type safety.
- **ESBuild**: Fast JavaScript bundler.

### Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client.
- **Drizzle ORM**: Type-safe database toolkit.
- **Drizzle Zod**: Schema validation integration.

### AI/Content Generation
- **OpenAI TTS-1**: Text-to-speech for audio generation.