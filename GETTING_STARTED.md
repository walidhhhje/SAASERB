# Getting Started with ERB System

Welcome to the Enterprise Report Builder! This guide will walk you through setup and your first report.

## 5-Minute Setup

### 1. Prerequisites
- Node.js 20+ installed
- A Supabase account (free tier available at https://supabase.com)
- Git (to clone the repo)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd erb-system
npm install
```

### 3. Setup Supabase
1. Create a new Supabase project
2. Note your project URL and anon key
3. Run migrations:
   ```bash
   supabase link --project-ref <your-project-id>
   supabase db push
   ```

### 4. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Start Development
```bash
npm run dev
```

Open http://localhost:3000 and sign up!

## Your First Schema

### Step 1: Create a Schema
1. Login to http://localhost:3000
2. Go to Dashboard → Schemas
3. Click "Create Schema"
4. Fill in:
   - **Name**: `Customer`
   - **Slug**: `customer`
   - **Description**: `Customer contact information`

### Step 2: Add Fields
Add these fields by clicking "Add Field":

| Name | Type | Required | Notes |
|------|------|----------|-------|
| first_name | Text | Yes | Customer first name |
| last_name | Text | Yes | Customer last name |
| email | Email | Yes | Make unique |
| phone | Text | No | Optional contact |
| status | Select | No | active, inactive, pending |

### Step 3: Publish
Click "Create Schema" to save it (it starts as Draft).

## Your First Report

### Step 1: Create Report
1. Go to Dashboard → Reports
2. Click "Create Report"
3. Fill in:
   - **Name**: `Active Customers`
   - **Data Source**: Select your Customer schema
   - **Visualization**: Table

### Step 2: Add Query Rules
1. Click "Add Rule"
2. Configure:
   - **Field**: status
   - **Operator**: equals
   - **Value**: active

### Step 3: Preview
Click the Preview tab to see your results.

### Step 4: Save
Click "Create Report" to save.

## Add Sample Data

### Via Dashboard
1. Go to Dashboard → Schemas
2. Click on "Customer" schema
3. Create a new record with customer data

### Via Database Seed
```bash
npm run seed --workspace=@erb/backend
```

This creates sample customers automatically.

## Common Tasks

### Change Theme
Click the moon/sun icon in the top right to toggle dark mode.

### Manage Integrations
1. Go to Dashboard → Integrations
2. Click "Connect" on any service
3. Enter your API credentials
4. Save

### View Activity Log
1. Go to Dashboard → Audit Logs
2. See all changes made in your organization
3. Click "View" on changes to see details

### Export Data
1. Open a schema's records
2. Click the export button
3. Download as CSV

## Troubleshooting

### "Cannot connect to database"
- Check `.env.local` has correct Supabase URL and key
- Verify Supabase project is active
- Try running migrations again: `supabase db push`

### "Auth error when signing up"
- Check Supabase Auth is enabled
- Verify email confirmation is not required (or check your email)
- Clear browser cookies and try again

### "API connection failed"
- Make sure backend is running: `npm run dev`
- Check backend is listening on port 3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### "Schema creation failed"
- Check all required fields are filled
- Schema name must be unique
- Check browser console for specific error

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Modify React components → instant refresh
- Modify backend routes → auto-restart

### Database Debugging
View your data directly:
```bash
# Connect to Supabase
supabase start

# Use SQL Editor in Supabase dashboard
SELECT * FROM erb_schemas;
SELECT * FROM erb_records;
```

### API Testing
Use curl or REST Client extension:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/schemas
```

## Next Steps

1. **Explore Features**
   - Create more schemas
   - Build different report types
   - Test integrations

2. **Read Documentation**
   - `DEVELOPMENT.md` - Development workflows
   - `DEPLOYMENT.md` - Deploy to production
   - `PROJECT_SUMMARY.md` - Architecture overview

3. **Customize**
   - Modify color scheme in `globals.css`
   - Add custom field types
   - Create custom reports

4. **Production Setup**
   - Follow DEPLOYMENT.md
   - Setup Stripe for billing
   - Configure OAuth providers

## Project Structure Quick Tour

```
erb-system/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── backend/          # Express backend (port 3001)
├── packages/shared/      # Shared TypeScript types
├── docker-compose.yml    # Multi-container setup
└── docs/                # Documentation
```

## Key Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle Theme | T (when focused) |
| Add Field | Alt + F |
| Add Rule | Alt + R |
| Save | Ctrl/Cmd + S |
| Execute Report | Ctrl/Cmd + Enter |

## Help & Support

- **Issues**: Create GitHub issue with details
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check README.md, DEVELOPMENT.md
- **Code**: Review examples in the codebase

## What You Can Build

With ERB, you can create:

### Data Management
- Customer databases
- Product catalogs
- Inventory tracking
- Task management systems

### Reporting
- Sales dashboards
- Performance metrics
- Trend analysis
- Custom visualizations

### Integrations
- Notion database sync
- Freshdesk tickets
- Stripe subscriptions
- Custom webhooks

### Automation
- Scheduled reports
- Data exports
- Change notifications
- Workflow triggers

## Learning Resources

### Included Documentation
- 📖 README.md - Project overview
- 🚀 DEPLOYMENT.md - Production setup
- 🔧 DEVELOPMENT.md - Dev workflows
- 📋 PROJECT_SUMMARY.md - Architecture
- 📂 FILE_INDEX.md - File listing

### External Resources
- **Next.js**: https://nextjs.org/learn
- **React**: https://react.dev/learn
- **Supabase**: https://supabase.com/learn
- **TailwindCSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/handbook/

## Performance Tips

- Use dark mode for less eye strain during development
- Keep DevTools Network tab open to monitor API calls
- Use React DevTools to debug component issues
- Check PostgreSQL slow query logs for database optimization

## Security Checklist

- [ ] Change default passwords before production
- [ ] Enable HTTPS in production
- [ ] Configure CORS appropriately
- [ ] Setup email verification
- [ ] Enable database backups
- [ ] Use environment variables for secrets
- [ ] Setup rate limiting

## Feedback & Contributions

We'd love your feedback! Please:
1. Try the system
2. Report issues on GitHub
3. Suggest features
4. Contribute improvements

## Success Checklist

You've successfully set up ERB when you can:
- [ ] Sign up and log in
- [ ] Create a schema
- [ ] Add fields to the schema
- [ ] Publish the schema
- [ ] Create records in the schema
- [ ] Build a report with query rules
- [ ] View report in different visualization types
- [ ] Export data as CSV

Once you've checked all these boxes, you're ready to explore advanced features!

---

**Happy building! 🚀**

Need help? Check out DEVELOPMENT.md or open an issue on GitHub.
