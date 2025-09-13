import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Services
import { VendorApprovalService, UnapprovedVendor, UnapprovedVendorsResponse } from '../../core/services/vendor-approval.service';

// Components
import { CardComponent } from '../../theme/shared/components/card/card.component';

// Icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  SearchOutline,
  ReloadOutline,
  EyeOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  ShopOutline,
  ExclamationCircleOutline,
  UserOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, IconDirective],
  templateUrl: './vendor-approval.component.html',
  styleUrls: ['./vendor-approval.component.scss']
})
export class VendorApprovalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  vendors: UnapprovedVendor[] = [];
  selectedVendor: UnapprovedVendor | null = null;
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

  // UI state
  showVendorDetails = false;
  processingApproval = false;

  // Math for template
  Math = Math;

  constructor(
    private iconService: IconService,
    private vendorApprovalService: VendorApprovalService
  ) {
    this.iconService.addIcon(
      SearchOutline,
      ReloadOutline,
      EyeOutline,
      CheckCircleOutline,
      CloseCircleOutline,
      ShopOutline,
      ExclamationCircleOutline,
      UserOutline
    );
  }

  ngOnInit(): void {
    this.loadUnapprovedVendors();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load unapproved vendors
   */
  loadUnapprovedVendors(): void {
    this.loading = true;
    this.error = null;

    this.vendorApprovalService
      .getUnapprovedVendors(this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UnapprovedVendorsResponse) => {
          this.vendors = response.vendors;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load unapproved vendors';
          this.loading = false;
          console.error('Error loading unapproved vendors:', error);
        }
      });
  }

  /**
   * Search vendors
   */
  onSearch(): void {
    this.currentPage = 1;
    this.loadUnapprovedVendors();
  }

  /**
   * Filter change handler
   */
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUnapprovedVendors();
  }

  /**
   * Page change handler
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUnapprovedVendors();
    }
  }

  /**
   * View vendor details
   */
  viewVendorDetails(vendor: UnapprovedVendor): void {
    this.selectedVendor = vendor;
    this.showVendorDetails = true;
  }

  /**
   * Close vendor details modal
   */
  closeVendorDetails(): void {
    this.showVendorDetails = false;
    this.selectedVendor = null;
  }

  /**
   * Approve vendor
   */
  approveVendor(vendor: UnapprovedVendor): void {
    if (confirm(`Are you sure you want to approve ${vendor.businessName}?`)) {
      this.processingApproval = true;

      this.vendorApprovalService
        .approveVendor(vendor.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.processingApproval = false;
            alert('Vendor approved successfully!');
            this.loadUnapprovedVendors(); // Refresh the list
            this.closeVendorDetails();
          },
          error: (error) => {
            this.processingApproval = false;
            alert('Failed to approve vendor');
            console.error('Error approving vendor:', error);
          }
        });
    }
  }

  /**
   * Reject vendor
   */
  rejectVendor(vendor: UnapprovedVendor): void {
    if (confirm(`Are you sure you want to reject ${vendor.businessName}?`)) {
      this.processingApproval = true;

      this.vendorApprovalService
        .rejectVendor(vendor.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.processingApproval = false;
            alert('Vendor rejected successfully!');
            this.loadUnapprovedVendors(); // Refresh the list
            this.closeVendorDetails();
          },
          error: (error) => {
            this.processingApproval = false;
            alert('Failed to reject vendor');
            console.error('Error rejecting vendor:', error);
          }
        });
    }
  }

  /**
   * Get filtered vendors based on search term
   */
  getFilteredVendors(): UnapprovedVendor[] {
    if (!this.searchTerm.trim()) {
      return this.vendors;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return this.vendors.filter(
      (vendor) =>
        vendor.businessName.toLowerCase().includes(searchLower) ||
        vendor.name.toLowerCase().includes(searchLower) ||
        vendor.email.toLowerCase().includes(searchLower) ||
        vendor.vendorCategory.name.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get pagination array for display
   */
  getPaginationArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(isApproved: boolean): string {
    return isApproved ? 'bg-success' : 'bg-warning';
  }

  /**
   * Get verification badge class
   */
  getVerificationBadgeClass(isVerified: boolean): string {
    return isVerified ? 'bg-success' : 'bg-secondary';
  }
}
