# Next.js SaaS Template

A comprehensive SaaS template built for **real-time, workflow-driven applications**. Features local-first architecture with offline support, serverless workflow orchestration, and seamless real-time collaboration. Designed to launch sophisticated SaaS products in days rather than weeks.

## Current Features

- **Authentication**: Google OAuth integration
- **Database**: Supabase with Drizzle ORM  
- **Type Safety**: End-to-end with tRPC
- **Monitoring**: Sentry for errors, Axiom for logging
- **Multi-tenancy**: Basic organization system with email invitations
- **Email**: Resend integration with templates

## Planned Tech Stack

- **Real-time Sync**: Electric SQL for local-first architecture
- **Workflow Engine**: Inngest for serverless workflow orchestration
- **Payments**: Stripe integration with webhook handling
- **Offline Support**: 100% functionality available offline
- **Collaboration**: Real-time multi-user collaboration

## 12-Week Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Week 1 - Real-time Infrastructure**
- Electric SQL setup for local-first architecture
- Offline support with automatic sync
- Real-time hooks and sync status UI

**Week 2 - Complete Authentication** 
- GitHub OAuth, email/password, magic links
- Password reset and email verification
- Session management improvements

**Week 3 - Workflow Engine**
- Inngest setup for serverless workflows
- Progress tracking and state persistence
- Error handling and recovery

**Week 4 - Payment System**
- Stripe integration with webhook handling
- Subscription management and customer portal
- Usage tracking and billing

### Phase 2: UI/UX & Core Features (Weeks 5-7) 
**Week 5 - Component Library**
- Complete design system with dark mode
- Form, feedback, and data display components
- Layout components and responsive design

**Week 6 - Dashboard & Templates**
- Dashboard layouts and landing pages
- Workflow status UI with real-time updates
- Mobile-responsive templates

**Week 7 - File & Background Systems**
- File upload with progress tracking
- Background job processing
- Progress indicators and error handling

### Phase 3: Advanced Features (Weeks 8-10)
**Week 8 - RBAC & Security**
- Role-based access control
- Permissions system and audit logging
- Security headers and rate limiting

**Week 9 - Advanced Workflows**
- Workflow templates and parallel execution
- Conditional branching and scheduling
- Human approvals and analytics

**Week 10 - Real-time Collaboration**
- Multi-user real-time collaboration
- Conflict resolution and team management
- Enhanced offline support

### Phase 4: Production Excellence (Weeks 11-12)
**Week 11 - Performance & Scale**
- Performance optimization and caching
- Monitoring dashboards
- API rate limiting

**Week 12 - Operations & Documentation**
- Feature flags and health monitoring
- Comprehensive documentation
- Testing suite and deployment guides

## Key Differentiators
- **Local-first architecture** with automatic sync
- **Serverless workflow orchestration** with zero infrastructure  
- **Full offline functionality** (100% feature availability)
- **Real-time collaboration** built-in
- **Type-safe** from database to UI
- **Enterprise-ready** RBAC, audit trails, comprehensive monitoring

## Success Metrics
- Time to MVP: < 7 days (after template completion)
- Workflow reliability: 99.9% completion rate
- Real-time sync: < 100ms local latency
- Performance: 90+ Lighthouse score
- Offline support: 100% functionality available

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Docker (for local Supabase development)
- A Supabase project (for production)
- Resend account (for emails)

### Environment Variables Setup

This project requires environment variables in two locations:

1. **For the Next.js application** (`apps/web/`):
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. **For Supabase local development** (`packages/crud/`):
   ```bash
   cp packages/crud/.env.example packages/crud/.env
   ```

Then follow the guides below to obtain each set of credentials.

## Environment Variable Procurement Guide

### 1. Database & Supabase

#### Local Development
1. **Important**: Before starting Supabase, you need Google OAuth credentials in `packages/crud/.env`:
   ```bash
   # Add these to packages/crud/.env (can be empty for local development)
   SUPABASE_AUTH_GOOGLE_CLIENT_ID=
   SUPABASE_AUTH_GOOGLE_SECRET=
   ```
2. Start Supabase locally:
   ```bash
   pnpm supabase:start
   ```
3. After startup, you'll see output with your local credentials - add these to `apps/web/.env.local`:
   - `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` will be `postgresql://postgres:postgres@localhost:54322/postgres`

#### Production
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to Settings → Database:
   - Connection string → `DATABASE_URL`


### 2. Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Application type: Web application
6. Add authorized redirect URIs:
   - Local Supabase: `http://localhost:54321/auth/v1/callback`
   - Production Supabase: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret:
   - Client ID → `SUPABASE_AUTH_GOOGLE_CLIENT_ID` (add to `packages/crud/.env`)
   - Client Secret → `SUPABASE_AUTH_GOOGLE_SECRET` (add to `packages/crud/.env`)

### 3. Email Service (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (for production)
3. Go to [API Keys](https://resend.com/api-keys)
4. Create a new API key
5. Copy the key to `RESEND_API_KEY`

### 4. Stripe Payments (Week 4 Implementation)

Comprehensive payment system planned for Week 4:
- Stripe integration with webhook handling
- Subscription management and customer portal
- Multiple pricing tiers and free trials
- Usage-based billing support

### 5. Monitoring (Optional)

#### Axiom
1. Sign up at [axiom.co](https://axiom.co)
2. Create a dataset
3. Go to [Settings → API tokens](https://app.axiom.co/settings/api-tokens)
4. Create a new ingest token
5. Copy token → `NEXT_PUBLIC_AXIOM_TOKEN`

#### Sentry
1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (Next.js)
3. Go to Settings → Projects → [Your Project] → Client Keys
4. Copy DSN → `SENTRY_DSN`

### 6. Slack Integration (Optional)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Add OAuth & Permissions:
   - Redirect URLs: `https://yourdomain.com/api/integrations/slack/callback`
   - Scopes: `chat:write`, `incoming-webhook`
4. From Basic Information:
   - Client ID → `SLACK_CLIENT_ID`
   - Client Secret → `SLACK_CLIENT_SECRET`

## Development

```bash
# Install dependencies
pnpm install

# Start local Supabase
pnpm supabase:start

# Run database migrations
pnpm supabase:db:push

# Start development server
pnpm dev
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables from your `.env` file
4. Deploy

Note: `VERCEL_URL` is automatically set by Vercel, so you don't need `NEXTAUTH_URL` in production on Vercel.

### Other Platforms

Ensure all required environment variables are set in your platform's environment configuration.

## Troubleshooting

### Common Issues

1. **"Invalid environment variables" error**
   - Check that all required variables are set in `.env`
   - Ensure no trailing spaces in values
   - Restart the dev server after changing `.env`

2. **Supabase connection errors**
   - Ensure local Supabase is running: `pnpm supabase:start`
   - Check that the URLs and keys match the output

3. **OAuth redirect errors**
   - Verify redirect URIs match exactly in Google Cloud Console
   - Include both http://localhost:3000 and your production URL

4. **Email sending failures**
   - Verify your domain in Resend for production
   - Check API key permissions

## Security Notes

- Never commit `.env` files to version control
- Rotate `NEXTAUTH_SECRET` regularly in production
- Use different API keys for development and production
- Keep `SUPABASE_SERVICE_ROLE_KEY` secure - it bypasses Row Level Security