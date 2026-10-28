import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../authService/auth.service';

// 1. ADMIN GUARD (Admin section protected garna)
export const adminAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdminLoggedIn()) {
    return true; // ✅ Allow Admin
  } else {
    router.navigate(['/admin-login']); // ❌ Redirect to Admin Login
    return false;
  }
};

// 2. CUSTOMER GUARD (User/Customer section protected garna)
export const customerAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) { // Customer Logged-in check
    return true; // ✅ Allow Customer
  } else {
    router.navigate(['/login']); // ❌ Redirect to Customer Login
    return false;
  }
};