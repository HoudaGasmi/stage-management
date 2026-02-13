import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

function passwordMatchValidator(control: AbstractControl) {
  const p = control.get('password')?.value;
  const c = control.get('confirmPassword')?.value;
  return p === c ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <div class="logo">
            <mat-icon>school</mat-icon>
            <h1>Stage<span>Manager</span></h1>
          </div>
          <mat-card-title>Créer un compte</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="firstName">
                @if (f['firstName'].invalid && f['firstName'].touched) {
                  <mat-error>Prénom requis</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="lastName">
                @if (f['lastName'].invalid && f['lastName'].touched) {
                  <mat-error>Nom requis</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput formControlName="password" [type]="show() ? 'text' : 'password'">
              <button mat-icon-button matSuffix type="button" (click)="show.set(!show())">
                <mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (f['password'].hasError('minlength')) {
                <mat-error>Minimum 8 caractères</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmer le mot de passe</mat-label>
              <input matInput formControlName="confirmPassword" [type]="show() ? 'text' : 'password'">
              @if (form.hasError('passwordMismatch') && f['confirmPassword'].touched) {
                <mat-error>Les mots de passe ne correspondent pas</mat-error>
              }
            </mat-form-field>

            @if (errorMsg()) {
              <div class="error-banner">{{ errorMsg() }}</div>
            }

            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading()">
              @if (loading()) { <mat-spinner diameter="20" /> } @else { Créer mon compte }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px;
    }
    .auth-card { width: 100%; max-width: 480px; border-radius: 16px; padding: 8px; }
    .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
      mat-icon { font-size: 36px; height: 36px; width: 36px; color: #667eea; }
      h1 { font-size: 24px; font-weight: 700; margin: 0; color: #333; span { color: #667eea; } }
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .submit-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-banner { background: #fff3cd; color: #856404; border: 1px solid #ffeeba;
      border-radius: 8px; padding: 10px 16px; margin-bottom: 12px; font-size: 14px; }
    mat-card-actions { justify-content: center;
      a { color: #667eea; font-weight: 600; text-decoration: none; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notif = inject(NotificationService);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  loading = signal(false);
  show = signal(false);
  errorMsg = signal('');
  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { confirmPassword, ...dto } = this.form.value;

    this.auth.register(dto as any).subscribe({
      next: () => {
        this.notif.success('Compte créé ! Bienvenue !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.error || 'Erreur lors de la création du compte.');
        this.loading.set(false);
      }
    });
  }
}
