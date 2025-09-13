import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isBlocked: boolean;
  isSuspended: boolean;
  suspendedUntil?: string;
  suspensionReason?: string;
  blockedAt?: string;
  blockReason?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  _count: {
    orders: number;
    addresses: number;
  };
}

export interface UserDetails extends User {
  addresses: Array<{
    id: string;
    city: string;
    street: string;
    building: string;
    landmark: string;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SuspendUserRequest {
  duration: string;
  reason: string;
}

export interface BlockUserRequest {
  reason: string;
}

export interface UnblockUserRequest {
  reason?: string;
}

export interface GetUsersQuery {
  page?: string;
  limit?: string;
  isBlocked?: string;
  isSuspended?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(private apiService: ApiService) {}

  // Get all users with filtering and pagination
  getAllUsers(query: GetUsersQuery = {}): Observable<UsersResponse> {
    return this.apiService.get<UsersResponse>('/users/admin/all', query);
  }

  // Get user details by ID
  getUserById(userId: string): Observable<UserDetails> {
    return this.apiService.get<UserDetails>(`/users/admin/${userId}`);
  }

  // Suspend user
  suspendUser(userId: string, suspendData: SuspendUserRequest): Observable<User> {
    return this.apiService.put<User>(`/users/admin/${userId}/suspend`, suspendData);
  }

  // Unsuspend user
  unsuspendUser(userId: string): Observable<User> {
    return this.apiService.put<User>(`/users/admin/${userId}/unsuspend`, {});
  }

  // Block user
  blockUser(userId: string, blockData: BlockUserRequest): Observable<User> {
    return this.apiService.put<User>(`/users/admin/${userId}/block`, blockData);
  }

  // Unblock user
  unblockUser(userId: string, unblockData?: UnblockUserRequest): Observable<User> {
    return this.apiService.put<User>(`/users/admin/${userId}/unblock`, unblockData || {});
  }

  // Check and auto-unsuspend expired suspensions
  checkSuspensionStatus(): Observable<{ message: string; unsuspendedUsers: number }> {
    return this.apiService.post<{ message: string; unsuspendedUsers: number }>('/users/admin/check-suspensions', {});
  }

  // Helper method to get user status badge class
  getUserStatusClass(user: User): string {
    if (user.isBlocked) {
      return 'badge-danger';
    } else if (user.isSuspended) {
      return 'badge-warning';
    } else if (user.isVerified) {
      return 'badge-success';
    } else {
      return 'badge-secondary';
    }
  }

  // Helper method to get user status text
  getUserStatusText(user: User): string {
    if (user.isBlocked) {
      return 'Blocked';
    } else if (user.isSuspended) {
      return 'Suspended';
    } else if (user.isVerified) {
      return 'Verified';
    } else {
      return 'Unverified';
    }
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper method to check if suspension is expired
  isSuspensionExpired(user: User): boolean {
    if (!user.isSuspended || !user.suspendedUntil) {
      return false;
    }
    return new Date(user.suspendedUntil) <= new Date();
  }
}
