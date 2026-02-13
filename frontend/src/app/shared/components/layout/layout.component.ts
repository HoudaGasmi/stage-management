import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer [mode]="isMobile() ? 'over' : 'side'"
                   [opened]="!isMobile()"
                   class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">school</mat-icon>
          <span class="logo-text">Stage<strong>Manager</strong></span>
        </div>

        <mat-divider />

        <mat-nav-list>
          @for (item of visibleNavItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
               (click)="isMobile() && drawer.close()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <mat-divider />
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <div>
              <p class="user-name">{{ auth.currentUser()?.fullName }}</p>
              <p class="user-role">{{ roleLabel() }}</p>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          @if (isMobile()) {
            <button mat-icon-button (click)="drawer.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/profile" *ngIf="auth.isStudent()">
              <mat-icon>person</mat-icon> Mon profil
            </button>
            <mat-divider />
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Déconnexion
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 260px; background: #1e1e2e; color: white; display: flex; flex-direction: column; }
    .sidenav-header {
      display: flex; align-items: center; gap: 10px; padding: 20px 16px;
      .logo-icon { font-size: 32px; height: 32px; width: 32px; color: #7c3aed; }
      .logo-text { font-size: 18px; color: white; strong { color: #7c3aed; } }
    }
    mat-nav-list { flex: 1; padding-top: 8px;
      a { color: rgba(255,255,255,0.75); border-radius: 8px; margin: 2px 8px; transition: all 0.2s;
        &:hover { background: rgba(124,58,237,0.15); color: white; }
        &.active-link { background: rgba(124,58,237,0.3); color: white; font-weight: 600; }
      }
      mat-icon { color: rgba(255,255,255,0.6); }
    }
    .sidenav-footer { padding: 8px;
      .user-info { display: flex; align-items: center; gap: 10px; padding: 12px 8px;
        mat-icon { font-size: 36px; height: 36px; width: 36px; color: #7c3aed; }
        .user-name { margin: 0; font-size: 14px; font-weight: 600; color: white; }
        .user-role { margin: 0; font-size: 12px; color: rgba(255,255,255,0.5); }
      }
    }
    .toolbar { background: white; color: #333; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .spacer { flex: 1; }
    .main-content { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); }
    @media (max-width: 768px) { .main-content { padding: 16px; } }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
  private bp = inject(BreakpointObserver);

  isMobile = toSignal(
    this.bp.observe([Breakpoints.Handset]).pipe(map(r => r.matches)),
    { initialValue: false }
  );

  private ALL_NAV: NavItem[] = [
    { label: 'Tableau de bord',   icon: 'dashboard',      route: '/dashboard' },
    { label: 'Mon profil',        icon: 'person',         route: '/profile',          roles: ['student'] },
    { label: 'Offres de stage',   icon: 'work',           route: '/offers' },
    { label: 'Mes candidatures',  icon: 'description',    route: '/applications',     roles: ['student'] },
    { label: 'Candidatures',      icon: 'people',         route: '/applications',     roles: ['admin', 'supervisor'] },
    { label: 'Suivi des stages',  icon: 'track_changes',  route: '/internships' },
    { label: 'Recommandations',   icon: 'star',           route: '/recommendations',  roles: ['student'] },
    { label: 'Administration',    icon: 'admin_panel_settings', route: '/admin',       roles: ['admin'] },
  ];

  visibleNavItems = () => {
    const role = this.auth.currentUser()?.role;
    return this.ALL_NAV.filter(item => !item.roles || item.roles.includes(role!));
  };

  roleLabel = () => {
    const map: Record<string, string> = {
      student: 'Étudiant', supervisor: 'Encadrant', admin: 'Administrateur'
    };
    return map[this.auth.currentUser()?.role ?? ''] ?? '';
  };
}
