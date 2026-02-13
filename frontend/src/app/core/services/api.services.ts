import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Student, Skill, Offer, Application, Internship,
  Recommendation, ProfileAnalysis, DashboardStats, User
} from '../../shared/models';
import { environment } from '../../../environments/environment';

// ─── Student Service ───────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/students`;

  getMyProfile(): Observable<Student> {
    return this.http.get<Student>(`${this.base}/me`);
  }

  updateMyProfile(data: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.base}/me`, data);
  }

  addSkill(skill: Omit<Skill, '_id'>): Observable<Skill[]> {
    return this.http.post<Skill[]>(`${this.base}/me/skills`, skill);
  }

  removeSkill(skillId: string): Observable<{ skills: Skill[] }> {
    return this.http.delete<{ skills: Skill[] }>(`${this.base}/me/skills/${skillId}`);
  }

  uploadCv(file: File): Observable<{ cv: any }> {
    const fd = new FormData();
    fd.append('cv', file);
    return this.http.post<{ cv: any }>(`${this.base}/me/cv`, fd);
  }

  getAllStudents(params: any = {}): Observable<{ students: Student[]; total: number; pages: number }> {
    return this.http.get<any>(`${this.base}`, { params });
  }
}

// ─── Offer Service ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class OfferService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/offers`;

  getOffers(params: any = {}): Observable<{ offers: Offer[]; total: number; pages: number }> {
    return this.http.get<any>(this.base, { params });
  }

  getOffer(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.base}/${id}`);
  }

  createOffer(data: Partial<Offer>): Observable<Offer> {
    return this.http.post<Offer>(this.base, data);
  }

  updateOffer(id: string, data: Partial<Offer>): Observable<Offer> {
    return this.http.patch<Offer>(`${this.base}/${id}`, data);
  }

  updateStatus(id: string, status: string): Observable<Offer> {
    return this.http.patch<Offer>(`${this.base}/${id}/status`, { status });
  }

  deleteOffer(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  getDomains(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/domains`);
  }
}

// ─── Application Service ───────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/applications`;

  apply(offerId: string, coverLetter?: string): Observable<Application> {
    return this.http.post<Application>(this.base, { offerId, coverLetter });
  }

  getApplications(params: any = {}): Observable<{ applications: Application[]; total: number; pages: number }> {
    return this.http.get<any>(this.base, { params });
  }

  getApplication(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: string, note?: string): Observable<Application> {
    return this.http.patch<Application>(`${this.base}/${id}/status`, { status, note });
  }

  withdraw(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}

// ─── Internship Service ────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class InternshipService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/internships`;

  createInternship(data: any): Observable<Internship> {
    return this.http.post<Internship>(this.base, data);
  }

  getInternships(): Observable<Internship[]> {
    return this.http.get<Internship[]>(this.base);
  }

  getInternship(id: string): Observable<Internship> {
    return this.http.get<Internship>(`${this.base}/${id}`);
  }

  submitReport(id: string, data: { title: string; content: string; file?: File }): Observable<any> {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('content', data.content);
    if (data.file) fd.append('file', data.file);
    return this.http.post(`${this.base}/${id}/reports`, fd);
  }

  validateReport(internshipId: string, reportId: string, data: { feedback: string; grade: number }): Observable<any> {
    return this.http.patch(`${this.base}/${internshipId}/reports/${reportId}/validate`, data);
  }

  validateInternship(id: string, data: { finalGrade: number; comment: string }): Observable<any> {
    return this.http.patch(`${this.base}/${id}/validate`, data);
  }
}

// ─── Recommendation Service ────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/recommendations`;

  getRecommendations(): Observable<{ recommendations: Recommendation[]; total: number }> {
    return this.http.get<any>(this.base);
  }

  analyzeProfile(): Observable<ProfileAnalysis> {
    return this.http.get<ProfileAnalysis>(`${this.base}/profile-analysis`);
  }

  getOfferScore(offerId: string): Observable<{ score: number; matched: string[]; missing: string[] }> {
    return this.http.get<any>(`${this.base}/score/${offerId}`);
  }
}

// ─── Stats Service ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/stats/dashboard`);
  }
}

// ─── User Service ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getUsers(params: any = {}): Observable<{ users: User[]; total: number; pages: number }> {
    return this.http.get<any>(this.base, { params });
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
