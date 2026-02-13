import { Routes } from '@angular/router';

export const APPLICATION_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./application-list.component').then(m => m.ApplicationListComponent) }
];
