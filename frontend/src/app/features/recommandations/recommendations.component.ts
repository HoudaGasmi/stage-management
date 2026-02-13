import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { RecommendationService } from '../../core/services/api.services';
import { ApplicationService } from '../../core/services/api.services';
import { NotificationService } from '../../core/services/notification.service';
import { Recommendation, ProfileAnalysis } from '../../shared/models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressBarModule, MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div class="recs-page">
      <div class="page-header">
        <div>
          <h1>🤖 Recommandations intelligentes</h1>
          <p>Offres sélectionnées selon votre profil et vos compétences</p>
        </div>
      </div>

      <!-- Profile Analysis -->
      @if (analysis()) {
        <div class="analysis-grid">
          <mat-card class="completeness-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>insights</mat-icon>
              <mat-card-title>Profil complété à {{ analysis()!.profileCompleteness }}%</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-progress-bar mode="determinate"
                [value]="analysis()!.profileCompleteness"
                [color]="analysis()!.profileCompleteness >= 70 ? 'accent' : 'warn'">
              </mat-progress-bar>
              <div class="tips-list">
                @for (tip of analysis()!.cvTips; track tip.message) {
                  <div class="tip" [class]="tip.type">
                    <mat-icon>{{ tipIcon(tip.type) }}</mat-icon>
                    {{ tip.message }}
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="trending-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>trending_up</mat-icon>
              <mat-card-title>Compétences les plus demandées</mat-card-title>
              <mat-card-subtitle>Que vous ne possédez pas encore</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @for (s of analysis()!.suggestions.slice(0, 8); track s.skill) {
                <div class="suggestion-item">
                  <span class="skill-name">{{ s.skill }}</span>
                  <div class="demand">
                    <mat-progress-bar mode="determinate"
                      [value]="s.demandCount / (analysis()!.suggestions[0]?.demandCount || 1) * 100">
                    </mat-progress-bar>
                    <span>{{ s.demandCount }} offre(s)</span>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }

      <mat-divider />

      <!-- Recommendations List -->
      <h2>{{ recommendations().length }} offres recommandées</h2>

      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        <div class="recs-list">
          @for (rec of recommendations(); track rec.offer._id; let i = $index) {
            <mat-card class="rec-card" [class]="scoreClass(rec.compatibilityScore)">
              <div class="rank-badge">#{{ i + 1 }}</div>

              <div class="rec-content">
                <div class="rec-header">
                  <div>
                    <h3>{{ rec.offer.title }}</h3>
                    <p>{{ rec.offer.company.name }} · {{ rec.offer.domain }} · {{ rec.offer.location.city }}</p>
                  </div>
                  <div class="score-circle" [class]="scoreClass(rec.compatibilityScore)">
                    {{ rec.compatibilityScore }}%
                  </div>
                </div>

                <div class="duration-info">
                  <mat-icon>schedule</mat-icon> {{ rec.offer.duration.months }} mois
                  @if (rec.offer.compensation.paid) {
                    · <mat-icon>payments</mat-icon> Rémunéré
                  }
                </div>

                @if (rec.matchedSkills.length) {
                  <div class="skills-section matched">
                    <span class="label">✅ Compétences matchées :</span>
                    @for (s of rec.matchedSkills; track s) {
                      <mat-chip class="match-chip">{{ s }}</mat-chip>
                    }
                  </div>
                }

                @if (rec.missingSkills.length) {
                  <div class="skills-section missing">
                    <span class="label">📚 À développer :</span>
                    @for (s of rec.missingSkills; track s) {
                      <mat-chip class="missing-chip">{{ s }}</mat-chip>
                    }
                  </div>
                }
              </div>

              <div class="rec-actions">
                <a mat-raised-button color="primary" [routerLink]="['/offers', rec.offer._id]">
                  <mat-icon>visibility</mat-icon> Voir l'offre
                </a>
                <button mat-stroked-button color="accent" (click)="applyQuick(rec.offer._id)">
                  <mat-icon>send</mat-icon> Postuler
                </button>
              </div>
            </mat-card>
          }
          @empty {
            <div class="empty-state">
              <mat-icon>psychology</mat-icon>
              <h3>Aucune recommandation disponible</h3>
              <p>Complétez votre profil et ajoutez des compétences pour obtenir des recommandations personnalisées.</p>
              <a mat-raised-button color="primary" routerLink="/profile">Compléter mon profil</a>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .recs-page { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h1 { margin: 0; font-size: 28px; font-weight: 700; }
      p { color: #666; margin: 4px 0 0; }
    }
    .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .tips-list { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .tip { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 13px;
      mat-icon { font-size: 18px; height: 18px; width: 18px; }
      &.error { background: #fee2e2; color: #991b1b; }
      &.warning { background: #fef3c7; color: #92400e; }
      &.info { background: #dbeafe; color: #1e40af; }
    }
    .suggestion-item { display: flex; justify-content: space-between; align-items: center; margin: 8px 0; gap: 12px;
      .skill-name { font-size: 14px; min-width: 100px; }
      .demand { display: flex; align-items: center; gap: 8px; flex: 1;
        mat-progress-bar { flex: 1; }
        span { font-size: 12px; color: #666; white-space: nowrap; }
      }
    }
    mat-divider { margin: 24px 0; }
    h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .recs-list { display: flex; flex-direction: column; gap: 16px; }
    .rec-card { position: relative; overflow: hidden; transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      &.high { border-left: 5px solid #10b981; }
      &.medium { border-left: 5px solid #f59e0b; }
      &.low { border-left: 5px solid #ef4444; }
    }
    .rank-badge { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px;
      background: #7c3aed; color: white; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-weight: 700; font-size: 13px;
    }
    .rec-content { padding: 20px; }
    .rec-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px;
      h3 { margin: 0; font-size: 18px; }
      p { margin: 4px 0 0; color: #666; font-size: 14px; }
    }
    .score-circle { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;
      &.high { background: #d1fae5; color: #065f46; }
      &.medium { background: #fef3c7; color: #92400e; }
      &.low { background: #fee2e2; color: #991b1b; }
    }
    .duration-info { display: flex; align-items: center; gap: 4px; font-size: 14px; color: #555; margin-bottom: 12px;
      mat-icon { font-size: 16px; height: 16px; width: 16px; }
    }
    .skills-section { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 8px;
      .label { font-size: 13px; color: #666; }
      .match-chip { background: #d1fae5; }
      .missing-chip { background: #fef3c7; }
    }
    .rec-actions { display: flex; gap: 12px; padding: 0 20px 20px; }
    .empty-state { text-align: center; padding: 60px;
      mat-icon { font-size: 80px; height: 80px; width: 80px; color: #7c3aed; opacity: 0.3; }
      h3 { font-size: 22px; font-weight: 600; }
      p { color: #666; max-width: 400px; margin: 12px auto 24px; }
    }
  `]
})
export class RecommendationsComponent implements OnInit {
  private recService = inject(RecommendationService);
  private appService = inject(ApplicationService);
  private notif = inject(NotificationService);

  recommendations = signal<Recommendation[]>([]);
  analysis = signal<ProfileAnalysis | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.recService.getRecommendations().subscribe({
      next: r => { this.recommendations.set(r.recommendations); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.recService.analyzeProfile().subscribe(a => this.analysis.set(a));
  }

  applyQuick(offerId: string): void {
    this.appService.apply(offerId).subscribe({
      next: () => this.notif.success('Candidature soumise !'),
      error: (err) => this.notif.error(err.error?.error || 'Erreur')
    });
  }

  scoreClass(s: number): string {
    if (s >= 70) return 'high';
    if (s >= 40) return 'medium';
    return 'low';
  }

  tipIcon(type: string): string {
    return type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';
  }
}
