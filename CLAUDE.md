# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start all applications (web, chat, convex)
- `pnpm dev:web` - Start only the Next.js web application
- `pnpm dev:convex` - Start only the Convex backend
- `pnpm dev:email` - Start email development server

### Build and Linting
- `pnpm build:web` - Build the web application
- `pnpm build:chat` - Build the chat application
- `pnpm lint` - Run ESLint on the web application (from apps/web directory)

### Database (Supabase + Drizzle)
- `pnpm supabase:start` - Start local Supabase instance
- `pnpm supabase:stop` - Stop local Supabase instance
- `pnpm supabase:db:push` - Push schema changes to database
- `pnpm supabase:db:reset` - Reset database with fresh migrations

### Testing
No test setup detected in the codebase. Tests should be configured before running any test commands.


## Architecture

This is a monorepo SaaS template built with:

### Core Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC for API layer, Convex for real-time features
- **Database**: Supabase with Drizzle ORM
- **Auth**: Supabase Auth with Google OAuth integration
- **Email**: Resend for transactional emails
- **Monitoring**: Sentry for error tracking, Axiom for logging

### Monorepo Structure
The project uses pnpm workspaces with the following structure:

**Apps:**
- `apps/web` - Main Next.js SaaS application
- `apps/chat` - Svelte chat application

**Packages:**
- `@superscale/crud` - Database layer with Drizzle ORM and Supabase
- `@superscale/trpc` - tRPC router and client configuration
- `@superscale/convex` - Convex functions for real-time features
- `@superscale/lib` - Shared utilities, auth helpers, Supabase clients
- `@superscale/ui` - Shared UI components built with Radix UI
- `@superscale/email` - Email templates using React Email
- `@superscale/editor` - Rich text editor components
- `@superscale/eslintconfig` - Shared ESLint configurations
- `@superscale/tsconfig` - Shared TypeScript configurations
- `@superscale/twconfig` - Shared Tailwind CSS configuration

### Key Features
- Multi-tenant organization system with user invitations
- Slack integration for notifications/webhooks
- MDX-based blog system
- Responsive dashboard with data tables
- Email templates and magic link authentication

### Authentication Flow
The app uses Supabase Auth with:
- Email/password and magic link authentication
- Google OAuth integration
- Session management via middleware
- Organization-based access control

### Database Schema
Uses Drizzle ORM with Supabase PostgreSQL:
- Users, organizations, and memberships
- Invitation system for team collaboration
- Integration configurations (Slack)

### API Architecture
- tRPC for type-safe API calls between frontend and backend
- Convex for real-time features and WebSocket connections
- REST API routes for webhooks (Slack)
- Server-side authentication context

### Environment Configuration
Key environment variables managed through Zod schemas:
- Database: `DATABASE_URL`
- Auth: `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`
- Email: `RESEND_API_KEY`
- Integrations: Slack credentials
- Monitoring: `NEXT_PUBLIC_AXIOM_TOKEN`

### Development Notes
- All packages are TypeScript with strict configuration
- Uses workspace dependencies prefixed with `@superscale/`
- Next.js configured with SVG-as-React-components via SVGR
- Tailwind CSS with shared design system via `@superscale/ui`
- Middleware handles Supabase session management across all routes