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
- **Backend**: tRPC for API layer
- **Database**: Supabase with Drizzle ORM
- **Real-time Sync**: Electric SQL for local-first architecture (planned)
- **Workflow Engine**: Inngest for serverless workflow orchestration (planned)
- **Auth**: Supabase Auth with Google OAuth integration
- **Payments**: Stripe integration (planned)
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

### Key Features

- Multi-tenant organization system with user invitations
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

## Product Roadmap

This template is designed for building **real-time, workflow-driven SaaS applications** with local-first architecture. Goal: launch sophisticated SaaS products with complex workflows in days rather than weeks. See `prd.md` for the comprehensive 12-week roadmap.

### Current Implementation Status

- **Authentication**: Google OAuth implemented, email/password and GitHub OAuth needed
- **Real-time Sync**: Not implemented, Electric SQL setup needed for local-first architecture
- **Workflow Engine**: Not implemented, Inngest integration needed for serverless workflows
- **Payments**: Not implemented, comprehensive Stripe integration needed
- **UI**: Basic components, full component library with workflow status UI needed
- **Multi-tenancy**: Basic organization system with email invitations, RBAC needed
- **Offline Support**: Not implemented, 100% offline functionality planned
- **Monitoring**: Sentry + Axiom implemented

### 12-Week Implementation Roadmap

**Phase 1: Foundation (Weeks 1-4)**

- Week 1: Electric SQL setup, local-first architecture, offline support
- Week 2: Complete authentication (GitHub OAuth, email/password, magic links)
- Week 3: Inngest workflow engine, progress tracking, error recovery
- Week 4: Stripe integration, webhook handling, customer portal

**Phase 2: UI/UX & Core Features (Weeks 5-7)**

- Week 5: Complete component library with design system and dark mode
- Week 6: Dashboard templates, workflow status UI, real-time updates
- Week 7: File uploads, background jobs, progress indicators

**Phase 3: Advanced Features (Weeks 8-10)**

- Week 8: RBAC, permissions system, security enhancements
- Week 9: Advanced workflow features, templates, analytics
- Week 10: Real-time collaboration, conflict resolution

**Phase 4: Production Excellence (Weeks 11-12)**

- Week 11: Performance optimization, monitoring dashboards
- Week 12: Feature flags, comprehensive documentation, testing

### Architectural Principles

- **Local-First Real-time**: All data operations work offline with automatic sync
- **Workflow Resilience**: Long-running processes survive server restarts and failures
- **Event-Driven**: Loosely coupled components communicate through events
- **Type Safety First**: End-to-end type safety from database to UI
- **Edge Compatible**: Stateless operations can run on edge infrastructure
- **Observable Systems**: Every operation is traceable and monitorable

### Key Differentiators

- **Local-first architecture** with Electric SQL for automatic sync
- **Serverless workflow orchestration** with Inngest (zero infrastructure)
- **Full offline functionality** (100% feature availability)
- **Real-time collaboration** built-in by design
- **Enterprise-ready** RBAC, audit trails, comprehensive monitoring

### Success Metrics

- Time to MVP: < 7 days (after template completion)
- Workflow reliability: 99.9% completion rate
- Real-time sync latency: < 100ms local, < 1s remote
- Offline functionality: 100% feature availability
- Performance: 90+ Lighthouse score
