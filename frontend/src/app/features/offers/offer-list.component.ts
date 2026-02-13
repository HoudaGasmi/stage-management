import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { OfferService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Offer } from '../../shared/models';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatChipsModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatBadgeModule
  ],
  template: `
    <div class="offers-page">
      <div class="page-header">
        <h1>Offres de stage</h1>
        @if (auth.isAdmin()) {
          <a mat-raised-button color="primary" routerLink="/offers/new">
            <mat-icon>add</mat-icon> Nouvelle offre
          </a>
        }
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <form [formGroup]="filterForm" class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Rechercher</mat-label>
            <input matInput formControlName="search" placeholder="Titre, entreprise...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Domaine</mat-label>
            <mat-select formControlName="domain">
              <mat-option value="">Tous</mat-option>
              @for (d of domains(); track d) {
                <mat-option [value]="d">{{ d }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" *ngIf="auth.isAdmin()">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="status">
              <mat-option value="">Tous</mat-option>
              <mat-option value="published">Publiée</mat-option>
              <mat-option value="draft">Brouillon</mat-option>
              <mat-option value="closed">Fermée</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-stroked-button type="button" (click)="resetFilters()">
            <mat-icon>clear</mat-icon> Réinitialiser
          </button>
        </form>
      </mat-card>

      <!-- Results -->
      <div class="results-info">
        <span>{{ total() }} offre(s) trouvée(s)</span>
      </div>

      @if (loading()) {
        <div class="loading-center"><mat-spinner /></div>
      } @else {
        <div class="offers-grid">
          @for (offer of offers(); track offer._id) {
            <mat-card class="offer-card" [routerLink]="['/offers', offer._id]">
              <div class="offer-status-bar" [class]="offer.status"></div>
              <mat-card-header>
                <div class="company-logo" mat-card-avatar>
                  {{ offer.company.name.charAt(0) }}
                </div>
                <mat-card-title>{{ offer.title }}</mat-card-title>
                <mat-card-subtitle>{{ offer.company.name }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="offer-meta">
                  <span><mat-icon>location_on</mat-icon>{{ offer.location.city }}</span>
                  <span><mat-icon>schedule</mat-icon>{{ offer.duration.months }} mois</span>
                  <span><mat-icon>category</mat-icon>{{ offer.domain }}</span>
                  @if (offer.compensation.paid) {
                    <span class="paid"><mat-icon>payments</mat-icon>Rémunéré</span>
                  }
                </div>
                <div class="skills-preview">
                  @for (skill of offer.requiredSkills.slice(0, 3); track skill.name) {
                    <mat-chip>{{ skill.name }}</mat-chip>
                  }
                  @if (offer.requiredSkills.length > 3) {
                    <mat-chip>+{{ offer.requiredSkills.length - 3 }}</mat-chip>
                  }
                </div>
                @if (offer.deadline) {
                  <p class="deadline" [class.expired]="isExpired(offer.deadline)">
                    <mat-icon>event</mat-icon>
                    Deadline: {{ offer.deadline | date:'dd/MM/yyyy' }}
                    {{ isExpired(offer.deadline) ? '(Expirée)' : '' }}
                  </p>
                }
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/offers', offer._id]">Voir détails</a>
                @if (auth.isStudent()) {
                  <a mat-raised-button color="accent" [routerLink]="['/offers', offer._id]">
                    Postuler
                  </a>
                }
                @if (auth.isAdmin()) {
                  <span class="status-chip" [class]="offer.status">{{ offer.status }}</span>
                }
              </mat-card-actions>
            </mat-card>
          }
          @empty {
            <div class="empty-state">
              <mat-icon>search_off</mat-icon>
              <p>Aucune offre trouvée.</p>
            </div>
          }
        </div>

        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    .offers-page { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h1 { margin: 0; font-size: 28px; font-weight: 700; }
    }
    .filters-card { margin-bottom: 20px; padding: 16px;
      .filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
        mat-form-field { min-width: 200px; }
      }
    }
    .results-info { color: #666; margin-bottom: 16px; font-size: 14px; }
    .loading-center { display: flex; justify-content: center; padding: 60px; }
    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .offer-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;
      &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      .offer-status-bar { height: 4px; position: absolute; top: 0; left: 0; right: 0;
        &.published { background: #10b981; }
        &.draft { background: #f59e0b; }
        &.closed { background: #ef4444; }
      }
    }
    .company-logo { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 18px;
    }
    .offer-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0;
      span { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #555;
        mat-icon { font-size: 16px; height: 16px; width: 16px; }
        &.paid { color: #10b981; font-weight: 600; }
      }
    }
    .skills-preview { display: flex; flex-wrap: wrap; gap: 6px; mat-chip { font-size: 12px; } }
    .deadline { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; margin-top: 8px;
      mat-icon { font-size: 14px; height: 14px; width: 14px; }
      &.expired { color: #ef4444; }
    }
    .status-chip { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
      &.published { background: #d1fae5; color: #065f46; }
      &.draft { background: #fef3c7; color: #92400e; }
      &.closed { background: #fee2e2; color: #991b1b; }
    }
    .empty-state { grid-column: 1/-1; text-align: center; padding: 60px;
      mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ccc; }
      p { color: #999; font-size: 18px; }
    }
  `]
})
export class OfferListComponent implements OnInit {
  private offerService = inject(OfferService);
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  offers = signal<Offer[]>([]);
  domains = signal<string[]>([]);
  total = signal(0);
  loading = signal(false);
  page = signal(1);
  pageSize = 10;

  filterForm = this.fb.group({
    search: [''],
    domain: [''],
    status: ['']
  });

  ngOnInit(): void {
    this.loadDomains();
    this.loadOffers();
    this.filterForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.page.set(1);
      this.loadOffers();
    });
  }

  loadOffers(): void {
    this.loading.set(true);
    const { search, domain, status } = this.filterForm.value;
    const params: any = { page: this.page(), limit: this.pageSize };
    if (search) params.search = search;
    if (domain) params.domain = domain;
    if (status) params.status = status;

    this.offerService.getOffers(params).subscribe({
      next: res => { this.offers.set(res.offers); this.total.set(res.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadDomains(): void {
    this.offerService.getDomains().subscribe(d => this.domains.set(d));
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex + 1);
    this.loadOffers();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', domain: '', status: '' });
  }

  isExpired(deadline: string): boolean {
    return new Date(deadline) < new Date();
  }
}
