import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: string;
  error?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Generic HTTP methods
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        params: httpParams
      })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders()
      })
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders()
      })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders()
      })
      .pipe(catchError(this.handleError));
  }

  // File upload
  uploadFile<T>(endpoint: string, file: File): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });

    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, formData, {
        headers
      })
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Handle 401 Unauthorized - Clear tokens and redirect
      if (error.status === 401) {
        console.warn('401 Unauthorized - Clearing tokens');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('admin_user');
        // Redirect will be handled by the auth interceptor
        errorMessage = 'Session expired. Please login again.';
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => errorMessage);
  };
}
