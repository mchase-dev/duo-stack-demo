import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { UserRole } from '../api/api.types';
import { AuthService } from './auth.service';

// Factory: roleGuard('Admin') — Superuser always passes every role check
export const roleGuard =
  (requiredRole: UserRole): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();

    if (!user) return router.createUrlTree(['/login']);
    if (user.role === 'Superuser') return true;
    if (requiredRole === 'Admin' && user.role === 'Admin') return true;
    return router.createUrlTree(['/dashboard']);
  };
