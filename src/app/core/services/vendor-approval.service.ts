import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UnapprovedVendor {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessDescription: string;
  address: string;
  phone: string;
  avatarUrl: string;
  isApproved: boolean;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  vendorCategory: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  _count: {
    products: number;
  };
}

export interface UnapprovedVendorsResponse {
  vendors: UnapprovedVendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VendorApprovalResponse {
  id: string;
  name: string;
  email: string;
  businessName: string;
  isApproved: boolean;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorApprovalService {
  private readonly baseUrl = '/vendors';

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Get all unapproved vendors with pagination
   */
  getUnapprovedVendors(page: number = 1, limit: number = 10): Observable<UnapprovedVendorsResponse> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    return this.apiService.get<UnapprovedVendorsResponse>(`${this.baseUrl}/unapproved`, { params });
  }

  /**
   * Get vendor details by ID (for approval review)
   */
  getVendorDetails(vendorId: string): Observable<UnapprovedVendor> {
    return this.apiService.get<UnapprovedVendor>(`${this.baseUrl}/${vendorId}`);
  }

  /**
   * Approve a vendor
   */
  approveVendor(vendorId: string): Observable<VendorApprovalResponse> {
    return this.apiService.put<VendorApprovalResponse>(`${this.baseUrl}/${vendorId}/approve`, {});
  }

  /**
   * Reject a vendor
   */
  rejectVendor(vendorId: string): Observable<VendorApprovalResponse> {
    return this.apiService.put<VendorApprovalResponse>(`${this.baseUrl}/${vendorId}/reject`, {});
  }

  /**
   * Get vendor profile with full details (for admin review)
   */
  getVendorProfile(vendorId: string): Observable<any> {
    return this.apiService.get<any>(`/admin-analytics/vendors/${vendorId}`);
  }
}
