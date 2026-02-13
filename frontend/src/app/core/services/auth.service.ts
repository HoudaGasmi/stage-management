import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, LoginDto, RegisterDto } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API = `${environment.apiUrl}/auth`;

  // ─── Signals (Angular 21 reactive state) ──────────────────────────────
  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  private _token = signal<string | null>(localStorage.getItem('token'));

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._currentUser());
  readonly isStudent = computed(() => this._currentUser()?.role === 'student');
  readonly isSupervisor = computed(() => this._currentUser()?.role === 'supervisor');
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  private loadUserFromStorage(): User | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch { return null; }
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, dto).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, dto).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe({ error: () => {} });
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.API}/refresh`, { refreshToken }
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        this._token.set(res.token);
      })
    );
  }

  getMe(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API}/me`).pipe(
      tap(res => {
        this._currentUser.set(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.API}/change-password`, { currentPassword, newPassword });
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this._currentUser()?.role ?? '');
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this._token.set(res.token);
    this._currentUser.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this._token.set(null);
    this._currentUser.set(null);
  }
}
