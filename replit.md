# Theory Transformation App

## Overview

This is an AI-powered formal analysis tool for transforming, comparing, and analyzing axiomatic systems. The application provides **10 specialized functions** for working with first-order logic theories.

The app connects to multiple LLM providers (branded as "Zhi 1-4" with no visible provider names) to perform complex logical transformations on user-provided axiomatic theories.

## Current Functions (10 total)

1. **Axiom-Set / Theory Transformation** - Model-to-Model transformation (detects axiom pattern, produces isomorphic model in different domain)
2. **Schema Equivalence** (2 Args) - Model-theoretic sameness check
3. **Definitional Equivalence** (2 Args) - Bi-directional definitional translation with 4-part output
4. **Model-Preserving Rewrite** - Canonical normalization (LANGUAGE + AXIOMS format)
5. **Conservative Extension Analysis** (2 Args) - Check if T₂ is conservative over T₁
6. **Compare Conceptual Schemes** (2 Args) - Compare primitive/derived classifications
7. **Ontological Dependence** - Analyze primitive dependencies
8. **Generate Alternative Conceptualizations** - Produce alternative axiom-sets
9. **Interpret Canonical Meaning** - Identify intended interpretations of primitive symbols
10. **Find an Interpretation** - Find true models across 23 categories in 5 domains

## Recent Changes (Dec 2024)

### Function 1: Complete Rebuild - Model-to-Model Transformation
- Input: Statement-set describing a model (domain + symbol meanings + statements)
- Detects axiom pattern (strict order, equivalence, group, etc.)
- Outputs different but isomorphic model with new domain
- Conversational output format with explicit object mapping

### Function 3: Definitional Equivalence - Rewritten
- 4-part concise output: RESULT, WHY, INTUITIVE EXPLANATION, TRANSLATED AXIOMS
- Shows symbol mapping (R ↦ <)
- No long proofs or jargon

### Function 4: Model-Preserving Rewrite - Canonical Format
- Output: LANGUAGE: {predicates} + numbered AXIOMS list
- Removes unnecessary primitives (constants → existential axioms)
- Minimal vocabulary, no prose, optimized for AI pipelines

### Function 10: Find an Interpretation
- 23 interpretation categories across 5 groups (A-E)
- MANDATORY category enforcement - AI must use specified domain
- Custom output: INTERPRETATION + WHY THIS WORKS

### Function 5: Conservative Extension Analysis - Complete Rewrite
- Now a TWO-ARGUMENT function (Box A = Base Theory T₁, Box B = Extended Theory T₂)
- Correct definition: T₂ conservative iff it proves no NEW theorems in L₁
- Explicit definability is SUFFICIENT but NOT NECESSARY for conservativity
- 3 calibration examples in prompt to guide AI reasoning
- Custom labels: "Base Theory" / "Extended Theory" instead of "System A/B"

### UI Changes
- Functions 2, 3, 5, 6 now have DUAL INPUT boxes
- Model badge shows only "Zhi 1-4" (provider names completely hidden)
- Function 11 removed (duplicate of Function 2)

### Technical Fixes
- Function name normalization strips "(One Argument)" / "(Two Arguments)" suffixes
- Paste normalization for malformed clipboard content
- Dual-input handling with <<<SEPARATOR>>> parsing

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