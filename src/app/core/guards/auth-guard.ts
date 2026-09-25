import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth-service';

/**
 * Lets signed-in users through. Everyone else goes to the login page, carrying
 * the page they asked for (?returnUrl=...) so login can send them back to it.
 *
 * On page refresh the in-memory signal is empty, so we first try to restore
 * the session from localStorage before redirecting.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Already authenticated in memory.
  if (authService.currentUser()) return true;

  // Try restoring from localStorage (covers page refresh / new tab).
  if (authService.restoreSession()) return true;

  // Not authenticated — redirect to login with a returnUrl.
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
