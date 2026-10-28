import { Injectable } from '@angular/core';
import { EncryptionService } from '../encryptionservice/encryption.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private router: Router,
    private encrypt: EncryptionService,
  ) { }

  // ==========================================
  // GLOBAL ACTIVE ROLE MANAGEMENT
  // ==========================================

  // Active Role Set Garne ('ADMIN', 'CUSTOMER', 'VENDOR', etc.)
  setActiveRole(role: string) {
    if (role) {
      localStorage.setItem('activeRole', role.toUpperCase());
    }
  }

  // Active Role Tānne (Interceptor le use garchha)
  getActiveRole(): string | null {
    return localStorage.getItem('activeRole');
  }

  // Clear Active Role
  clearActiveRole() {
    localStorage.removeItem('activeRole');
  }

  // ==========================================
  // 1. ADMIN AUTHENTICATION METHODS
  // ==========================================

  // Admin Token Set Garne
  setAdminToken(token: string) {
    if (!token) return;
    const encryptedToken = this.encrypt.encryptionAES(token);
    localStorage.setItem('adminToken', encryptedToken);

    // Automatically tracking Active Role
    this.setActiveRole('ADMIN');
  }

  // Admin Token Tānne
  getAdminToken(): string | null {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) return null;

    try {
      return this.encrypt.decryptionAES(storedToken);
    } catch (e) {
      console.error('Admin token decryption failed', e);
      return null;
    }
  }

  // Admin Logged-In Check
  isAdminLoggedIn(): boolean {
    return !!this.getAdminToken();
  }

  // Admin User ID Set Garne
   setUserId(userId: number) {
    if (userId !== undefined && userId !== null) {
      localStorage.setItem('adminUserId', userId.toString());
    }
  }

  // Admin User ID Tānne
  getUserId(): number | null {
    const userId = localStorage.getItem('adminUserId');
    if (!userId || userId === 'null' || userId === 'undefined') return null;

    const id = Number(userId);
    return isNaN(id) ? null : id;
  }

  // Admin Logout
  logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUserId');

    // Admin Logout huda activeRole clear garne
    if (this.getActiveRole() === 'ADMIN') {
      this.clearActiveRole();
    }

    this.router.navigate(['/admin-login']);
  }


  // ==========================================
  // 2. CUSTOMER / USER AUTHENTICATION METHODS
  // ==========================================

  // Customer Token Set Garne
  setCustomerToken(token: string) {
    if (!token) return;
    const encryptedToken = this.encrypt.encryptionAES(token);
    localStorage.setItem('customerToken', encryptedToken);

    // Automatically tracking Active Role
    this.setActiveRole('CUSTOMER');
  }

  // Customer Token Tānne
  getCustomerToken(): string | null {
    const storedToken = localStorage.getItem('customerToken');
    if (!storedToken) return null;

    try {
      return this.encrypt.decryptionAES(storedToken);
    } catch (e) {
      console.error('Customer token decryption failed', e);
      return null;
    }
  }

  // Backward Compatibility
  gettoken(): string | null {
    return this.getCustomerToken();
  }

  // Customer Logged-In Check
  isLoggedIn(): boolean {
    return !!this.getCustomerToken();
  }

  // Customer ID Set Garne
  setCustomerId(customerId: number) {
    if (customerId !== undefined && customerId !== null) {
      localStorage.setItem('customerId', customerId.toString());
    }
  }

  // Customer ID Tānne
  getCustomerId(): number | null {
    const customerId = localStorage.getItem('customerId');
    if (!customerId || customerId === 'null' || customerId === 'undefined') return null;

    const id = Number(customerId);
    return isNaN(id) ? null : id;
  }

  // Customer Logout
  logout() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerId');

    // Customer Logout huda activeRole clear garne
    if (this.getActiveRole() === 'CUSTOMER') {
      this.clearActiveRole();
    }

    this.router.navigate(['/home']);
  }

  // Global Session Clear (Troubleshooting / Reset ko lagi)
  clearAllSession() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}
