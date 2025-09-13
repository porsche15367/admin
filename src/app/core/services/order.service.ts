import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  vendorId: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
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
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productSnapshot: any;
    product?: {
      id: string;
      name: string;
    };
  }>;
}

export interface OrderStatusUpdate {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private apiService: ApiService) {}

  // Get all orders with pagination
  getAllOrders(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('/admin-analytics/recent-orders', { limit: page * limit });
  }

  // Get recent orders for admin dashboard
  getRecentOrders(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('/orders', { page, limit });
  }

  // Get order by ID
  getOrderById(orderId: string): Observable<Order> {
    return this.apiService.get<Order>(`/orders/${orderId}`);
  }

  // Update order status
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.apiService.put(`/orders/${orderId}/status`, { status });
  }

  // Get orders by status
  getOrdersByStatus(status: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get('/orders', { status, page, limit });
  }

  // Get orders by vendor
  getOrdersByVendor(vendorId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get(`/vendors/${vendorId}/orders`, { page, limit });
  }

  // Get orders by user
  getOrdersByUser(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get(`/users/${userId}/orders`, { page, limit });
  }

  // Cancel order
  cancelOrder(orderId: string): Observable<any> {
    return this.apiService.put(`/orders/${orderId}/cancel`, {});
  }

  // Get order statistics
  getOrderStatistics(): Observable<any> {
    return this.apiService.get('/admin-analytics/global-sales');
  }
}
