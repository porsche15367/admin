import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Services
import { VendorService, Vendor } from '../../core/services/vendor.service';
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
  MoreOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-vendor-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './vendor-management.component.html',
  styleUrls: ['./vendor-management.component.scss']
})
export class VendorManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  vendors: Vendor[] = [];
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
  categoryFilter = 'all';

  // Vendor categories
  vendorCategories: any[] = [];

  // Selected vendor for details
  selectedVendor: Vendor | null = null;
  showVendorDetails = false;

  constructor(
    private iconService: IconService,
    private vendorService: VendorService,
    private authService: AuthService
  ) {
    this.iconService.addIcon(...[SearchOutline, FilterOutline, EyeOutline, CheckCircleOutline, CloseCircleOutline, MoreOutline]);
  }

  ngOnInit(): void {
    this.loadVendorCategories();
    this.loadVendors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVendorCategories(): void {
    this.vendorService
      .getVendorCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.vendorCategories = categories;
        },
        error: (error) => {
          console.error('Error loading vendor categories:', error);
        }
      });
  }

  loadVendors(): void {
    this.loading = true;
    this.error = null;

    this.vendorService
      .getAllVendors(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.vendors = response.vendors || [];
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.totalPages || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading vendors:', error);
          this.error = 'Failed to load vendors';
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadVendors();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadVendors();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadVendors();
  }

  viewVendorDetails(vendor: Vendor): void {
    this.selectedVendor = vendor;
    this.showVendorDetails = true;
  }

  closeVendorDetails(): void {
    this.selectedVendor = null;
    this.showVendorDetails = false;
  }

  approveVendor(vendor: Vendor): void {
    if (confirm(`Are you sure you want to approve ${vendor.businessName}?`)) {
      this.vendorService
        .approveVendor(vendor.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            vendor.isApproved = true;
            this.loadVendors(); // Refresh the list
          },
          error: (error) => {
            console.error('Error approving vendor:', error);
            alert('Failed to approve vendor');
          }
        });
    }
  }

  updateVendorStatus(vendor: Vendor, isApproved: boolean): void {
    const action = isApproved ? 'approve' : 'disapprove';
    if (confirm(`Are you sure you want to ${action} ${vendor.businessName}?`)) {
      this.vendorService
        .updateVendorStatus(vendor.id, isApproved)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            vendor.isApproved = isApproved;
            this.loadVendors(); // Refresh the list
          },
          error: (error) => {
            console.error(`Error ${action}ing vendor:`, error);
            alert(`Failed to ${action} vendor`);
          }
        });
    }
  }

  getStatusBadgeClass(isApproved: boolean): string {
    return isApproved ? 'bg-light-success text-success' : 'bg-light-warning text-warning';
  }

  getStatusText(isApproved: boolean): string {
    return isApproved ? 'Approved' : 'Pending';
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

  getFilteredVendors(): Vendor[] {
    let filtered = this.vendors;

    if (this.searchTerm) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.businessName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          vendor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          vendor.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter !== 'all') {
      const isApproved = this.statusFilter === 'approved';
      filtered = filtered.filter((vendor) => vendor.isApproved === isApproved);
    }

    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter((vendor) => vendor.vendorCategory.id === this.categoryFilter);
    }

    return filtered;
  }
}
