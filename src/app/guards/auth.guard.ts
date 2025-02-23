import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};

export function isLoggedIn(): boolean {
  const token = localStorage.getItem('token');
  const expiryTimeString = localStorage.getItem('tokenExpiry');

  if (!token || !expiryTimeString) {
    navigateToLogin();
    return false;
  }

  const expiryTime = new Date(expiryTimeString);
  const currentTime = new Date();

  if (currentTime > expiryTime) {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    navigateToLogin();
    return false;
  }

  return true;
}

function navigateToLogin(): void {
  let router = inject(Router);
  router.navigate(['/login']);
}
