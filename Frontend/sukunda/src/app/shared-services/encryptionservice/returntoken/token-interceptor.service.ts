import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../authService/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // AuthService bata hit bhaerako active role tānne ('ADMIN', 'CUSTOMER', etc.)
  const activeRole = authService.getActiveRole();
  let token: string | null = null;

  // -------------------------------------------------------------
  // 1. PRIMARY STRATEGY: Role Anusar Token Selection
  // -------------------------------------------------------------
  if (activeRole === 'ADMIN') {
    token = authService.getAdminToken();
  } else if (activeRole === 'CUSTOMER') {
    token = authService.getCustomerToken();
  }
  // Future Roles thapida yasaari nai thapda hunchha:
  // else if (activeRole === 'VENDOR') { token = authService.getVendorToken(); }
  // else if (activeRole === 'STAFF')  { token = authService.getStaffToken(); }

  // -------------------------------------------------------------
  // 2. FALLBACK STRATEGY 1: Request URL Path Check
  // Yadi activeRole clear/miss chha bhane URL pattern bata check garne
  // -------------------------------------------------------------
  if (!token) {
    if (req.url.includes('/admin-login') || req.url.includes('/products')) {
      token = authService.getAdminToken();
    } else {
      token = authService.getCustomerToken();
    }
  }

  // -------------------------------------------------------------
  // 3. FALLBACK STRATEGY 2: Last Priority Scan
  // LocalStorage ma jun paila bhetinchha tei tānne
  // -------------------------------------------------------------
  if (!token) {
    const availableTokens = [
      authService.getAdminToken(),
      authService.getCustomerToken()
    ];
    token = availableTokens.find(t => !!t && t !== 'null' && t !== 'undefined') || null;
  }

  // -------------------------------------------------------------
  // HEADERS SETTING
  // -------------------------------------------------------------
  let headers: Record<string, string> = { 
    'ngrok-skip-browser-warning': 'true' 
  };

  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(req.clone({ setHeaders: headers }));
};