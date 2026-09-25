import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth-service';

/**
 * Prevents already-authenticated users from reaching pages like login/signup.
 * They are redirected to the dashboard instead.
 */
export const noAuthGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Already authenticated in memory.
  if (authService.currentUser()) {
    return router.parseUrl('/dashboard');
  }

  // Check if a session can be restored from storage (e.g. page refresh).
  if (authService.restoreSession()) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
