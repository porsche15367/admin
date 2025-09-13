import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
  type: 'admin';
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Ensure type is always 'admin' for admin login
    const loginData = { ...credentials, type: 'admin' };
    return this.apiService.post<LoginResponse>('/auth/login', loginData).pipe(
      map((response) => {
        if (response.access_token) {
          localStorage.setItem('admin_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));

          this.currentUserSubject.next(response.user as AdminUser);
          this.isAuthenticatedSubject.next(true);
        }
        return response;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_user');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return throwError(() => 'No refresh token available');
    }

    return this.apiService
      .post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken
      })
      .pipe(
        map((response) => {
          if (response.access_token) {
            localStorage.setItem('admin_token', response.access_token);
            if (response.refresh_token) {
              localStorage.setItem('refresh_token', response.refresh_token);
            }
          }
          return response;
        }),
        catchError((error) => {
          console.error('Token refresh error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  // Validate current token by making a test API call
  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      this.logout();
      return throwError(() => 'No token available');
    }

    return this.apiService.get('/auth/me').pipe(
      map(() => true),
      catchError((error) => {
        if (error.status === 401) {
          console.warn('Token validation failed - logging out');
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Check if token is expired without making API call
  isTokenExpired(): boolean {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  // Admin management methods
  createAdmin(adminData: any): Observable<any> {
    return this.apiService.post('/admins', adminData);
  }

  getAllAdmins(): Observable<any> {
    return this.apiService.get('/admins');
  }

  getAdminById(id: string): Observable<any> {
    return this.apiService.get(`/admins/${id}`);
  }

  getCurrentAdmin(): Observable<any> {
    return this.apiService.get('/admins/me');
  }

  deleteAdmin(id: string): Observable<any> {
    return this.apiService.delete(`/admins/${id}`);
  }
}
