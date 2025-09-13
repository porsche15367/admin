// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/admin-dashboard',
        pathMatch: 'full'
      },
      {
        path: 'admin-dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then((c) => c.AdminDashboardComponent)
      },
      {
        path: 'vendor-management',
        loadComponent: () => import('./pages/vendor-management/vendor-management.component').then((c) => c.VendorManagementComponent)
      },
      {
        path: 'order-management',
        loadComponent: () => import('./pages/order-management/order-management.component').then((c) => c.OrderManagementComponent)
      },
      {
        path: 'vendor-approval',
        loadComponent: () => import('./pages/vendor-approval/vendor-approval.component').then((c) => c.VendorApprovalComponent)
      },
      {
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-management.component').then((c) => c.UserManagementComponent)
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
