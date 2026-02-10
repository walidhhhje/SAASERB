# Deployment Guide

Complete guide to deploying the ERB system to production.

## Pre-Deployment Checklist

- [ ] All tests passing: `npm run test`
- [ ] Build successful: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy in place

## Supabase Setup (Database & Auth)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and API keys

### 2. Push Database Schema

```bash
# Link your project
supabase link --project-ref <project-id>

# Push migrations
supabase db push

# Or deploy directly
supabase deploy
```

### 3. Configure Authentication

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Email/Password
3. Enable Google OAuth:
   - Get credentials from Google Cloud Console
   - Add redirect URLs:
     - `https://your-domain.com/auth/callback`
     - `https://your-domain.com/api/auth/callback`
4. Enable GitHub OAuth:
   - Get credentials from GitHub Settings
   - Add same redirect URLs

### 4. Setup RLS Policies

All RLS policies are created by migrations. Verify in:
- SQL Editor → Policies tab
- Check each table has appropriate policies

## Vercel Deployment (Frontend)

### 1. Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select `apps/web` as root directory

### 2. Configure Environment Variables

Add to Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### 3. Configure Build Settings

- Framework: Next.js
- Build Command: `npm run build --workspace=@erb/web`
- Output Directory: `.next`

### 4. Deploy

```bash
git push origin main
```

Vercel automatically deploys on push.

## Backend Deployment Options

### Option 1: Vercel Functions (Recommended for small scale)

```bash
# Build backend for Vercel
npm run build --workspace=@erb/backend

# Deploy
vercel deploy --prod
```

### Option 2: Railway (Simple Node.js hosting)

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Set root directory: `apps/backend`
5. Add environment variables
6. Deploy

### Option 3: Docker on AWS ECS

1. Build Docker image:
```bash
docker build -t erb-backend:latest -f apps/backend/Dockerfile .
```

2. Tag for ECR:
```bash
docker tag erb-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/erb-backend:latest
```

3. Push to ECR:
```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker push <account-id>.dkr.ecr.<region>.amazonaws.com/erb-backend:latest
```

4. Create ECS task and service

### Option 4: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name --buildpack heroku/nodejs

# Set environment variables
heroku config:set SUPABASE_URL=... -a your-app-name
heroku config:set SUPABASE_SERVICE_ROLE_KEY=... -a your-app-name
heroku config:set STRIPE_SECRET_KEY=... -a your-app-name

# Deploy
git push heroku main
```

## Stripe Setup

### 1. Get API Keys

1. Go to [stripe.com](https://stripe.com)
2. Create account or login
3. Get Secret Key and Publishable Key

### 2. Setup Products

Create products for subscription plans:
- Basic: $29/month
- Pro: $99/month
- Enterprise: Custom pricing

### 3. Configure Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Listen to webhooks
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Get signing secret and add to .env
```

Add webhook endpoint:
```typescript
// apps/backend/src/routes/webhooks.ts
router.post('/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  // Handle events...
});
```

## Production Environment Variables

### Frontend (.env.production)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://app.your-domain.com
```

### Backend (.env.production)
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://app.your-domain.com
LOG_LEVEL=info
```

## Monitoring & Logging

### Supabase Monitoring
- Check Status page: [status.supabase.com](https://status.supabase.com)
- Monitor usage in Supabase dashboard
- Setup alerts for resource limits

### Vercel Monitoring
- Check analytics in Vercel dashboard
- Monitor function invocations
- Setup error tracking

### Application Logging

```typescript
// Backend logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Database Backups

### Supabase Backups
1. Enable daily backups in Supabase dashboard
2. Set retention period (recommended: 30 days)
3. Download backups regularly

### Manual Backup
```bash
# Export database
pg_dump \
  --host="your-db-host" \
  --username="postgres" \
  --password \
  --db-name="postgres" \
  > backup.sql
```

## SSL/TLS Certificates

### Vercel (Automatic)
- Vercel automatically provisions SSL certificates
- Included with all deployments

### Custom Domain
1. Add custom domain in Vercel
2. Update DNS records as instructed
3. SSL certificate auto-configured

## Domain & DNS Configuration

### Example DNS Records
```
A Record:    @ → Vercel IP
CNAME Record: api → backend-service.vercel.app
CNAME Record: www → your-domain.vercel.app
TXT Record:  @ → Vercel verification
```

## Performance Optimization

### Frontend
- Enable Next.js Image Optimization
- Configure Vercel Analytics
- Use ISR (Incremental Static Regeneration)

### Backend
- Enable gzip compression
- Configure caching headers
- Use database connection pooling

### Database
- Monitor slow queries
- Optimize indexes
- Archive old data

## Scaling Considerations

### Vertical Scaling
- Increase database compute
- Increase function memory
- Use larger server instances

### Horizontal Scaling
- Use load balancer for multiple backend instances
- Implement session management (Redis)
- Scale database read replicas

## Disaster Recovery

### RTO/RPO Targets
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes

### Recovery Steps
1. Restore database from backup
2. Redeploy backend and frontend
3. Verify data integrity
4. Test critical functions

## Post-Deployment

- [ ] Smoke test all features
- [ ] Verify email notifications working
- [ ] Check analytics are recording
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Notify users of deployment

## Rollback Plan

If issues occur:

```bash
# Vercel (automatic rollback available in dashboard)
vercel rollback

# Docker (deploy previous version)
docker push <previous-image>

# Database (restore from backup if needed)
supabase db pull  # Get latest schema
# Or restore backup via Supabase dashboard
```

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs
- Railway Docs: https://docs.railway.app
