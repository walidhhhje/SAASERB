#!/bin/bash

# Create monorepo directory structure
mkdir -p apps/web/{src,public}
mkdir -p apps/backend/src/{routes,services,middleware,utils,types}
mkdir -p packages/shared/{src,dist}

# Copy web app files
cp -r app/* apps/web/src/ 2>/dev/null || true
cp -r components apps/web/src/ 2>/dev/null || true
cp -r hooks apps/web/src/ 2>/dev/null || true
cp -r lib apps/web/src/ 2>/dev/null || true

# Create .env.example files
cat > apps/web/.env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NOTION_API_KEY=your-notion-api-key
FRESHDESK_API_KEY=your-freshdesk-api-key
LOOKER_EMBED_SECRET=your-looker-embed-secret
EOF

cat > apps/backend/.env.example << 'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
NOTION_API_KEY=your-notion-api-key
FRESHDESK_API_KEY=your-freshdesk-api-key
JWT_SECRET=your-jwt-secret
NODE_ENV=development
PORT=3001
EOF

echo "Monorepo structure created successfully!"
