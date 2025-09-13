import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessDescription?: string;
  address?: string;
  phone?: string;
  isApproved: boolean;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  vendorCategory: {
    id: string;
    name: string;
  };
  _count: {
    products: number;
    orders: number;
  };
}

export interface VendorProfile extends Vendor {
  products: Array<{
    id: string;
    name: string;
    price: number;
    salesCount: number;
    stockQuantity: number;
    isActive: boolean;
    createdAt: string;
    category: {
      id: string;
      name: string;
    };
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    finalAmount: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  constructor(private apiService: ApiService) {}

  // Get all vendors with pagination
  getAllVendors(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('/admin-analytics/vendors', { page, limit });
  }

  // Get vendor profile with detailed information
  getVendorProfile(vendorId: string): Observable<VendorProfile> {
    return this.apiService.get<VendorProfile>(`/admin-analytics/vendors/${vendorId}`);
  }

  // Approve vendor
  approveVendor(vendorId: string): Observable<any> {
    return this.apiService.put(`/vendors/${vendorId}/approve`, {});
  }

  // Get vendor products
  getVendorProducts(vendorId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get(`/vendors/${vendorId}/products`, { page, limit });
  }

  // Get vendor orders
  getVendorOrders(vendorId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get(`/vendors/${vendorId}/orders`, { page, limit });
  }

  // Update vendor status
  updateVendorStatus(vendorId: string, isApproved: boolean): Observable<any> {
    return this.apiService.put(`/vendors/${vendorId}`, { isApproved });
  }

  // Get vendor categories
  getVendorCategories(): Observable<any> {
    return this.apiService.get('/vendor-categories');
  }
}
