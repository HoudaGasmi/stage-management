import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/api.services';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../shared/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSelectModule, MatProgressSpinnerModule, MatInputModule, MatFormFieldModule
  ],
  template: `
    <div class="admin-page">
      <h1>Administration</h1>

      <div class="admin-links">
        <a mat-raised-button color="primary" routerLink="/offers/new">
          <mat-icon>add</mat-icon> Nouvelle offre
        </a>
        <a mat-raised-button routerLink="/applications">
          <mat-icon>description</mat-icon> Toutes les candidatures
        </a>
        <a mat-raised-button routerLink="/internships">
          <mat-icon>work</mat-icon> Tous les stages
        </a>
      </div>

      <!-- User Management -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Gestion des utilisateurs</mat-card-title>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="search" (ngModelChange)="loadUsers()" placeholder="Nom, email...">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Rôle</mat-label>
              <mat-select [(ngModel)]="roleFilter" (ngModelChange)="loadUsers()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="student">Étudiant</mat-option>
                <mat-option value="supervisor">Encadrant</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-center"><mat-spinner /></div>
          } @else {
            <table mat-table [dataSource]="users()" class="users-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let u">
                  <div class="user-cell">
                    <div class="avatar">{{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}</div>
                    <div>
                      <strong>{{ u.firstName }} {{ u.lastName }}</strong>
                      <span>{{ u.email }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let u">
                  <span class="role-chip" [class]="u.role">{{ roleLabel(u.role) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let u">
                  <span [class]="u.isActive ? 'active' : 'inactive'">
                    {{ u.isActive ? 'Actif' : 'Désactivé' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Inscription</th>
                <td mat-cell *matCellDef="let u">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let u">
                  <mat-select [(ngModel)]="u.role" (ngModelChange)="changeRole(u._id, $event)"
                              style="width:130px; font-size:13px">
                    <mat-option value="student">Étudiant</mat-option>
                    <mat-option value="supervisor">Encadrant</mat-option>
                    <mat-option value="admin">Admin</mat-option>
                  </mat-select>
                  <button mat-icon-button [color]="u.isActive ? 'warn' : 'accent'" (click)="toggleActive(u)">
                    <mat-icon>{{ u.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns;"></tr>
            </table>
            <div class="table-footer">{{ total() }} utilisateur(s)</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1200px; margin: 0 auto;
      h1 { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    }
    .admin-links { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    mat-card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
    .filters { display: flex; gap: 12px;
      mat-form-field { width: 200px; }
    }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .users-table { width: 100%; }
    .user-cell { display: flex; align-items: center; gap: 12px;
      .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        color: white; font-size: 13px; font-weight: 700; flex-shrink: 0;
      }
      strong { display: block; font-size: 14px; }
      span { font-size: 12px; color: #666; }
    }
    .role-chip { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
      &.student { background: #dbeafe; color: #1e40af; }
      &.supervisor { background: #d1fae5; color: #065f46; }
      &.admin { background: #ede9fe; color: #5b21b6; }
    }
    .active { color: #10b981; font-weight: 600; }
    .inactive { color: #ef4444; font-weight: 600; }
    .table-footer { padding: 12px 0; color: #666; font-size: 14px; }
  `]
})
export class AdminComponent implements OnInit {
  private userService = inject(UserService);
  private notif = inject(NotificationService);

  users = signal<User[]>([]);
  total = signal(0);
  loading = signal(false);
  search = '';
  roleFilter = '';
  columns = ['name', 'role', 'status', 'createdAt', 'actions'];

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    const params: any = { limit: 50 };
    if (this.search) params.search = this.search;
    if (this.roleFilter) params.role = this.roleFilter;

    this.userService.getUsers(params).subscribe({
      next: r => { this.users.set(r.users); this.total.set(r.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  changeRole(id: string, role: string): void {
    this.userService.updateUser(id, { role: role as any }).subscribe({
      next: () => this.notif.success('Rôle mis à jour.')
    });
  }

  toggleActive(user: User): void {
    this.userService.updateUser(user._id, { isActive: !user.isActive }).subscribe({
      next: () => {
        this.notif.success(user.isActive ? 'Utilisateur désactivé.' : 'Utilisateur activé.');
        this.loadUsers();
      }
    });
  }

  roleLabel(role: string): string {
    return { student: 'Étudiant', supervisor: 'Encadrant', admin: 'Admin' }[role] ?? role;
  }
}
