import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InternshipService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Internship } from '../../shared/models';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    MatProgressSpinnerModule, MatChipsModule, MatFormFieldModule,
    MatInputModule, MatExpansionModule
  ],
  template: `
    <div class="tracking-page">
      <h1>Suivi des Stages</h1>

      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        @for (internship of internships(); track internship._id) {
          <mat-card class="internship-card">
            <!-- Header -->
            <mat-card-header>
              <mat-icon mat-card-avatar [class]="'status-icon ' + internship.status">
                {{ internship.status === 'active' ? 'work' : internship.status === 'completed' ? 'check_circle' : 'schedule' }}
              </mat-icon>
              <mat-card-title>{{ internship.offer.title }}</mat-card-title>
              <mat-card-subtitle>{{ internship.offer.company.name }}</mat-card-subtitle>
              <div class="status-chip" [class]="internship.status">{{ statusLabel(internship.status) }}</div>
            </mat-card-header>

            <mat-card-content>
              <!-- Timeline -->
              <div class="timeline-info">
                <div class="tl-item">
                  <mat-icon>event</mat-icon>
                  <div>
                    <strong>Début</strong>
                    <span>{{ internship.startDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                <div class="tl-arrow">→</div>
                <div class="tl-item">
                  <mat-icon>event_available</mat-icon>
                  <div>
                    <strong>Fin</strong>
                    <span>{{ internship.endDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                @if (internship.supervisor) {
                  <div class="tl-item">
                    <mat-icon>supervisor_account</mat-icon>
                    <div>
                      <strong>Encadrant</strong>
                      <span>{{ internship.supervisor.firstName }} {{ internship.supervisor.lastName }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Progress -->
              @if (internship.status === 'active') {
                <div class="progress-section">
                  <div class="progress-header">
                    <span>Progression</span>
                    <span>{{ getProgress(internship) }}%</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="getProgress(internship)" color="accent" />
                </div>
              }

              <!-- Objectives -->
              @if (internship.objectives?.length) {
                <mat-accordion>
                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        Objectifs ({{ completedObjectives(internship) }}/{{ internship.objectives.length }})
                      </mat-panel-title>
                    </mat-expansion-panel-header>
                    @for (obj of internship.objectives; track obj.description) {
                      <div class="obj-item" [class.done]="obj.completed">
                        <mat-icon>{{ obj.completed ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
                        {{ obj.description }}
                      </div>
                    }
                  </mat-expansion-panel>
                </mat-accordion>
              }

              <!-- Reports -->
              <div class="reports-section">
                <h4>Rapports ({{ internship.reports.length }})</h4>
                @for (report of internship.reports; track report._id) {
                  <div class="report-item">
                    <mat-icon [class.validated]="report.validated">
                      {{ report.validated ? 'verified' : 'description' }}
                    </mat-icon>
                    <div class="report-info">
                      <strong>{{ report.title }}</strong>
                      <span>{{ report.submittedAt | date:'dd/MM/yyyy' }}</span>
                      @if (report.grade !== undefined) {
                        <span class="grade">{{ report.grade }}/20</span>
                      }
                    </div>
                    @if (report.feedback) {
                      <p class="feedback">{{ report.feedback }}</p>
                    }
                    @if (!auth.isStudent() && !report.validated) {
                      <button mat-button color="primary" (click)="openValidateReport(internship._id, report._id)">
                        Valider
                      </button>
                    }
                  </div>
                }

                <!-- Submit new report (student) -->
                @if (auth.isStudent() && internship.status === 'active') {
                  <div class="add-report">
                    <h4>Soumettre un rapport</h4>
                    <form [formGroup]="reportForm" (ngSubmit)="submitReport(internship._id)">
                      <mat-form-field appearance="outline" class="full">
                        <mat-label>Titre</mat-label>
                        <input matInput formControlName="title">
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="full">
                        <mat-label>Contenu</mat-label>
                        <textarea matInput formControlName="content" rows="4"></textarea>
                      </mat-form-field>
                      <button mat-raised-button color="accent" type="submit">
                        <mat-icon>upload</mat-icon> Soumettre
                      </button>
                    </form>
                  </div>
                }
              </div>

              <!-- Final grade -->
              @if (internship.finalGrade !== undefined) {
                <div class="final-grade">
                  <mat-icon>grade</mat-icon>
                  <strong>Note finale : {{ internship.finalGrade }}/20</strong>
                </div>
              }
            </mat-card-content>

            @if (!auth.isStudent() && internship.status === 'active') {
              <mat-card-actions>
                <button mat-raised-button color="primary" (click)="validateInternship(internship._id)">
                  <mat-icon>verified</mat-icon> Valider le stage
                </button>
              </mat-card-actions>
            }
          </mat-card>
        }
        @empty {
          <div class="empty-state">
            <mat-icon>work_outline</mat-icon>
            <p>Aucun stage en cours.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .tracking-page { max-width: 900px; margin: 0 auto;
      h1 { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .internship-card { margin-bottom: 24px; }
    .status-icon { font-size: 36px; height: 36px; width: 36px; border-radius: 50%; padding: 4px;
      &.active { color: #3b82f6; background: #dbeafe; }
      &.completed { color: #10b981; background: #d1fae5; }
      &.pending { color: #f59e0b; background: #fef3c7; }
    }
    .status-chip { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: auto;
      &.active { background: #dbeafe; color: #1e40af; }
      &.completed { background: #d1fae5; color: #065f46; }
      &.pending { background: #fef3c7; color: #92400e; }
    }
    .timeline-info { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 0;
      .tl-item { display: flex; align-items: center; gap: 8px;
        mat-icon { color: #7c3aed; }
        strong { display: block; font-size: 12px; color: #666; }
        span { font-size: 14px; }
      }
      .tl-arrow { color: #ccc; font-size: 20px; }
    }
    .progress-section { margin: 12px 0;
      .progress-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
    }
    .obj-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 14px;
      mat-icon { font-size: 20px; height: 20px; width: 20px; color: #9ca3af; }
      &.done { text-decoration: line-through; color: #999; mat-icon { color: #10b981; } }
    }
    .reports-section { margin-top: 16px;
      h4 { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
    }
    .report-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee;
      mat-icon { color: #9ca3af; margin-top: 2px; &.validated { color: #10b981; } }
      .report-info { flex: 1;
        strong { display: block; } span { font-size: 12px; color: #666; margin-right: 8px; }
        .grade { background: #7c3aed; color: white; padding: 1px 8px; border-radius: 4px; font-size: 12px; }
      }
      .feedback { font-size: 13px; color: #555; margin: 4px 0 0; font-style: italic; }
    }
    .add-report { margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 10px;
      h4 { margin-bottom: 12px; } .full { width: 100%; }
    }
    .final-grade { display: flex; align-items: center; gap: 8px; padding: 12px; background: #fef3c7;
      border-radius: 8px; margin-top: 12px;
      mat-icon { color: #f59e0b; } strong { font-size: 16px; }
    }
    .empty-state { text-align: center; padding: 60px;
      mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ccc; }
      p { color: #999; font-size: 18px; }
    }
  `]
})
export class TrackingComponent implements OnInit {
  private internshipService = inject(InternshipService);
  auth = inject(AuthService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  internships = signal<Internship[]>([]);
  loading = signal(true);

  reportForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required]
  });

  ngOnInit(): void {
    this.internshipService.getInternships().subscribe({
      next: i => { this.internships.set(i); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  completedObjectives(i: Internship): number {
    return (i.objectives ?? []).filter(o => o.completed).length;
  }

  getProgress(i: Internship): number {
    const start = new Date(i.startDate).getTime();
    const end = new Date(i.endDate).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }

  statusLabel(s: string): string {
    return { active: 'En cours', completed: 'Terminé', pending: 'En attente', cancelled: 'Annulé' }[s] ?? s;
  }

  submitReport(internshipId: string): void {
    if (this.reportForm.invalid) return;
    this.internshipService.submitReport(internshipId, this.reportForm.value as any).subscribe({
      next: () => { this.notif.success('Rapport soumis !'); this.reportForm.reset(); this.ngOnInit(); }
    });
  }

  openValidateReport(internshipId: string, reportId: string): void {
    const grade = prompt('Note (0-20) :');
    const feedback = prompt('Commentaire :') ?? '';
    if (grade === null) return;
    this.internshipService.validateReport(internshipId, reportId, {
      grade: parseFloat(grade), feedback
    }).subscribe({
      next: () => { this.notif.success('Rapport validé !'); this.ngOnInit(); }
    });
  }

  validateInternship(id: string): void {
    const grade = prompt('Note finale (0-20) :');
    const comment = prompt('Commentaire :') ?? '';
    if (grade === null) return;
    this.internshipService.validateInternship(id, {
      finalGrade: parseFloat(grade), comment
    }).subscribe({
      next: () => { this.notif.success('Stage validé !'); this.ngOnInit(); }
    });
  }
}
