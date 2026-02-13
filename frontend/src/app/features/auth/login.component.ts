import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-login',
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
          <mat-card-title>Connexion</mat-card-title>
          <mat-card-subtitle>Bienvenue sur la plateforme de gestion des stages</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="votre@email.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email requis</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput formControlName="password"
                     [type]="showPassword() ? 'text' : 'password'">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Mot de passe requis</mat-error>
              }
            </mat-form-field>

            @if (errorMsg()) {
              <div class="error-banner">{{ errorMsg() }}</div>
            }

            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Se connecter
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Pas encore de compte ? <a routerLink="/auth/register">S'inscrire</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px;
      padding: 8px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      mat-icon { font-size: 36px; height: 36px; width: 36px; color: #667eea; }
      h1 { font-size: 24px; font-weight: 700; margin: 0; color: #333;
           span { color: #667eea; } }
    }
    .full-width { width: 100%; margin-bottom: 12px; }
    .submit-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-banner {
      background: #fff3cd; color: #856404; border: 1px solid #ffeeba;
      border-radius: 8px; padding: 10px 16px; margin-bottom: 12px; font-size: 14px;
    }
    mat-card-actions { justify-content: center;
      a { color: #667eea; font-weight: 600; text-decoration: none; }
      a:hover { text-decoration: underline; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notif = inject(NotificationService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        this.notif.success(`Bienvenue, ${res.user.firstName} !`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.error || 'Erreur de connexion.');
        this.loading.set(false);
      }
    });
  }
}
