import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../server';
import { AuthRequest } from '../types';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, tenantName } = req.body;

    if (!email || !password || !fullName || !tenantName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        encrypted_password: hashedPassword,
        full_name: fullName,
      });

    if (userError) throw userError;

    // Create tenant
    const tenantId = uuidv4();
    const tenantSlug = tenantName.toLowerCase().replace(/\s+/g, '-');
    const { error: tenantError } = await supabase
      .from('tenants')
      .insert({
        id: tenantId,
        name: tenantName,
        slug: tenantSlug,
      });

    if (tenantError) throw tenantError;

    // Add user as owner of tenant
    const { error: memberError } = await supabase
      .from('tenant_members')
      .insert({
        id: uuidv4(),
        tenant_id: tenantId,
        user_id: userId,
        role: 'owner',
        joined_at: new Date().toISOString(),
      });

    if (memberError) throw memberError;

    // Create JWT token
    const token = jwt.sign(
      {
        id: userId,
        email,
        tenant_id: tenantId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: userId,
        email,
        full_name: fullName,
      },
      token,
      tenant: {
        id: tenantId,
        name: tenantName,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.encrypted_password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get tenant
    const { data: memberData } = await supabase
      .from('tenant_members')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    const tenantId = memberData?.tenant_id || null;

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tenant_id: tenantId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
      token,
      tenant_id: tenantId,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    res.json({
      user,
      tenant_id: req.tenantId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
