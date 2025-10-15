import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get the Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization header format. Use: Bearer <token>' });
      return;
    }

    const token = parts[1];

    // Verify and decode the token
    const payload = verifyToken(token);

    // Attach user info to request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({ error: 'Access token expired' });
        return;
      }
      if (error.message === 'Invalid token') {
        res.status(401).json({ error: 'Invalid access token' });
        return;
      }
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
}
