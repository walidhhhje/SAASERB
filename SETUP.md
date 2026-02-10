# Complete Setup Guide for SaaS ERB

This guide will walk you through setting up the entire SaaS ERB system from scratch.

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher (install with `npm install -g pnpm`)
- **Git**: for version control
- **Docker & Docker Compose**: (optional, for containerized setup)
- **Supabase Account**: Free tier at https://supabase.com

## 1. Project Setup

### 1.1 Clone and Initialize

```bash
# If starting fresh
mkdir saas-erb && cd saas-erb
git init

# Or clone existing
git clone <your-repo> saas-erb
cd saas-erb
```

### 1.2 Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Install specific workspace dependencies
pnpm install --filter @erb/web
pnpm install --filter @erb/backend
```

## 2. Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project:
   - Project name: `saas-erb`
   - Database password: `<strong-password>`
   - Region: Choose closest to you
4. Wait for project initialization (~2 minutes)

### 2.2 Get Your Credentials

In the Supabase dashboard, go to **Settings → API**:
- Copy your **Project URL** (SUPABASE_URL)
- Copy your **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)
- Copy your **Anon Public Key** (SUPABASE_ANON_KEY)

### 2.3 Create Database Tables

1. Go to the SQL Editor in Supabase
2. Click "New Query"
3. Copy the entire content from `apps/backend/supabase/migrations/01_init_tables.sql`
4. Paste into the SQL editor
5. Click "Run"

The system will create all necessary tables with RLS policies.

## 3. Environment Configuration

### 3.1 Backend Environment

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase (from step 2.2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend
FRONTEND_URL=http://localhost:3000

# Database (only if using local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/erb_saas

# Third-party services (optional, add when integrating)
STRIPE_SECRET_KEY=sk_test_...
NOTION_API_KEY=notion_...
FRESHDESK_API_KEY=your-api-key
```

### 3.2 Frontend Environment

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=SaaS ERB
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Database Seeding (Optional)

Add demo data to test the system:

```bash
# Option 1: Using psql directly
psql -h your-host -U postgres -d postgres -f apps/backend/scripts/seed.sql

# Option 2: Via Supabase SQL Editor
# Copy contents of apps/backend/scripts/seed.sql into SQL Editor and run
```

This creates:
- Demo tenant: "Demo Company"
- Demo user: demo@example.com (password: demo123)
- Sample schema: Customers table
- Sample report: Active Customers

## 5. Run Development Servers

### 5.1 Without Docker

```bash
# From root directory
pnpm dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### 5.2 With Docker Compose

```bash
# Make sure .env files are set up first
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## 6. First Login

1. Open http://localhost:3000
2. Click "Sign up"
3. Fill in registration details:
   - Email: your@email.com
   - Password: Strong password
   - Full Name: Your Name
   - Company Name: Your Company
4. You'll be logged in to your new workspace

If using seed data:
- Email: demo@example.com
- Password: (from seed file)

## 7. Integrations Setup

### 7.1 Notion Integration

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Create new integration:
   - Name: "SaaS ERB"
   - Associated workspace: Your workspace
3. Copy the **Internal Integration Token**
4. In SaaS ERB → Settings → Integrations → Notion
5. Paste your token and save

### 7.2 Freshdesk Integration

1. Go to your Freshdesk account → Admin → API & Apps
2. Get your **API key** and **Domain**
3. In SaaS ERB → Settings → Integrations → Freshdesk
4. Enter API key and domain

### 7.3 Stripe Integration (Optional)

1. Create Stripe account at stripe.com
2. Go to Developers → API Keys
3. Copy your **Secret Key** (sk_test_...)
4. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   ```
5. Restart backend server

## 8. Verification

### 8.1 Check Backend Connectivity

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-02-08T10:00:00.000Z"}
```

### 8.2 Test Authentication

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'
```

Expected response includes JWT token.

### 8.3 Verify Frontend

Open http://localhost:3000 in your browser - should load the dashboard.

## 9. Development Workflow

### Creating a Schema

1. Click "Schema Builder" from dashboard
2. Click "New Schema"
3. Fill in:
   - Schema Name: e.g., "Customers"
   - Table Name: e.g., "customers"
   - Description: Optional
4. Click "Create Schema"
5. Click "Edit" to add fields

### Creating a Report

1. Click "Reports" from dashboard
2. Click "New Report"
3. Select schema to report on
4. Use Query Builder to filter data
5. Add chart configuration
6. Click "Create Report"

### Checking Audit Logs

1. Click "Analytics"
2. View all changes to your system
3. Filter by entity type or date range

## 10. Testing

### Run All Tests

```bash
pnpm test
```

### Backend Tests Only

```bash
pnpm test --filter @erb/backend
```

### Frontend Tests Only

```bash
pnpm test --filter @erb/web
```

### With Coverage

```bash
pnpm test:coverage
```

## 11. Building for Production

### Build Everything

```bash
pnpm build
```

### Build Specific Workspace

```bash
pnpm build --filter @erb/web
pnpm build --filter @erb/backend
```

### Start Production Server

```bash
pnpm start
```

## 12. Troubleshooting

### Issue: Database Connection Failed

**Solution**:
- Verify SUPABASE_URL in .env
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Ensure Supabase project is active
- Check internet connection

### Issue: "Port 3000/3001 already in use"

**Solution**:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3002 pnpm dev
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Frontend can't reach backend

**Solution**:
- Verify NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running: `curl http://localhost:3001/health`
- Check firewall/network settings

### Issue: Login fails

**Solution**:
- Verify JWT_SECRET is set in backend .env
- Check user exists in database
- Clear browser cookies
- Try creating new account

## 13. Deployment

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
4. Deploy

### Deploy Backend

#### Option 1: Railway.app

```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

#### Option 2: Render.com

1. Connect GitHub repo
2. Create Web Service
3. Runtime: Node
4. Build Command: `pnpm build`
5. Start Command: `node apps/backend/dist/server.js`
6. Add environment variables

#### Option 3: Docker on your server

```bash
docker build -t erb-backend -f apps/backend/Dockerfile .
docker run -d \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e JWT_SECRET=... \
  -p 3001:3001 \
  erb-backend
```

## 14. Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production on production
- [ ] Use HTTPS URLs in production
- [ ] Enable CORS only for your domains
- [ ] Rotate API keys regularly
- [ ] Enable Supabase RLS policies
- [ ] Set up HTTPS certificates
- [ ] Enable rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 15. Performance Optimization

- **Database**: Use Supabase indexes on frequently queried fields
- **Frontend**: Enable Next.js image optimization
- **Caching**: Configure Redis for session storage
- **CDN**: Use Vercel Edge Network for frontend
- **API**: Implement pagination for large datasets

## 16. Getting Help

- Documentation: https://docs.example.com
- Issues: GitHub Issues
- Email: support@example.com
- Discord: Join our community

## Next Steps

1. Explore the schema builder
2. Create your first report
3. Set up integrations
4. Configure billing (Stripe)
5. Invite team members
6. Deploy to production

Happy building!
