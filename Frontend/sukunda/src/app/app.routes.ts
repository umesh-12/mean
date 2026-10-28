import { Routes } from '@angular/router';

import {
  adminAuthGuard,
  customerAuthGuard,
} from './shared-services/Authguard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./user-admin/core/auth/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },

      {
        path: 'admin-login',
        loadComponent: () =>
          import('./admin/core/Auth/login/adminlogin/adminlogin/adminlogin.component').then(
            (m) => m.AdminloginComponent,
          ),
      },

    ],
  },
];
