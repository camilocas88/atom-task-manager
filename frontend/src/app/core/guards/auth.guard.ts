import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  console.log('Auth Guard - isAuthenticated:', isAuth);
  console.log('Auth Guard - Current user:', authService.getCurrentUser());
  console.log('Auth Guard - Token:', authService.getToken());

  if (isAuth) {
    console.log('Auth Guard - Access granted to:', state.url);
    return true;
  }

  console.log('Auth Guard - Access denied, redirecting to login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
