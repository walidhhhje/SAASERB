# SaaS ERB - Production-Ready Enterprise Report Builder

A complete, production-ready SaaS application for Enterprise Report Building (ERB) with drag-drop schema builder, dynamic report generation, real-time collaboration, and multi-tenant support.

## 🎯 Features

- **Multi-Tenant Architecture** with Row-Level Security (RLS)
- **Drag-Drop Schema Builder** with dynamic table creation
- **Report Builder** with SQL query builder and visualizations
- **Real-time Collaboration** for schema and report editing
- **Integrations**: Notion (pages→data), Freshdesk (tickets), Looker Studio (embeds)
- **Audit Logs** for compliance and tracking
- **Stripe Billing** with subscription plans
- **Export Capabilities** (SQL, CSV)
- **Dark Mode** support with shadcn/ui
- **Authentication** with JWT and multi-tenant support

## 📋 Architecture

```
saas-erb-monorepo/
├── apps/
│   ├── web/                 # Next.js 16 frontend
│   ├── backend/             # Express.js API server
├── packages/
│   └── shared/              # Shared types and utilities
├── docker-compose.yml       # Local development setup
├── pnpm-workspace.yaml      # Package manager workspace config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (optional)
- Supabase account with project

### Local Development

1. **Clone and install dependencies**

```bash
pnpm install
```

2. **Set up environment variables**

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit with your Supabase credentials

# Frontend
cp apps/web/.env.example apps/web/.env
```

3. **Initialize database**

```bash
# Apply migrations to Supabase
supabase db push

# Or seed demo data
psql -U erb_user -d erb_saas -f apps/backend/scripts/seed.sql
```

4. **Start development servers**

```bash
pnpm dev
```

This starts both frontend (http://localhost:3000) and backend (http://localhost:3001) in parallel.

### Docker Compose

```bash
docker-compose up -d
```

Access the app at http://localhost:3000

## 📁 Project Structure

### Frontend (`apps/web`)

- **App Router** with Next.js 16
- **shadcn/ui** components with dark mode
- **Drag-drop UI** using react-beautiful-dnd patterns
- **React Query** for data fetching and state management
- **Pages**:
  - `/login` - Authentication
  - `/` - Dashboard overview
  - `/schemas` - Schema builder interface
  - `/reports` - Report management
  - `/integrations` - Third-party service setup

### Backend (`apps/backend`)

- **Express.js** API server
- **Supabase** for PostgreSQL + Auth
- **Row-Level Security** for multi-tenant isolation
- **Routes**:
  - `/api/auth` - Authentication (register, login, me)
  - `/api/schema` - Schema CRUD operations
  - `/api/reports` - Report CRUD and execution
  - `/api/integrations` - Integration management
  - `/api/audit` - Audit log queries

### Shared (`packages/shared`)

- TypeScript types and interfaces
- Shared utilities and constants

## 🔐 Security Features

- **RLS Policies** for multi-tenant data isolation
- **JWT Authentication** with secure token management
- **Password Hashing** with bcrypt
- **CORS** properly configured
- **Input Validation** on all endpoints
- **Audit Logging** of all actions
- **Environment Variable** protection

## 📊 Database Schema

### Core Tables

- `tenants` - Organization/workspace data
- `users` - User accounts
- `tenant_members` - User-tenant relationships with roles
- `schema_modules` - Data schema definitions
- `dynamic_tables` - Registry of created tables
- `reports` - Report definitions and queries
- `integrations` - Third-party service configs
- `audit_logs` - Action history
- `collaboration_sessions` - Real-time editing sessions

## 🛠️ Development

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
pnpm build
```

### Code Quality

```bash
pnpm lint
```

## 🚢 Deployment

### Vercel (Frontend)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend Deployment Options

#### Railway.app
```bash
railway link
railway up
```

#### Render
1. Connect GitHub repo
2. Create Web Service
3. Set build command: `pnpm build`
4. Set start command: `node apps/backend/dist/server.js`

#### Docker
```bash
docker build -t erb-backend -f apps/backend/Dockerfile .
docker run -e DATABASE_URL=... -p 3001:3001 erb-backend
```

## 📚 API Examples

### Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "John Doe",
    "tenantName": "Acme Corp"
  }'
```

### Create Schema Module

```bash
curl -X POST http://localhost:3001/api/schema/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customers",
    "table_name": "customers",
    "description": "Customer master data",
    "module_type": "main",
    "fields": [
      {
        "id": "field_1",
        "name": "name",
        "type": "text",
        "required": true,
        "unique": false
      }
    ]
  }'
```

### Create Report

```bash
curl -X POST http://localhost:3001/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Active Customers Report",
    "description": "Shows active customers",
    "module_id": "MODULE_ID",
    "query_builder": {
      "combinator": "and",
      "rules": [
        {
          "field": "status",
          "operator": "equals",
          "value": "active"
        }
      ]
    },
    "chart_config": {
      "type": "bar",
      "xAxis": "name",
      "yAxis": ["status"]
    }
  }'
```

## 🔌 Integrations

### Notion API
- Sync Notion pages as data sources
- Pull page properties as columns
- Automatic sync scheduling

### Freshdesk
- Import tickets as records
- Sync ticket status updates
- Link tickets to reports

### Looker Studio
- Embed dashboards in reports
- Real-time data refresh
- Custom visualizations

## 📝 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📞 Support

For issues and questions:
- GitHub Issues: [repo]/issues
- Email: support@example.com
- Documentation: https://docs.example.com
