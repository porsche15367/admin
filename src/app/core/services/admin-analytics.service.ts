import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface GlobalSalesAnalytics {
  today: { revenue: number; orders: number };
  thisMonth: { revenue: number; orders: number };
  thisYear: { revenue: number; orders: number };
  total: { revenue: number; orders: number };
}

export interface MostSoldProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salesCount: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  vendor: {
    id: string;
    businessName: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalSales: number;
  productCount: number;
}

export interface SalesByVendorCategory {
  categoryId: string;
  categoryName: string;
  totalSales: number;
  vendorCount: number;
  totalProducts: number;
  totalOrders: number;
}

export interface TopVendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  isApproved: boolean;
  rating: number;
  totalSales: number;
  createdAt: string;
  vendorCategory: {
    id: string;
    name: string;
  };
  _count: {
    products: number;
    orders: number;
  };
}

export interface RecentOrder {
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
  vendor: {
    id: string;
    businessName: string;
    name: string;
  };
  items: Array<{
    quantity: number;
    totalPrice: number;
    product: {
      id: string;
      name: string;
    };
  }>;
}

export interface AdminDashboard {
  globalSales: GlobalSalesAnalytics;
  mostSoldProducts: MostSoldProduct[];
  salesByCategory: SalesByCategory[];
  salesByVendorCategory: SalesByVendorCategory[];
  topVendors: TopVendor[];
  recentOrders: RecentOrder[];
  totals: {
    users: number;
    vendors: number;
    products: number;
    orders: number;
  };
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  constructor(private apiService: ApiService) {}

  // Global sales analytics
  getGlobalSalesAnalytics(): Observable<GlobalSalesAnalytics> {
    return this.apiService.get<GlobalSalesAnalytics>('/admin-analytics/global-sales');
  }

  // Most sold products
  getMostSoldProducts(limit: number = 10): Observable<MostSoldProduct[]> {
    return this.apiService.get<MostSoldProduct[]>('/admin-analytics/most-sold-products', { limit });
  }

  // Sales by category
  getSalesByCategory(): Observable<SalesByCategory[]> {
    return this.apiService.get<SalesByCategory[]>('/admin-analytics/sales-by-category');
  }

  // Sales by vendor category
  getSalesByVendorCategory(): Observable<SalesByVendorCategory[]> {
    return this.apiService.get<SalesByVendorCategory[]>('/admin-analytics/sales-by-vendor-category');
  }

  // Top vendors
  getTopVendors(limit: number = 10): Observable<TopVendor[]> {
    return this.apiService.get<TopVendor[]>('/admin-analytics/top-vendors', { limit });
  }

  // Recent orders
  getRecentOrders(limit: number = 20): Observable<RecentOrder[]> {
    return this.apiService.get<RecentOrder[]>('/admin-analytics/recent-orders', { limit });
  }

  // Complete dashboard
  getAdminDashboard(): Observable<AdminDashboard> {
    return this.apiService.get<AdminDashboard>('/admin-analytics/dashboard');
  }

  // Vendor management
  getAllVendors(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('/admin-analytics/vendors', { page, limit });
  }

  getVendorProfile(vendorId: string): Observable<any> {
    return this.apiService.get(`/admin-analytics/vendors/${vendorId}`);
  }
}
