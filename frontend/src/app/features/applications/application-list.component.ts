import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Application } from '../../shared/models';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:   { label: 'En attente',  color: '#f59e0b', icon: 'hourglass_empty' },
  reviewing: { label: 'En examen',   color: '#3b82f6', icon: 'visibility' },
  accepted:  { label: 'Acceptée',    color: '#10b981', icon: 'check_circle' },
  rejected:  { label: 'Refusée',     color: '#ef4444', icon: 'cancel' },
  withdrawn: { label: 'Retirée',     color: '#9ca3af', icon: 'undo' }
};

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatMenuModule
  ],
  template: `
    <div class="apps-page">
      <div class="page-header">
        <h1>{{ auth.isStudent() ? 'Mes Candidatures' : 'Toutes les candidatures' }}</h1>
        <mat-form-field appearance="outline" class="filter-select">
          <mat-label>Filtrer par statut</mat-label>
          <mat-select [(ngModel)]="filterStatus" (ngModelChange)="loadApplications()">
            <mat-option value="">Tous</mat-option>
            @for (s of statusKeys; track s) {
              <mat-option [value]="s">{{ STATUS[s].label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        @for (s of statusKeys; track s) {
          <div class="kpi-mini" [style.border-color]="STATUS[s].color">
            <mat-icon [style.color]="STATUS[s].color">{{ STATUS[s].icon }}</mat-icon>
            <div>
              <strong>{{ countByStatus(s) }}</strong>
              <span>{{ STATUS[s].label }}</span>
            </div>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        <div class="apps-list">
          @for (app of applications(); track app._id) {
            <mat-card class="app-card">
              <div class="status-bar" [style.background]="STATUS[app.status].color"></div>
              <div class="app-content">
                <div class="app-main">
                  <div class="app-header">
                    <h3>{{ app.offer.title }}</h3>
                    <div class="status-badge" [style.background]="STATUS[app.status].color + '20'"
                         [style.color]="STATUS[app.status].color">
                      <mat-icon>{{ STATUS[app.status].icon }}</mat-icon>
                      {{ STATUS[app.status].label }}
                    </div>
                  </div>
                  <p class="company">{{ app.offer.company.name }} · {{ app.offer.domain }}</p>
                  <div class="app-meta">
                    <span><mat-icon>calendar_today</mat-icon>{{ app.createdAt | date:'dd/MM/yyyy' }}</span>
                    @if (app.compatibilityScore !== undefined) {
                      <span class="score" [class]="scoreClass(app.compatibilityScore)">
                        <mat-icon>stars</mat-icon>{{ app.compatibilityScore }}% de compatibilité
                      </span>
                    }
                  </div>

                  @if (app.matchedSkills?.length) {
                    <div class="skills-row">
                      <span class="label">✅ Match :</span>
                      @for (s of app.matchedSkills.slice(0, 4); track s) {
                        <mat-chip>{{ s }}</mat-chip>
                      }
                    </div>
                  }
                  @if (app.missingSkills?.length) {
                    <div class="skills-row missing">
                      <span class="label">❌ Manquant :</span>
                      @for (s of app.missingSkills.slice(0, 3); track s) {
                        <mat-chip>{{ s }}</mat-chip>
                      }
                    </div>
                  }
                </div>

                <div class="app-actions">
                  <a mat-button [routerLink]="['/offers', app.offer._id]">Voir l'offre</a>
                  @if (auth.isStudent() && ['pending','reviewing'].includes(app.status)) {
                    <button mat-button color="warn" (click)="withdraw(app._id)">Retirer</button>
                  }
                  @if (!auth.isStudent()) {
                    <button mat-button [matMenuTriggerFor]="statusMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #statusMenu>
                      <button mat-menu-item (click)="updateStatus(app._id, 'reviewing')">En examen</button>
                      <button mat-menu-item (click)="updateStatus(app._id, 'accepted')">Accepter</button>
                      <button mat-menu-item (click)="updateStatus(app._id, 'rejected')">Refuser</button>
                    </mat-menu>
                  }
                </div>
              </div>
            </mat-card>
          }
          @empty {
            <div class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>Aucune candidature trouvée.</p>
              @if (auth.isStudent()) {
                <a mat-raised-button color="primary" routerLink="/offers">Explorer les offres</a>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .apps-page { max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .filter-select { width: 200px; }
    }
    .kpi-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .kpi-mini { display: flex; align-items: center; gap: 10px; padding: 12px 16px;
      background: white; border-radius: 10px; border: 2px solid; flex: 1; min-width: 120px;
      mat-icon { font-size: 24px; height: 24px; width: 24px; }
      strong { display: block; font-size: 20px; }
      span { font-size: 12px; color: #666; }
    }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .apps-list { display: flex; flex-direction: column; gap: 12px; }
    .app-card { position: relative; overflow: hidden;
      .status-bar { height: 100%; width: 4px; position: absolute; left: 0; top: 0; bottom: 0; }
      .app-content { display: flex; gap: 16px; align-items: flex-start; padding-left: 12px; }
      .app-main { flex: 1; }
      .app-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
        h3 { margin: 0; font-size: 16px; }
      }
      .status-badge { display: flex; align-items: center; gap: 4px; padding: 4px 12px;
        border-radius: 20px; font-size: 13px; font-weight: 600; white-space: nowrap;
        mat-icon { font-size: 16px; height: 16px; width: 16px; }
      }
      .company { color: #666; font-size: 14px; margin: 4px 0 8px; }
      .app-meta { display: flex; gap: 16px; font-size: 13px; color: #666;
        span { display: flex; align-items: center; gap: 4px; }
        mat-icon { font-size: 14px; height: 14px; width: 14px; }
        .score { font-weight: 600;
          &.high { color: #10b981; } &.medium { color: #f59e0b; } &.low { color: #ef4444; }
        }
      }
      .skills-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 8px;
        .label { font-size: 13px; color: #666; }
        &.missing mat-chip { background: #fee2e2; }
      }
      .app-actions { display: flex; flex-direction: column; align-items: flex-end; }
    }
    .empty-state { text-align: center; padding: 60px;
      mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ccc; }
      p { color: #999; font-size: 18px; margin: 16px 0; }
    }
  `]
})
export class ApplicationListComponent implements OnInit {
  private appService = inject(ApplicationService);
  auth = inject(AuthService);
  private notif = inject(NotificationService);

  applications = signal<Application[]>([]);
  loading = signal(false);
  filterStatus = '';
  STATUS = STATUS_CONFIG;
  statusKeys = Object.keys(STATUS_CONFIG);

  ngOnInit(): void { this.loadApplications(); }

  loadApplications(): void {
    this.loading.set(true);
    const params: any = { limit: 50 };
    if (this.filterStatus) params.status = this.filterStatus;
    this.appService.getApplications(params).subscribe({
      next: r => { this.applications.set(r.applications); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  withdraw(id: string): void {
    this.appService.withdraw(id).subscribe({
      next: () => { this.notif.success('Candidature retirée.'); this.loadApplications(); }
    });
  }

  updateStatus(id: string, status: string): void {
    this.appService.updateStatus(id, status).subscribe({
      next: () => { this.notif.success('Statut mis à jour.'); this.loadApplications(); }
    });
  }

  countByStatus(status: string): number {
    return this.applications().filter(a => a.status === status).length;
  }

  scoreClass(s: number): string {
    if (s >= 70) return 'high';
    if (s >= 40) return 'medium';
    return 'low';
  }
}
