# Ananse: The Golden Deception

## Overview

This is a mobile-first interactive serial novel reading platform for "Ananse: The Golden Deception" by Alfred Opare Saforo. Users can create accounts, log in, and read serialized chapters as the author publishes daily. The application features a distraction-free reading experience with progress tracking, customizable reader settings (font size, themes), and an admin publishing workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: Zustand with persist middleware for local settings and progress tracking
- **Data Fetching**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables for Light/Dark/Sepia reading modes
- **Animations**: Framer Motion for scroll progress and UI transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API under `/api/*` routes
- **Build**: esbuild for server bundling, Vite for client bundling

### Authentication
- **Provider**: Replit Auth integration using OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **User Roles**: "reader" (default) and "admin" roles stored in profiles table

### Database
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**:
  - `users` - Authentication users (required for Replit Auth)
  - `sessions` - Session storage (required for Replit Auth)
  - `profiles` - Extended user data with roles
  - `chapters` - Story chapters with content, status, ordering
  - `reading_progress` - Per-user reading position and completion tracking

### Key Design Patterns
- **Shared Schema**: Database schema and Zod validation types are shared between client and server via `@shared/*` path alias
- **Storage Interface**: `IStorage` interface abstracts database operations for easier testing
- **Mobile-First**: UI designed for phone screens with responsive scaling to larger devices
- **Progressive Web App**: Includes web app manifest and service worker readiness for offline support

## External Dependencies

### Database
- PostgreSQL database via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations (`npm run db:push`)

### Authentication
- Replit OpenID Connect provider (`ISSUER_URL` defaults to `https://replit.com/oidc`)
- Requires `REPL_ID` and `SESSION_SECRET` environment variables

### Third-Party Services
- Google Fonts: Inter, Libre Baskerville, Source Serif 4 for typography
- No external analytics or payment services currently integrated

### Key NPM Packages
- `react-markdown` - Markdown rendering for chapter content
- `vaul` - Mobile drawer component
- `embla-carousel-react` - Carousel functionality
- `zustand` - Client state management
- `framer-motion` - Animation library