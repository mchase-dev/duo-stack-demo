import { JwtPayload } from '../utils/jwt';

/**
 * Extend Express Request to include user from JWT
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
