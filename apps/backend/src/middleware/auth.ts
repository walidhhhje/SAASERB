import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        org_id: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' },
      });
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      });
    }

    // Get user org info
    const { data: userOrg } = await supabase
      .from('auth_users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!userOrg) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'User not properly configured' },
      });
    }

    req.user = {
      id: data.user.id,
      org_id: userOrg.org_id,
      role: userOrg.role,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication failed' },
    });
  }
}
