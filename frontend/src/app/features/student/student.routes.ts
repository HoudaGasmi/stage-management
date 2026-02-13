import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./student-profile.component').then(m => m.StudentProfileComponent) }
];
