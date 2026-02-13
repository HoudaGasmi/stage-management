// ─── User & Auth ──────────────────────────────────────────────────────────
export type UserRole = 'student' | 'supervisor' | 'admin';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ─── Student ──────────────────────────────────────────────────────────────
export type SkillLevel = 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
export type SkillCategory = 'technique' | 'langue' | 'soft-skill' | 'autre';
export type StudyLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | 'Ingénieur 1' | 'Ingénieur 2' | 'Ingénieur 3';

export interface Skill {
  _id?: string;
  name: string;
  level: SkillLevel;
  category: SkillCategory;
}

export interface Language {
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'natif';
}

export interface CV {
  filename: string;
  originalName: string;
  uploadedAt: string;
  url: string;
}

export interface Student {
  _id: string;
  user: User;
  studentId?: string;
  university?: string;
  department?: string;
  level?: StudyLevel;
  skills: Skill[];
  languages: Language[];
  cv?: CV;
  bio?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  availability?: { startDate: string; endDate: string; fullTime: boolean };
  desiredDomain: string[];
  gpa?: number;
  createdAt: string;
}

// ─── Offer ────────────────────────────────────────────────────────────────
export type OfferStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface RequiredSkill {
  name: string;
  level: SkillLevel;
  required: boolean;
}

export interface Offer {
  _id: string;
  title: string;
  company: { name: string; logo?: string; website?: string; sector?: string };
  description: string;
  mission?: string;
  requiredSkills: RequiredSkill[];
  domain: string;
  location: { city: string; country: string; remote: boolean };
  duration: { months: number; startDate?: string; endDate?: string };
  compensation: { paid: boolean; amount?: number; currency: string };
  targetLevel: StudyLevel[];
  status: OfferStatus;
  maxCandidates: number;
  currentCandidates: number;
  deadline?: string;
  createdBy: Partial<User>;
  views: number;
  tags: string[];
  isExpired?: boolean;
  createdAt: string;
}

// ─── Application ──────────────────────────────────────────────────────────
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  _id: string;
  student: Student;
  offer: Offer;
  status: ApplicationStatus;
  coverLetter?: string;
  compatibilityScore?: number;
  matchedSkills: string[];
  missingSkills: string[];
  timeline: { status: string; date: string; note?: string }[];
  createdAt: string;
}

// ─── Internship ───────────────────────────────────────────────────────────
export interface Report {
  _id: string;
  title: string;
  content?: string;
  file?: { filename: string; url: string };
  submittedAt: string;
  feedback?: string;
  grade?: number;
  validated: boolean;
}

export interface Internship {
  _id: string;
  student: Student;
  offer: Offer;
  supervisor?: User;
  companySupervisor?: { name: string; email: string; phone?: string; position?: string };
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  reports: Report[];
  objectives: { description: string; completed: boolean }[];
  finalGrade?: number;
  supervisorComment?: string;
  validated: boolean;
  createdAt: string;
}

// ─── Recommendation ───────────────────────────────────────────────────────
export interface Recommendation {
  offer: Offer;
  compatibilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ProfileAnalysis {
  suggestions: { skill: string; demandCount: number }[];
  profileCompleteness: number;
  cvTips: { type: 'error' | 'warning' | 'info'; message: string }[];
}

// ─── Pagination ───────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ─── Stats ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  kpis: {
    totalStudents: number;
    totalOffers: number;
    publishedOffers: number;
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    activeInternships: number;
    completedInternships: number;
    acceptanceRate: number;
  };
  charts: {
    applicationsByStatus: Record<string, number>;
    offersByDomain: { domain: string; count: number }[];
    applicationsTrend: { period: string; count: number }[];
  };
}
