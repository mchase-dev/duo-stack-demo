import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has one of the required roles
 *
 * NOTE: This middleware assumes that authenticateToken has already been called
 * and req.user is populated.
 */

/**
 * Require one or more roles to access the route
 * @param roles - Array of allowed roles
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated (should be set by authenticateToken middleware)
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if user has one of the required roles
      const userRole = req.user.role as UserRole;

      if (!roles.includes(userRole)) {
        res.status(403).json({
          error: 'Insufficient permissions',
          message: `This action requires one of the following roles: ${roles.join(', ')}`,
        });
        return;
      }

      // User has required role, proceed
      next();
    } catch (error) {
      res.status(403).json({ error: 'Access denied' });
    }
  };
}

/**
 * Require admin role (Admin or Superuser)
 */
export function requireAdmin() {
  return requireRole(UserRole.Admin, UserRole.Superuser);
}

/**
 * Require superuser role
 */
export function requireSuperuser() {
  return requireRole(UserRole.Superuser);
}
