import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Services
import { OrderService, Order } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

// Components
import { CardComponent } from '../../theme/shared/components/card/card.component';

// Icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  SearchOutline,
  FilterOutline,
  EyeOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  MoreOutline,
  ShoppingCartOutline,
  UserOutline,
  ShopOutline,
  CalendarOutline,
  DollarOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, IconDirective],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Search and filters
  searchTerm = '';
  statusFilter = 'all';
  paymentStatusFilter = 'all';

  // Selected order for details
  selectedOrder: Order | null = null;
  showOrderDetails = false;

  // Math object for template usage
  Math = Math;

  constructor(
    private iconService: IconService,
    private orderService: OrderService,
    private authService: AuthService
  ) {
    this.iconService.addIcon(
      ...[
        SearchOutline,
        FilterOutline,
        EyeOutline,
        CheckCircleOutline,
        CloseCircleOutline,
        MoreOutline,
        ShoppingCartOutline,
        UserOutline,
        ShopOutline,
        CalendarOutline,
        DollarOutline
      ]
    );
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService
      .getRecentOrders(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orders = response.orders || [];
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.error = 'Failed to load orders';
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.showOrderDetails = false;
  }

  updateOrderStatus(order: Order, status: string): void {
    if (confirm(`Are you sure you want to update order #${order.orderNumber} to ${status}?`)) {
      this.orderService
        .updateOrderStatus(order.id, status)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            order.status = status;
            this.loadOrders(); // Refresh the list
          },
          error: (error) => {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
          }
        });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-light-success text-success';
      case 'pending':
        return 'bg-light-warning text-warning';
      case 'processing':
      case 'confirmed':
        return 'bg-light-info text-info';
      case 'shipped':
        return 'bg-light-primary text-primary';
      case 'cancelled':
      case 'refunded':
        return 'bg-light-danger text-danger';
      default:
        return 'bg-light-secondary text-secondary';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-light-success text-success';
      case 'pending':
        return 'bg-light-warning text-warning';
      case 'processing':
        return 'bg-light-info text-info';
      case 'failed':
      case 'cancelled':
        return 'bg-light-danger text-danger';
      case 'refunded':
        return 'bg-light-secondary text-secondary';
      default:
        return 'bg-light-secondary text-secondary';
    }
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getFilteredOrders(): Order[] {
    let filtered = this.orders;

    if (this.searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          order.user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          order.vendor.businessName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status.toLowerCase() === this.statusFilter);
    }

    if (this.paymentStatusFilter !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus.toLowerCase() === this.paymentStatusFilter);
    }

    return filtered;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
