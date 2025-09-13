import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Services
import { AdminAnalyticsService, AdminDashboard, GlobalSalesAnalytics } from '../../core/services/admin-analytics.service';
import { AuthService } from '../../core/services/auth.service';

// Components
import { CardComponent } from '../../theme/shared/components/card/card.component';
import { MonthlyBarChartComponent } from '../../theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from '../../theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from '../../theme/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from '../../theme/shared/apexchart/sales-report-chart/sales-report-chart.component';

// Icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  RiseOutline,
  FallOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  UserOutline,
  ShopOutline,
  ShoppingCartOutline,
  DollarOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent,
    AnalyticsChartComponent,
    SalesReportChartComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  dashboardData: AdminDashboard | null = null;
  loading = true;
  error: string | null = null;

  // Analytics cards data
  analyticsCards: any[] = [];

  // Recent orders data
  recentOrders: any[] = [];

  constructor(
    private iconService: IconService,
    private adminAnalyticsService: AdminAnalyticsService,
    private authService: AuthService
  ) {
    this.iconService.addIcon(
      ...[
        RiseOutline,
        FallOutline,
        SettingOutline,
        GiftOutline,
        MessageOutline,
        UserOutline,
        ShopOutline,
        ShoppingCartOutline,
        DollarOutline
      ]
    );
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.adminAnalyticsService
      .getAdminDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.prepareAnalyticsCards(data);
          this.prepareRecentOrders(data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Failed to load dashboard data';
          this.loading = false;
        }
      });
  }

  private prepareAnalyticsCards(data: AdminDashboard): void {
    this.analyticsCards = [
      {
        title: 'Total Users',
        amount: data.totals.users.toLocaleString(),
        background: 'bg-light-primary',
        border: 'border-primary',
        icon: 'user',
        percentage: this.calculateGrowthPercentage(data.totals.users, 100), // Mock previous value
        color: 'text-primary',
        number: data.totals.users.toString()
      },
      {
        title: 'Total Vendors',
        amount: data.totals.vendors.toLocaleString(),
        background: 'bg-light-success',
        border: 'border-success',
        icon: 'shop',
        percentage: this.calculateGrowthPercentage(data.totals.vendors, 50), // Mock previous value
        color: 'text-success',
        number: data.totals.vendors.toString()
      },
      {
        title: 'Total Orders',
        amount: data.totals.orders.toLocaleString(),
        background: 'bg-light-warning',
        border: 'border-warning',
        icon: 'shopping-cart',
        percentage: this.calculateGrowthPercentage(data.totals.orders, 200), // Mock previous value
        color: 'text-warning',
        number: data.totals.orders.toString()
      },
      {
        title: 'Total Revenue',
        amount: `$${data.globalSales.total.revenue.toLocaleString()}`,
        background: 'bg-light-info',
        border: 'border-info',
        icon: 'dollar',
        percentage: this.calculateGrowthPercentage(data.globalSales.total.revenue, 10000), // Mock previous value
        color: 'text-info',
        number: `$${data.globalSales.total.revenue.toLocaleString()}`
      }
    ];
  }

  private prepareRecentOrders(data: AdminDashboard): void {
    this.recentOrders = data.recentOrders.slice(0, 5).map((order) => ({
      background: this.getOrderStatusColor(order.status),
      icon: 'gift',
      title: `Order #${order.orderNumber}`,
      time: this.formatDate(order.createdAt),
      amount: `$${order.finalAmount.toFixed(2)}`,
      percentage: order.status,
      vendor: order.vendor.businessName,
      customer: order.user.name
    }));
  }

  private calculateGrowthPercentage(current: number, previous: number): string {
    if (previous === 0) return '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  }

  private getOrderStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'text-success bg-light-success';
      case 'pending':
        return 'text-warning bg-light-warning';
      case 'cancelled':
        return 'text-danger bg-light-danger';
      default:
        return 'text-primary bg-light-primary';
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }
}
