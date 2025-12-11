# Theory Transformation App

## Overview

This is an AI-powered formal analysis tool for transforming, comparing, and analyzing axiomatic systems. The application provides 11 specialized functions for working with first-order logic theories, including theory transformation, schema equivalence checking, definitional equivalence analysis, model finding, and theorem equivalence comparison.

The app connects to multiple LLM providers (branded as "Zhi 1-4" internally mapping to Grok/xAI, Claude/Anthropic, OpenAI, and DeepSeek) to perform complex logical transformations on user-provided axiomatic theories.

## Recent Changes (Dec 2024)

### Function 9: Renamed to "Interpret Canonical Meaning"
- Identifies intended interpretations of primitive symbols
- Restates axioms using explicit natural-language primitives

### Function 10: "Find an Interpretation" - Complete Rebuild
- 23 interpretation categories across 5 groups:
  - A. Abstract/Formal: Mathematical, Computational, Philosophical
  - B. Natural Sciences: Physical (everyday), Physics (science), Chemical, Biological
  - C. Human/Social/Cultural: Economic, Social, Psychological, Linguistic, Organizational, Geographical, Home Economics
  - D. Engineering & Systems: Engineering, Network
  - E. Finance/Markets: Market Microstructure, Portfolio & Risk, Credit & Fixed-Income, M&A/Corporate, Derivatives, Private Equity/LBO, Macro/Intermarket
- Custom output format: INTERPRETATION + WHY THIS WORKS (not the default 5-section format)
- Failure case handling (A-D): Never returns empty, always provides constructive result

### Function 11: "Determine Equivalence" - Fixed
- Now gives clear VERDICT at top: EQUIVALENT or NOT EQUIVALENT
- Shows relationship classification: A ⊂ B, B ⊂ A, OVERLAPPING, or DISJOINT
- Custom output format with VERDICT, RELATIONSHIP, ANALYSIS, EXPLANATION

### Technical Fixes
- Function name normalization in buildPrompt() to strip "(One Argument)" / "(Two Arguments)" suffixes
- Paste normalization for input textareas (handles malformed clipboard content from PDFs/Word)
- System prompt updated to allow function-specific output formats to override default 5-section format

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, React useState for local state
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables (Swiss/Rationalist design)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx
- **API Design**: RESTful endpoints under `/api/` prefix
- **Key Endpoints**:
  - `POST /api/process` - Sends theory + instructions to LLM for transformation
  - `POST /api/chat` - Chat interface for conversational AI assistance

### AI Integration Layer
- **Multi-provider support**: OpenAI, Anthropic, xAI (Grok), DeepSeek
- **Provider abstraction**: Unified interface that routes to appropriate SDK based on selected model
- **Model naming**: Internal branding uses "Zhi 1-4" which maps to different providers
- **Prompt engineering**: Specialized prompts for theory transformation with paradigm examples

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema location**: `shared/schema.ts`
- **Current tables**: Users table for authentication (basic schema)
- **Session storage**: In-memory storage currently used (MemStorage class)

### Build System
- **Development**: Vite dev server for frontend, tsx for backend
- **Production**: Custom build script using esbuild for server bundling, Vite for client
- **Output**: `dist/` directory with `index.cjs` (server) and `public/` (client assets)

## External Dependencies

### AI/LLM Providers
- **OpenAI API**: GPT models via `openai` package
- **Anthropic API**: Claude models via `@anthropic-ai/sdk` package
- **xAI API**: Grok models via OpenAI-compatible endpoint at `api.x.ai`
- **DeepSeek API**: DeepSeek models via OpenAI-compatible endpoint at `api.deepseek.com`

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` or `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API access
- `ANTHROPIC_API_KEY` or `AI_INTEGRATIONS_ANTHROPIC_API_KEY` - Anthropic API access
- `XAI_API_KEY` - xAI/Grok API access
- `DEEPSEEK_API_KEY` - DeepSeek API access

### Database
- **PostgreSQL**: Required for production, uses Drizzle ORM
- **Migrations**: Stored in `migrations/` directory, run via `drizzle-kit push`

### Key NPM Packages
- `drizzle-orm` + `drizzle-zod` - Database ORM and validation
- `express` + `express-session` - HTTP server and sessions
- `@tanstack/react-query` - Async state management
- `wouter` - Client-side routing
- Full Radix UI primitive set for accessible components