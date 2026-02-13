import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OfferService, ApplicationService, RecommendationService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Offer } from '../../shared/models';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDividerModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule
  ],
  template: `
    @if (loading()) {
      <div class="loading-center"><mat-spinner /></div>
    }
    @if (offer()) {
      <div class="offer-detail">
        <div class="back-link">
          <a mat-button routerLink="/offers"><mat-icon>arrow_back</mat-icon> Retour</a>
        </div>

        <!-- Score badge for students -->
        @if (auth.isStudent() && score() !== null) {
          <div class="score-banner" [class]="scoreClass()">
            <mat-icon>{{ score()! >= 70 ? 'star' : score()! >= 40 ? 'star_half' : 'star_border' }}</mat-icon>
            <div>
              <strong>Compatibilité : {{ score() }}%</strong>
              <p>Compétences correspondantes : {{ matchedSkills().join(', ') || 'Aucune' }}</p>
            </div>
          </div>
        }

        <mat-card class="main-card">
          <mat-card-header>
            <div class="company-logo" mat-card-avatar>{{ offer()!.company.name.charAt(0) }}</div>
            <mat-card-title>{{ offer()!.title }}</mat-card-title>
            <mat-card-subtitle>{{ offer()!.company.name }} · {{ offer()!.domain }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="meta-grid">
              <div class="meta-item">
                <mat-icon>location_on</mat-icon>
                <span>{{ offer()!.location.city }}, {{ offer()!.location.country }}
                  {{ offer()!.location.remote ? '(Télétravail possible)' : '' }}
                </span>
              </div>
              <div class="meta-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ offer()!.duration.months }} mois</span>
              </div>
              @if (offer()!.duration.startDate) {
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>Début : {{ offer()!.duration.startDate | date:'dd/MM/yyyy' }}</span>
                </div>
              }
              <div class="meta-item">
                <mat-icon>payments</mat-icon>
                <span>{{ offer()!.compensation.paid ? offer()!.compensation.amount + ' ' + offer()!.compensation.currency + '/mois' : 'Non rémunéré' }}</span>
              </div>
              @if (offer()!.deadline) {
                <div class="meta-item" [class.expired]="isExpired()">
                  <mat-icon>event_busy</mat-icon>
                  <span>Deadline : {{ offer()!.deadline | date:'dd/MM/yyyy' }}</span>
                </div>
              }
            </div>

            <mat-divider class="my-divider" />

            <h3>Description</h3>
            <p class="description">{{ offer()!.description }}</p>

            @if (offer()!.mission) {
              <h3>Mission</h3>
              <p class="description">{{ offer()!.mission }}</p>
            }

            <h3>Compétences requises</h3>
            <div class="skills-grid">
              @for (skill of offer()!.requiredSkills; track skill.name) {
                <div class="skill-tag" [class.matched]="matchedSkills().includes(skill.name.toLowerCase())"
                     [class.required]="skill.required">
                  <mat-icon>{{ matchedSkills().includes(skill.name.toLowerCase()) ? 'check_circle' : skill.required ? 'error' : 'radio_button_unchecked' }}</mat-icon>
                  {{ skill.name }}
                  <span class="level">{{ skill.level }}</span>
                  @if (skill.required) { <span class="badge">requis</span> }
                </div>
              }
            </div>

            @if (offer()!.targetLevel?.length) {
              <h3>Niveau cible</h3>
              <div class="chips-row">
                @for (level of offer()!.targetLevel; track level) {
                  <mat-chip>{{ level }}</mat-chip>
                }
              </div>
            }

            @if (offer()!.tags?.length) {
              <h3>Tags</h3>
              <div class="chips-row">
                @for (tag of offer()!.tags; track tag) {
                  <mat-chip>#{{ tag }}</mat-chip>
                }
              </div>
            }
          </mat-card-content>

          <mat-card-actions>
            @if (auth.isStudent() && !applied() && !isExpired()) {
              <div class="apply-section">
                <mat-form-field appearance="outline" class="cover-letter">
                  <mat-label>Lettre de motivation (optionnel)</mat-label>
                  <textarea matInput [formControl]="coverLetter" rows="4"
                            placeholder="Décrivez votre motivation..."></textarea>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="apply()" [disabled]="applying()">
                  @if (applying()) { <mat-spinner diameter="20" /> } @else {
                    <mat-icon>send</mat-icon> Postuler
                  }
                </button>
              </div>
            }
            @if (applied()) {
              <div class="applied-badge">
                <mat-icon>check_circle</mat-icon> Candidature soumise
              </div>
            }
            @if (auth.isAdmin()) {
              <a mat-button [routerLink]="['/offers', offer()!._id, 'edit']">
                <mat-icon>edit</mat-icon> Modifier
              </a>
              <button mat-button color="warn" (click)="toggleStatus()">
                {{ offer()!.status === 'published' ? 'Fermer' : 'Publier' }}
              </button>
            }
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .offer-detail { max-width: 900px; margin: 0 auto; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .score-banner { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;
      mat-icon { font-size: 32px; height: 32px; width: 32px; }
      p { margin: 4px 0 0; font-size: 13px; }
      strong { font-size: 18px; }
      &.high { background: #d1fae5; color: #065f46; }
      &.medium { background: #fef3c7; color: #92400e; }
      &.low { background: #fee2e2; color: #991b1b; }
    }
    .main-card { margin-top: 16px; }
    .company-logo { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 22px;
    }
    .meta-grid { display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0; }
    .meta-item { display: flex; align-items: center; gap: 6px; color: #555; font-size: 14px;
      mat-icon { font-size: 18px; height: 18px; width: 18px; color: #7c3aed; }
      &.expired { color: #ef4444; }
    }
    .my-divider { margin: 16px 0; }
    h3 { font-size: 16px; font-weight: 600; margin: 16px 0 10px; color: #333; }
    .description { color: #555; line-height: 1.7; white-space: pre-wrap; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .skill-tag { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px;
      background: #f3f4f6; font-size: 13px; border: 2px solid transparent;
      mat-icon { font-size: 16px; height: 16px; width: 16px; color: #9ca3af; }
      .level { font-size: 11px; color: #9ca3af; }
      .badge { background: #7c3aed; color: white; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
      &.matched { background: #d1fae5; border-color: #10b981;
        mat-icon { color: #10b981; }
      }
      &.required:not(.matched) { background: #fff1f2; border-color: #fecaca;
        mat-icon { color: #ef4444; }
      }
    }
    .chips-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .apply-section { width: 100%; display: flex; flex-direction: column; gap: 12px; padding-top: 16px;
      .cover-letter { width: 100%; }
    }
    .applied-badge { display: flex; align-items: center; gap: 8px; color: #10b981; font-weight: 600; padding: 12px;
      mat-icon { color: #10b981; }
    }
  `]
})
export class OfferDetailComponent implements OnInit {
  id = input<string>('');
  private offerService = inject(OfferService);
  private appService = inject(ApplicationService);
  private recService = inject(RecommendationService);
  auth = inject(AuthService);
  private notif = inject(NotificationService);
  private router = inject(Router);

