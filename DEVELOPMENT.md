# Development Guide

This guide covers setting up your development environment and contributing to the ERB system.

## Development Environment Setup

### System Requirements
- Node.js 20.x or higher
- npm or yarn
- PostgreSQL 15+ (for local development)
- Docker & Docker Compose (optional but recommended)

### Local Setup

1. **Clone and install**
```bash
git clone <repo-url>
cd erb-system
npm install
```

2. **Setup Supabase locally (optional)**
```bash
# Install Supabase CLI
npm install -g supabase

# Create local Supabase instance
supabase start

# In another terminal, link to your project
supabase link --project-ref <your-project-id>
```

3. **Initialize environment**
```bash
cp .env.example .env.local
```

4. **Start development servers**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Architecture Overview

### Frontend (Next.js 16)
- **App Router**: Modern React routing with server components
- **Components**: Reusable shadcn/ui components
- **Hooks**: Custom hooks for auth, data fetching
- **State Management**: React Context + Hooks
- **API Layer**: `lib/api-client.ts` for backend communication

### Backend (Express.js)
- **Routes**: RESTful API endpoints organized by resource
- **Services**: Business logic and data transformation
- **Middleware**: Authentication and error handling
- **Database**: Supabase with RLS for security

### Database (Supabase PostgreSQL)
- **RLS**: Row Level Security for multi-tenant isolation
- **Audit**: Complete audit trail of all changes
- **Real-time**: Supabase Realtime for live updates

## Workflow Examples

### Adding a New Feature

1. **Create database schema** (if needed)
```sql
-- apps/backend/supabase/migrations/XXX_feature.sql
CREATE TABLE feature_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  ...
);

ALTER TABLE feature_table ENABLE ROW LEVEL SECURITY;
```

2. **Push migration**
```bash
supabase db push
```

3. **Update shared types**
```typescript
// packages/shared/src/types/index.ts
export interface Feature {
  id: string;
  org_id: string;
  // ...
}
```

4. **Create backend API route**
```typescript
// apps/backend/src/routes/features.ts
import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feature_table')
      .select('*')
      .eq('org_id', req.user!.org_id);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
```

5. **Add to main server**
```typescript
// apps/backend/src/index.ts
import featuresRoutes from './routes/features';
app.use('/api/features', authMiddleware, featuresRoutes);
```

6. **Create frontend page**
```typescript
// apps/web/app/dashboard/features/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function FeaturesPage() {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    api.getFeatures().then(setFeatures);
  }, []);

  return (
    <div>
      {features.map(feature => (
        <div key={feature.id}>{feature.name}</div>
      ))}
    </div>
  );
}
```

7. **Add API client methods**
```typescript
// apps/web/lib/api-client.ts
getFeatures: () => apiRequest('/api/features'),
createFeature: (data: any) =>
  apiRequest('/api/features', { method: 'POST', body: data }),
```

### Debugging

#### Frontend Debugging
```typescript
// Use browser DevTools
console.log("[v0] Debug info:", variable);

// React DevTools extension
// Network tab to inspect API calls
```

#### Backend Debugging
```bash
# Run with debug logging
DEBUG=* npm run dev --workspace=@erb/backend

# Use VSCode debugger
# Add breakpoint and run with debugger
node --inspect-brk apps/backend/dist/index.js
```

#### Database Debugging
```bash
# Connect to Supabase directly
supabase db start

# Use SQL Editor in Supabase dashboard
# Run raw SQL queries
SELECT * FROM audit_logs LIMIT 10;
```

## Code Organization

### Frontend Structure
```
apps/web/
├── app/               # Next.js App Router
│   ├── auth/         # Auth pages (login, signup)
│   ├── dashboard/    # Protected dashboard routes
│   ├── page.tsx      # Landing page
│   ├── layout.tsx    # Root layout
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   └── ...
├── hooks/           # Custom React hooks
├── lib/             # Utilities
│   ├── api-client.ts
│   └── auth-context.tsx
└── public/          # Static assets
```

### Backend Structure
```
apps/backend/
├── src/
│   ├── routes/       # API route handlers
│   ├── services/     # Business logic
│   ├── middleware/   # Express middleware
│   ├── types/        # Local TypeScript types
│   └── index.ts      # Server entry point
├── scripts/          # Seed data, utilities
└── supabase/
    └── migrations/   # Database migrations
```

## Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test schema-generator.test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Example Test
```typescript
import { describe, it, expect } from 'vitest';
import { generateTableSchema } from '../schema-generator';

describe('Schema Generator', () => {
  it('should generate valid SQL', () => {
    const result = generateTableSchema('Test', { fields: [] });
    expect(result.tableName).toBe('test');
  });
});
```

### API Testing
```typescript
// Use curl for quick testing
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/schemas

// Or use REST Client extension in VSCode
GET http://localhost:3001/api/schemas
Authorization: Bearer {{token}}
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env.local)
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NODE_ENV=development
PORT=3001
```

## Git Workflow

1. **Create feature branch**
```bash
git checkout -b feature/my-feature
```

2. **Make changes and commit**
```bash
git add .
git commit -m "feat: add my feature"
```

3. **Push and create PR**
```bash
git push origin feature/my-feature
```

4. **Merge after review**

## Performance Tips

- Use React DevTools Profiler to identify slow components
- Monitor network requests in DevTools Network tab
- Check database query performance in Supabase dashboard
- Use Lighthouse for frontend performance audit

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Supabase Auth Issues
- Clear cookies: DevTools → Application → Cookies
- Check Supabase redirect URLs in dashboard
- Verify OAuth app configuration

### Database Connection Issues
- Check `.env.local` credentials
- Verify network connectivity
- Check Supabase service status

### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf apps/web/.next
npm run build --workspace=@erb/web
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Documentation](https://react.dev)

## Getting Help

1. Check existing issues in GitHub
2. Review error logs carefully
3. Ask in team discussions
4. Create detailed bug report if needed
