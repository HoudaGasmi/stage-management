import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { StatsService, RecommendationService as RecService } from '../../core/services/api.services';
import { DashboardStats, Recommendation } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressBarModule, MatChipsModule
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Bonjour, {{ auth.currentUser()?.firstName }} 👋</h1>
        <p class="subtitle">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
      </div>

      <!-- Admin/Supervisor Stats -->
      @if (!auth.isStudent()) {
        <div class="kpi-grid" *ngIf="stats()">
          <mat-card class="kpi-card purple">
            <mat-icon>people</mat-icon>
            <div>
              <p class="kpi-value">{{ stats()!.kpis.totalStudents }}</p>
              <p class="kpi-label">Étudiants</p>
            </div>
          </mat-card>
          <mat-card class="kpi-card blue">
            <mat-icon>work</mat-icon>
            <div>
              <p class="kpi-value">{{ stats()!.kpis.publishedOffers }}</p>
              <p class="kpi-label">Offres publiées</p>
            </div>
          </mat-card>
          <mat-card class="kpi-card green">
            <mat-icon>description</mat-icon>
            <div>
              <p class="kpi-value">{{ stats()!.kpis.totalApplications }}</p>
              <p class="kpi-label">Candidatures</p>
            </div>
          </mat-card>
          <mat-card class="kpi-card orange">
            <mat-icon>check_circle</mat-icon>
            <div>
              <p class="kpi-value">{{ stats()!.kpis.acceptanceRate }}%</p>
              <p class="kpi-label">Taux d'acceptation</p>
            </div>
          </mat-card>
          <mat-card class="kpi-card teal">
            <mat-icon>track_changes</mat-icon>
            <div>
              <p class="kpi-value">{{ stats()!.kpis.activeInternships }}</p>
              <p class="kpi-label">Stages actifs</p>
            </div>
          </mat-card>
        </div>

        <!-- Charts placeholder -->
        @if (stats()) {
          <div class="charts-grid">
            <mat-card>
              <mat-card-header><mat-card-title>Candidatures par statut</mat-card-title></mat-card-header>
              <mat-card-content>
                @for (entry of statusEntries(); track entry[0]) {
                  <div class="status-bar">
                    <span class="status-label">{{ statusLabel(entry[0]) }}</span>
                    <mat-progress-bar mode="determinate"
                      [value]="entry[1] / stats()!.kpis.totalApplications * 100"
                      [color]="statusColor(entry[0])">
                    </mat-progress-bar>
                    <span class="count">{{ entry[1] }}</span>
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header><mat-card-title>Offres par domaine</mat-card-title></mat-card-header>
              <mat-card-content>
                @for (d of stats()!.charts.offersByDomain; track d.domain) {
                  <div class="domain-item">
                    <mat-chip>{{ d.domain }}</mat-chip>
                    <span class="count">{{ d.count }} offres</span>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        }
      }

      <!-- Student View -->
      @if (auth.isStudent()) {
        <div class="student-actions">
          <a mat-raised-button color="primary" routerLink="/offers">
            <mat-icon>search</mat-icon> Explorer les offres
          </a>
          <a mat-raised-button color="accent" routerLink="/recommendations">
            <mat-icon>star</mat-icon> Mes recommandations
          </a>
          <a mat-raised-button routerLink="/applications">
            <mat-icon>description</mat-icon> Mes candidatures
          </a>
          <a mat-raised-button routerLink="/profile">
            <mat-icon>edit</mat-icon> Mon profil
          </a>
        </div>

        @if (recommendations().length > 0) {
          <mat-card class="recs-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="accent">star</mat-icon>
              <mat-card-title>Offres recommandées pour vous</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (rec of recommendations().slice(0, 3); track rec.offer._id) {
                <div class="rec-item">
                  <div class="rec-info">
                    <strong>{{ rec.offer.title }}</strong>
                    <span>{{ rec.offer.company.name }} — {{ rec.offer.domain }}</span>
                  </div>
                  <div class="score-badge" [class]="scoreClass(rec.compatibilityScore)">
                    {{ rec.compatibilityScore }}%
                  </div>
                  <a mat-button color="primary" [routerLink]="['/offers', rec.offer._id]">Voir</a>
                </div>
              }
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/recommendations">Voir toutes les recommandations →</a>
            </mat-card-actions>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; margin: 0; }
      .subtitle { color: #666; margin: 4px 0 0; }
    }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { display: flex; align-items: center; gap: 16px; padding: 20px;
      mat-icon { font-size: 40px; height: 40px; width: 40px; border-radius: 12px; padding: 8px; }
      .kpi-value { font-size: 28px; font-weight: 700; margin: 0; }
      .kpi-label { font-size: 13px; color: #666; margin: 2px 0 0; }
      &.purple mat-icon { background: rgba(124,58,237,0.1); color: #7c3aed; }
      &.blue mat-icon { background: rgba(59,130,246,0.1); color: #3b82f6; }
      &.green mat-icon { background: rgba(16,185,129,0.1); color: #10b981; }
      &.orange mat-icon { background: rgba(245,158,11,0.1); color: #f59e0b; }
      &.teal mat-icon { background: rgba(20,184,166,0.1); color: #14b8a6; }
    }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .status-bar { display: flex; align-items: center; gap: 12px; margin: 8px 0;
      .status-label { width: 100px; font-size: 13px; }
      mat-progress-bar { flex: 1; }
      .count { width: 30px; text-align: right; font-size: 13px; color: #666; }
    }
    .domain-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0;
      .count { font-size: 13px; color: #666; }
    }
    .student-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
      a { display: flex; align-items: center; gap: 8px; }
    }
    .recs-card { margin-top: 16px;
      .rec-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #eee;
        &:last-child { border-bottom: none; }
        .rec-info { flex: 1; display: flex; flex-direction: column;
          strong { font-size: 15px; }
          span { font-size: 13px; color: #666; }
        }
        .score-badge { padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 14px;
          &.high { background: #d1fae5; color: #065f46; }
          &.medium { background: #fef3c7; color: #92400e; }
          &.low { background: #fee2e2; color: #991b1b; }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private statsService = inject(StatsService);
  private recService = inject(RecService);

  stats = signal<DashboardStats | null>(null);
  recommendations = signal<Recommendation[]>([]);
  today = new Date();

  ngOnInit(): void {
    if (!this.auth.isStudent()) {
      this.statsService.getDashboard().subscribe(s => this.stats.set(s));
    } else {
      this.recService.getRecommendations().subscribe(r => this.recommendations.set(r.recommendations));
    }
  }

  statusEntries() {
    return Object.entries(this.stats()?.charts.applicationsByStatus ?? {});
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', reviewing: 'En cours',
      accepted: 'Acceptées', rejected: 'Refusées', withdrawn: 'Retirées'
    };
    return map[s] ?? s;
  }

  statusColor(s: string): 'primary' | 'accent' | 'warn' {
    if (s === 'accepted') return 'accent';
    if (s === 'rejected' || s === 'withdrawn') return 'warn';
    return 'primary';
  }

  scoreClass(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