  offer = signal<Offer | null>(null);
  loading = signal(true);
  score = signal<number | null>(null);
  matchedSkills = signal<string[]>([]);
  applied = signal(false);
  applying = signal(false);
  coverLetter = new FormControl('');

  ngOnInit(): void {
    this.offerService.getOffer(this.id()).subscribe({
      next: o => { this.offer.set(o); this.loading.set(false);
        if (this.auth.isStudent()) this.loadScore();
      },
      error: () => this.loading.set(false)
    });
  }

  loadScore(): void {
    this.recService.getOfferScore(this.id()).subscribe(r => {
      this.score.set(r.score);
      this.matchedSkills.set(r.matched);
    });
  }

  apply(): void {
    this.applying.set(true);
    this.appService.apply(this.id(), this.coverLetter.value ?? undefined).subscribe({
      next: () => { this.applied.set(true); this.notif.success('Candidature soumise !'); this.applying.set(false); },
      error: (err) => { this.notif.error(err.error?.error || 'Erreur'); this.applying.set(false); }
    });
  }

  toggleStatus(): void {
    const newStatus = this.offer()?.status === 'published' ? 'closed' : 'published';
    this.offerService.updateStatus(this.id(), newStatus).subscribe({
      next: () => { this.notif.success('Statut mis à jour'); this.ngOnInit(); }
    });
  }

  isExpired(): boolean {
    return !!this.offer()?.deadline && new Date(this.offer()!.deadline!) < new Date();
  }

  scoreClass(): string {
    const s = this.score() ?? 0;
    if (s >= 70) return 'high';
    if (s >= 40) return 'medium';
    return 'low';
  }
}
