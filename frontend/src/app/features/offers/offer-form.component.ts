import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OfferService } from '../../core/services/api.services';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="form-page">
      <div class="back-link">
        <a mat-button routerLink="/offers"><mat-icon>arrow_back</mat-icon> Retour aux offres</a>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ id() ? 'Modifier l\'offre' : 'Nouvelle offre' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <h3 class="section-title">Informations générales</h3>
            <div class="row-2">
              <mat-form-field appearance="outline">
                <mat-label>Titre du poste</mat-label>
                <input matInput formControlName="title" placeholder="ex: Stage Développeur Angular">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Domaine</mat-label>
                <mat-select formControlName="domain">
                  @for (d of DOMAINS; track d) { <mat-option [value]="d">{{ d }}</mat-option> }
                </mat-select>
              </mat-form-field>
            </div>

            <h3 class="section-title">Entreprise</h3>
            <div class="row-2">
              <mat-form-field appearance="outline">
                <mat-label>Nom de l'entreprise</mat-label>
                <input matInput formControlName="companyName">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Secteur</mat-label>
                <input matInput formControlName="companySector">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="5"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Mission</mat-label>
              <textarea matInput formControlName="mission" rows="3"></textarea>
            </mat-form-field>

            <h3 class="section-title">Localisation & Durée</h3>
            <div class="row-3">
              <mat-form-field appearance="outline">
                <mat-label>Ville</mat-label>
                <input matInput formControlName="city">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Durée (mois)</mat-label>
                <input matInput type="number" formControlName="durationMonths" min="1" max="12">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date limite candidature</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="deadline">
                <mat-datepicker-toggle matSuffix [for]="picker" />
                <mat-datepicker #picker />
              </mat-form-field>
            </div>
            <mat-checkbox formControlName="remote">Télétravail possible</mat-checkbox>
            <mat-checkbox formControlName="paid" class="ml-16">Stage rémunéré</mat-checkbox>

            @if (form.get('paid')?.value) {
              <mat-form-field appearance="outline">
                <mat-label>Montant (TND/mois)</mat-label>
                <input matInput type="number" formControlName="compensationAmount">
              </mat-form-field>
            }

            <h3 class="section-title">Compétences requises</h3>
            <div formArrayName="requiredSkills">
              @for (skill of skillsArray.controls; track $index) {
                <div [formGroupName]="$index" class="skill-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Compétence</mat-label>
                    <input matInput formControlName="name">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Niveau</mat-label>
                    <mat-select formControlName="level">
                      <mat-option value="débutant">Débutant</mat-option>
                      <mat-option value="intermédiaire">Intermédiaire</mat-option>
                      <mat-option value="avancé">Avancé</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-checkbox formControlName="required">Requis</mat-checkbox>
                  <button mat-icon-button type="button" color="warn" (click)="removeSkill($index)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>
            <button mat-stroked-button type="button" (click)="addSkill()">
              <mat-icon>add</mat-icon> Ajouter une compétence
            </button>

            <h3 class="section-title">Niveaux cibles</h3>
            <mat-form-field appearance="outline">
              <mat-label>Niveaux d'études</mat-label>
              <mat-select formControlName="targetLevel" multiple>
                @for (l of LEVELS; track l) { <mat-option [value]="l">{{ l }}</mat-option> }
              </mat-select>
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button type="button" (click)="save('draft')">Sauvegarder brouillon</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
                @if (loading()) { <mat-spinner diameter="20" /> } @else { Publier }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-page { max-width: 900px; margin: 0 auto; }
    .section-title { font-size: 16px; font-weight: 600; color: #7c3aed; margin: 24px 0 12px; border-left: 3px solid #7c3aed; padding-left: 10px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .full { width: 100%; }
    .skill-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
    .ml-16 { margin-left: 16px; }
  `]
})
export class OfferFormComponent implements OnInit {
  id = input<string>('');
  private fb = inject(FormBuilder);
  private offerService = inject(OfferService);
  private notif = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);

  DOMAINS = ['Informatique', 'Réseaux', 'Cybersécurité', 'Data Science', 'IA', 'Finance', 'Marketing', 'RH', 'Mécanique', 'Électronique', 'Autre'];
  LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'Ingénieur 1', 'Ingénieur 2', 'Ingénieur 3'];

  form = this.fb.group({
    title: ['', Validators.required],
    domain: ['', Validators.required],
    companyName: ['', Validators.required],
    companySector: [''],
    description: ['', Validators.required],
    mission: [''],
    city: ['', Validators.required],
    durationMonths: [3, [Validators.required, Validators.min(1), Validators.max(12)]],
    deadline: [null],
    remote: [false],
    paid: [false],
    compensationAmount: [null],
    requiredSkills: this.fb.array([]),
    targetLevel: [[]]
  });

  get skillsArray() { return this.form.get('requiredSkills') as FormArray; }

  ngOnInit(): void {
    if (this.id()) {
      this.offerService.getOffer(this.id()).subscribe(offer => {
        this.form.patchValue({
          title: offer.title, domain: offer.domain,
          companyName: offer.company.name, companySector: offer.company.sector,
          description: offer.description, mission: offer.mission,
          city: offer.location.city, durationMonths: offer.duration.months,
          deadline: offer.deadline as any, remote: offer.location.remote,
          paid: offer.compensation.paid, compensationAmount: offer.compensation.amount as any,
          targetLevel: offer.targetLevel as any
        });
        offer.requiredSkills.forEach(s => this.addSkill(s));
      });
    }
  }

  addSkill(skill?: any): void {
    this.skillsArray.push(this.fb.group({
      name: [skill?.name ?? '', Validators.required],
      level: [skill?.level ?? 'intermédiaire'],
      required: [skill?.required ?? true]
    }));
  }

  removeSkill(i: number): void { this.skillsArray.removeAt(i); }

  onSubmit(): void { this.save('published'); }

  save(status: string): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const val = this.form.value;
    const payload: any = {
      title: val.title ?? undefined,
      domain: val.domain ?? undefined,
      status,
      company: { name: val.companyName ?? undefined, sector: val.companySector ?? undefined },
      description: val.description ?? undefined,
      mission: val.mission ?? undefined,
      location: { city: val.city ?? undefined, remote: val.remote ?? false },
      duration: { months: val.durationMonths ?? 1 },
      deadline: val.deadline ?? undefined,
      compensation: { paid: val.paid ?? false, amount: val.compensationAmount ?? undefined, currency: 'TND' },
      requiredSkills: val.requiredSkills ?? [],
      targetLevel: val.targetLevel ?? []
    };

    const req = this.id()
      ? this.offerService.updateOffer(this.id(), payload)
      : this.offerService.createOffer(payload);

    req.subscribe({
      next: () => { this.notif.success('Offre enregistrée !'); this.router.navigate(['/offers']); },
      error: (err) => { this.notif.error(err.error?.error || 'Erreur'); this.loading.set(false); }
    });
  }
}
