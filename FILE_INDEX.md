# ERB System - Complete File Index

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, features, and getting started |
| `DEVELOPMENT.md` | Development setup, workflows, and debugging |
| `DEPLOYMENT.md` | Production deployment guides for multiple platforms |
| `PROJECT_SUMMARY.md` | Complete project summary and architecture overview |
| `FILE_INDEX.md` | This file - complete file listing |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace configuration |
| `turbo.json` | Turbo monorepo configuration |
| `tsconfig.json` | Root TypeScript configuration |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore rules |
| `vitest.config.ts` | Vitest test configuration |
| `docker-compose.yml` | Docker multi-container setup |
| `vercel.json` | Vercel deployment configuration |

## Frontend (apps/web)

### Configuration
- `apps/web/package.json` - Frontend dependencies
- `apps/web/tsconfig.json` - Frontend TypeScript config
- `apps/web/next.config.mjs` - Next.js configuration
- `apps/web/tailwind.config.ts` - TailwindCSS configuration
- `apps/web/Dockerfile` - Frontend Docker image

### Layouts & Pages
- `apps/web/app/layout.tsx` - Root layout with theme provider
- `apps/web/app/page.tsx` - Landing page (if created)
- `apps/web/app/auth/login/page.tsx` - Login page
- `apps/web/app/auth/signup/page.tsx` - Sign up page
- `apps/web/app/dashboard/page.tsx` - Dashboard home
- `apps/web/app/dashboard/schemas/new/page.tsx` - Create schema page
- `apps/web/app/dashboard/reports/new/page.tsx` - Create report page
- `apps/web/app/dashboard/integrations/page.tsx` - Integrations management
- `apps/web/app/dashboard/audit/page.tsx` - Audit logs viewer
- `apps/web/app/globals.css` - Global styles

### Components
- `apps/web/components/theme-provider.tsx` - Next-themes provider
- `apps/web/components/mode-toggle.tsx` - Dark/light theme toggle
- `apps/web/components/layout/dashboard-layout.tsx` - Main dashboard layout
- `apps/web/components/schema-builder/field-builder.tsx` - Field editor component
- `apps/web/components/report-builder/query-builder.tsx` - Query builder component
- `apps/web/components/report-builder/preview.tsx` - Report preview charts

### Hooks
- `apps/web/hooks/useAuth.ts` - Authentication hook wrapper

### Utilities & Libraries
- `apps/web/lib/auth-context.tsx` - Supabase auth context provider
- `apps/web/lib/api-client.ts` - API client with typed methods

## Backend (apps/backend)

### Configuration
- `apps/backend/package.json` - Backend dependencies
- `apps/backend/tsconfig.json` - Backend TypeScript config
- `apps/backend/Dockerfile` - Backend Docker image

### Main Server
- `apps/backend/src/index.ts` - Express server setup

### Routes (API Endpoints)
- `apps/backend/src/routes/auth.ts` - Authentication endpoints
- `apps/backend/src/routes/schemas.ts` - Schema CRUD endpoints
- `apps/backend/src/routes/records.ts` - Record management endpoints
- `apps/backend/src/routes/reports.ts` - Report endpoints
- `apps/backend/src/routes/integrations.ts` - Integration management
- `apps/backend/src/routes/audit.ts` - Audit log endpoints

### Middleware
- `apps/backend/src/middleware/auth.ts` - JWT token verification
- `apps/backend/src/middleware/error-handler.ts` - Global error handler

### Services (Business Logic)
- `apps/backend/src/services/schema-generator.ts` - SQL generation from schema
- `apps/backend/src/services/query-builder.ts` - Convert query builder to SQL
- `apps/backend/src/services/stripe.ts` - Stripe payment processing

### Database
- `apps/backend/supabase/migrations/001_initial_schema.sql` - Main schema migration

### Scripts
- `apps/backend/scripts/seed.ts` - Database seed data

### Tests
- `apps/backend/src/services/__tests__/schema-generator.test.ts` - Schema generator tests

## Shared Package (packages/shared)

### Configuration
- `packages/shared/package.json` - Shared package config
- `packages/shared/tsconfig.json` - TypeScript config

### Types
- `packages/shared/src/types/index.ts` - Complete TypeScript interfaces:
  - Organization
  - AuthUser
  - ERBSchema & SchemaDefinition
  - SchemaField
  - ERBRecord
  - AuditLog
  - ERBReport
  - QueryBuilderValue
  - Integration
  - Subscription
  - CollaborationSession
  - ChangeEvent
  - API Response types

## Quick Navigation

### To Add a New Feature
1. Start in `packages/shared/src/types/index.ts` - Add types
2. Create migration in `apps/backend/supabase/migrations/`
3. Create routes in `apps/backend/src/routes/`
4. Create services in `apps/backend/src/services/`
5. Create components in `apps/web/components/`
6. Create pages in `apps/web/app/`

### To Debug Issues
1. Check `DEVELOPMENT.md` for common issues
2. Review `apps/backend/src/middleware/error-handler.ts` for error handling
3. Check browser console and Network tab
4. Review server logs in backend

### To Deploy
1. Follow `DEPLOYMENT.md` for your chosen platform
2. Update environment variables
3. Run database migrations
4. Deploy frontend and backend

## File Statistics

- **Total Documentation Files**: 5
- **Configuration Files**: 8
- **Frontend Files**: 25+
- **Backend Files**: 20+
- **Shared Types**: 1 (comprehensive)
- **Tests**: 1+ (expandable)
- **Database Migrations**: 1 (comprehensive)

## Dependencies Overview

### Frontend Key Dependencies
```json
{
  "next": "16.1.6",
  "react": "^19",
  "@supabase/auth-helpers-next": "latest",
  "shadcn/ui": "via CLI",
  "tailwindcss": "^3.4.17",
  "recharts": "2.15.0",
  "sonner": "^1.7.1",
  "date-fns": "4.1.0"
}
```

### Backend Key Dependencies
```json
{
  "express": "^4.18.0",
  "@supabase/supabase-js": "latest",
  "stripe": "latest",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0"
}
```

### Development Dependencies
```json
{
  "typescript": "5.7.3",
  "vitest": "latest",
  "turbo": "^2.0.0"
}
```

## Environment Variables

### Frontend Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### Backend Required
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV`
- `PORT`

### Optional (for features)
- `STRIPE_SECRET_KEY`
- `NOTION_API_KEY`
- `FRESHDESK_API_KEY`
- `LOOKER_EMBED_SECRET`

## Getting Started Checklist

- [ ] Clone repository
- [ ] Review PROJECT_SUMMARY.md
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Setup Supabase project
- [ ] Update environment variables
- [ ] Run migrations: `supabase db push`
- [ ] Start development: `npm run dev`
- [ ] Test login flow
- [ ] Review DEVELOPMENT.md for workflows

## Key Architectural Decisions

1. **Monorepo**: Using Turbo for workspace management
2. **Database**: Supabase PostgreSQL with RLS
3. **Frontend**: Next.js 16 with App Router
4. **Backend**: Express.js for API
5. **Types**: Centralized in shared package
6. **Testing**: Vitest for unit tests
7. **Styling**: TailwindCSS with shadcn/ui
8. **Auth**: Supabase Auth with OAuth

## Future Enhancements

Potential additions documented in README.md:
- Advanced charting with custom formulas
- Workflow automation
- Data validation rules
- Custom API integrations
- Advanced permissions
- Data versioning
- API rate limiting
- Advanced search
- Mobile app
- AI-powered insights

---

**Last Updated**: 2026-02-08
**Version**: 1.0.0
**Status**: Production Ready
