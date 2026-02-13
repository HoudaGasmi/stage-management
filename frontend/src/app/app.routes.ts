import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Student profile
      {
        path: 'profile',
        loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['student'] }
      },

      // Offers
      {
        path: 'offers',
        loadChildren: () => import('./features/offers/offer.routes').then(m => m.OFFER_ROUTES)
      },

      // Applications
      {
        path: 'applications',
        loadChildren: () => import('./features/applications/application.routes').then(m => m.APPLICATION_ROUTES)
      },

      // Internship tracking
      {
        path: 'internships',
        loadChildren: () => import('./features/tracking/tracking.routes').then(m => m.TRACKING_ROUTES)
      },

      // Recommendations (student only)
      {
        path: 'recommendations',
        loadComponent: () => import('./features/recommandations/recommendations.component').then(m => m.RecommendationsComponent),
        canActivate: [roleGuard],
        data: { roles: ['student'] }
      },

      // Admin
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
