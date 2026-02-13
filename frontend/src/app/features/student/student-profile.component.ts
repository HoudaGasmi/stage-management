import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService, RecommendationService } from '../../core/services/api.services';
import { NotificationService } from '../../core/services/notification.service';
import { Student, ProfileAnalysis } from '../../shared/models';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatProgressBarModule, MatTabsModule, MatDividerModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-page">
      <h1>Mon Profil</h1>

      @if (profile()) {
        <!-- Completeness Banner -->
        <mat-card class="completeness-card" [class]="completenessClass()">
          <div class="completeness-header">
            <mat-icon>{{ completeness() >= 80 ? 'verified' : 'warning' }}</mat-icon>
            <div>
              <strong>Profil complété à {{ completeness() }}%</strong>
              <p>{{ completenessMsg() }}</p>
            </div>
          </div>
          <mat-progress-bar mode="determinate" [value]="completeness()" [color]="completenessColor()" />
        </mat-card>

        <mat-tab-group>
          <!-- Informations -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <form [formGroup]="infoForm" (ngSubmit)="saveInfo()">
                <div class="row-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Université</mat-label>
                    <input matInput formControlName="university">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Département</mat-label>
                    <input matInput formControlName="department">
                  </mat-form-field>
                </div>
                <div class="row-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Niveau d'études</mat-label>
                    <mat-select formControlName="level">
                      @for (l of LEVELS; track l) { <mat-option [value]="l">{{ l }}</mat-option> }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>N° Étudiant</mat-label>
                    <input matInput formControlName="studentId">
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline" class="full">
                  <mat-label>Bio</mat-label>
                  <textarea matInput formControlName="bio" rows="4"
                            placeholder="Présentez-vous en quelques mots..."></textarea>
                </mat-form-field>
                <div class="row-3">
                  <mat-form-field appearance="outline">
                    <mat-label>LinkedIn</mat-label>
                    <input matInput formControlName="linkedIn">
                    <mat-icon matPrefix>link</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>GitHub</mat-label>
                    <input matInput formControlName="github">
                    <mat-icon matPrefix>code</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>GPA (/20)</mat-label>
                    <input matInput type="number" formControlName="gpa" min="0" max="20" step="0.1">
                  </mat-form-field>
                </div>
                <button mat-raised-button color="primary" type="submit" [disabled]="savingInfo()">
                  @if (savingInfo()) { <mat-spinner diameter="20" /> } @else {
                    <mat-icon>save</mat-icon> Enregistrer
                  }
                </button>
              </form>
            </div>
          </mat-tab>

          <!-- Compétences -->
          <mat-tab label="Compétences ({{ profile()!.skills.length }})">
            <div class="tab-content">
              <form [formGroup]="skillForm" (ngSubmit)="addSkill()" class="skill-form">
                <mat-form-field appearance="outline">
                  <mat-label>Nom de la compétence</mat-label>
                  <input matInput formControlName="name" placeholder="ex: React, Python, SQL...">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Niveau</mat-label>
                  <mat-select formControlName="level">
                    <mat-option value="débutant">Débutant</mat-option>
                    <mat-option value="intermédiaire">Intermédiaire</mat-option>
                    <mat-option value="avancé">Avancé</mat-option>
                    <mat-option value="expert">Expert</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Catégorie</mat-label>
                  <mat-select formControlName="category">
                    <mat-option value="technique">Technique</mat-option>
                    <mat-option value="langue">Langue</mat-option>
                    <mat-option value="soft-skill">Soft Skill</mat-option>
                    <mat-option value="autre">Autre</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="accent" type="submit">
                  <mat-icon>add</mat-icon> Ajouter
                </button>
              </form>

              <mat-divider />
              <div class="skills-list">
                @for (skill of profile()!.skills; track skill._id) {
                  <div class="skill-item">
                    <div class="skill-info">
                      <span class="skill-name">{{ skill.name }}</span>
                      <span class="skill-level" [class]="skill.level">{{ skill.level }}</span>
                      <span class="skill-cat">{{ skill.category }}</span>
                    </div>
                    <button mat-icon-button color="warn" (click)="removeSkill(skill._id!)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
                @if (!profile()!.skills.length) {
                  <p class="empty-msg">Aucune compétence ajoutée. Commencez par en ajouter une !</p>
                }
              </div>
            </div>
          </mat-tab>

          <!-- CV -->
          <mat-tab label="CV">
            <div class="tab-content">
              @if (profile()!.cv?.filename) {
                <div class="cv-current">
                  <mat-icon>picture_as_pdf</mat-icon>
                  <div>
                    <strong>{{ profile()!.cv!.originalName }}</strong>
                    <p>Uploadé le {{ profile()!.cv!.uploadedAt | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <a mat-button color="primary" [href]="'http://localhost:3000' + profile()!.cv!.url" target="_blank">
                    <mat-icon>download</mat-icon> Télécharger
                  </a>
                </div>
              }
              <div class="cv-upload">
                <p>{{ profile()!.cv ? 'Remplacer le CV' : 'Téléverser votre CV' }} (PDF ou Word, max 5MB)</p>
                <input #fileInput type="file" accept=".pdf,.doc,.docx" (change)="onCvSelected($event)" style="display:none">
                <button mat-raised-button color="primary" (click)="fileInput.click()" [disabled]="uploadingCv()">
                  @if (uploadingCv()) { <mat-spinner diameter="20" /> } @else {
                    <mat-icon>upload</mat-icon> {{ profile()!.cv ? 'Remplacer' : 'Uploader le CV' }}
                  }
                </button>
              </div>

              @if (analysis()) {
                <mat-divider />
                <h3>Conseils pour votre profil</h3>
                @for (tip of analysis()!.cvTips; track tip.message) {
                  <div class="tip" [class]="tip.type">
                    <mat-icon>{{ tip.type === 'error' ? 'error' : tip.type === 'warning' ? 'warning' : 'info' }}</mat-icon>
                    {{ tip.message }}
                  </div>
                }
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .profile-page { max-width: 900px; margin: 0 auto;
      h1 { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    }
    .completeness-card { margin-bottom: 24px; padding: 16px;
      .completeness-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
        mat-icon { font-size: 32px; height: 32px; width: 32px; }
        strong { font-size: 18px; } p { margin: 4px 0 0; font-size: 13px; color: #666; }
      }
      &.good { border-left: 4px solid #10b981; }
      &.medium { border-left: 4px solid #f59e0b; }
      &.low { border-left: 4px solid #ef4444; }
    }
    .tab-content { padding: 24px 0; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .full { width: 100%; }
    .skill-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin-bottom: 20px; }
    .skills-list { margin-top: 16px; }
    .skill-item { display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid #eee;
      .skill-info { display: flex; align-items: center; gap: 12px; }
      .skill-name { font-weight: 500; }
      .skill-level { padding: 2px 10px; border-radius: 12px; font-size: 12px;
        &.expert { background: #7c3aed1a; color: #7c3aed; }
        &.avancé { background: #3b82f61a; color: #3b82f6; }
        &.intermédiaire { background: #10b9811a; color: #10b981; }
        &.débutant { background: #f59e0b1a; color: #f59e0b; }
      }
      .skill-cat { font-size: 12px; color: #999; }
    }
    .empty-msg { color: #999; text-align: center; padding: 24px; }
    .cv-current { display: flex; align-items: center; gap: 16px; padding: 16px;
      background: #f8f9fa; border-radius: 10px; margin-bottom: 16px;
      mat-icon { font-size: 40px; height: 40px; width: 40px; color: #ef4444; }
      div { flex: 1; strong { display: block; } p { margin: 4px 0 0; font-size: 13px; color: #666; } }
    }
    .cv-upload { margin-top: 16px; p { color: #666; margin-bottom: 12px; } }
    .tip { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; margin-bottom: 8px;
      mat-icon { font-size: 20px; height: 20px; width: 20px; }
      &.error { background: #fee2e2; color: #991b1b; }
      &.warning { background: #fef3c7; color: #92400e; }
      &.info { background: #dbeafe; color: #1e40af; }
    }
  `]
})
export class StudentProfileComponent implements OnInit {
  private studentService = inject(StudentService);
  private recService = inject(RecommendationService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  profile = signal<Student | null>(null);
  analysis = signal<ProfileAnalysis | null>(null);
  savingInfo = signal(false);
  uploadingCv = signal(false);
  completeness = signal(0);

  LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'Ingénieur 1', 'Ingénieur 2', 'Ingénieur 3'];

  infoForm = this.fb.group({
    university: [''], department: [''], level: [''], studentId: [''],
    bio: [''], linkedIn: [''], github: [''], gpa: [null as number | null]
  });

  skillForm = this.fb.group({
    name: ['', Validators.required],
    level: ['intermédiaire'],
    category: ['technique']
  });

  ngOnInit(): void {
    this.studentService.getMyProfile().subscribe(p => {
      this.profile.set(p);
      this.completeness.set(this.calcCompleteness(p));
      this.infoForm.patchValue({
        university: p.university ?? '', department: p.department ?? '',
        level: p.level ?? '', studentId: p.studentId ?? '',
        bio: p.bio ?? '', linkedIn: p.linkedIn ?? '',
        github: p.github ?? '', gpa: p.gpa ?? null
      });
    });
    this.recService.analyzeProfile().subscribe(a => this.analysis.set(a));
  }

  saveInfo(): void {
    this.savingInfo.set(true);
    this.studentService.updateMyProfile(this.infoForm.value as any).subscribe({
      next: p => { this.profile.set(p); this.completeness.set(this.calcCompleteness(p)); this.notif.success('Profil mis à jour !'); this.savingInfo.set(false); },
      error: () => this.savingInfo.set(false)
    });
  }

  addSkill(): void {
    if (this.skillForm.invalid) return;
    this.studentService.addSkill(this.skillForm.value as any).subscribe({
      next: skills => {
        const p = { ...this.profile()!, skills };
        this.profile.set(p as Student);
        this.skillForm.reset({ name: '', level: 'intermédiaire', category: 'technique' });
        this.notif.success('Compétence ajoutée !');
      },
      error: (err) => this.notif.error(err.error?.error || 'Erreur')
    });
  }

  removeSkill(id: string): void {
    this.studentService.removeSkill(id).subscribe({
      next: r => {
        const p = { ...this.profile()!, skills: r.skills };
        this.profile.set(p as Student);
      }
    });
  }

  onCvSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingCv.set(true);
    this.studentService.uploadCv(file).subscribe({
      next: r => {
        const p = { ...this.profile()!, cv: r.cv };
        this.profile.set(p as Student);
        this.notif.success('CV téléversé !');
        this.uploadingCv.set(false);
      },
      error: () => this.uploadingCv.set(false)
    });
  }

  calcCompleteness(p: Student): number {
    let score = 0;
    if (p.bio) score += 10;
    if (p.skills?.length) score += 25;
    if (p.cv?.filename) score += 20;
    if (p.languages?.length) score += 10;
    if (p.linkedIn) score += 5;
    if (p.availability) score += 10;
    if (p.desiredDomain?.length) score += 10;
    if (p.university) score += 5;
    if (p.level) score += 5;
    return score;
  }

  completenessClass(): string {
    const c = this.completeness();
    if (c >= 80) return 'good';
    if (c >= 50) return 'medium';
    return 'low';
  }

  completenessColor(): 'primary' | 'accent' | 'warn' {
    const c = this.completeness();
    if (c >= 80) return 'accent';
    if (c >= 50) return 'primary';
    return 'warn';
  }

  completenessMsg(): string {
    const c = this.completeness();
    if (c >= 80) return 'Excellent profil ! Vous avez de bonnes chances de matchs.';
    if (c >= 50) return 'Bon profil. Complétez encore quelques informations.';
    return 'Profil incomplet. Complétez-le pour de meilleures recommandations.';
  }
}
