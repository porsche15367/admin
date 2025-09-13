import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CardComponent } from '../../theme/shared/components/card/card.component';
import { UserManagementService, User, UserDetails, GetUsersQuery } from '../../core/services/user-management.service';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  EyeOutline,
  PauseOutline,
  StopOutline,
  CaretRightOutline,
  CheckOutline,
  SearchOutline,
  ReloadOutline,
  CloseOutline,
  ExclamationCircleOutline,
  WarningOutline,
  LoadingOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, IconDirective],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  selectedUser: UserDetails | null = null;
  loading = false;
  error: string | null = null;
  Math = Math;
  pagination = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  };

  // Search and filters
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  itemsPerPage = 10;

  // Modals
  userDetailsModal: NgbModalRef | null = null;
  suspendModal: NgbModalRef | null = null;
  blockModal: NgbModalRef | null = null;

  // Action forms
  suspendForm = {
    duration: '7',
    reason: ''
  };

  blockForm = {
    reason: ''
  };

  unblockForm = {
    reason: ''
  };

  constructor(
    private userManagementService: UserManagementService,
    private modalService: NgbModal,
    private iconService: IconService
  ) {
    // Register Ant Design icons
    this.iconService.addIcon(
      EyeOutline,
      PauseOutline,
      StopOutline,
      CaretRightOutline,
      CheckOutline,
      SearchOutline,
      ReloadOutline,
      CloseOutline,
      ExclamationCircleOutline,
      WarningOutline,
      LoadingOutline
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    const query: GetUsersQuery = {
      page: this.currentPage.toString(),
      limit: this.itemsPerPage.toString()
    };

    if (this.searchTerm.trim()) {
      query.search = this.searchTerm.trim();
    }

    if (this.statusFilter) {
      if (this.statusFilter === 'blocked') {
        query.isBlocked = 'true';
      } else if (this.statusFilter === 'suspended') {
        query.isSuspended = 'true';
      }
    }

    this.userManagementService.getAllUsers(query).subscribe({
      next: (response) => {
        this.users = response.users;
        this.pagination = response.pagination;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  viewUserDetails(user: User, modal: any): void {
    this.loading = true;
    this.userManagementService.getUserById(user.id).subscribe({
      next: (userDetails) => {
        this.selectedUser = userDetails;
        this.userDetailsModal = this.modalService.open(modal, { size: 'lg' });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        console.error('Error loading user details:', error);
      }
    });
  }

  openSuspendModal(user: User, modal: any): void {
    this.selectedUser = user as UserDetails;
    this.suspendForm = { duration: '7', reason: '' };
    this.suspendModal = this.modalService.open(modal);
  }

  openBlockModal(user: User, modal: any): void {
    this.selectedUser = user as UserDetails;
    this.blockForm = { reason: '' };
    this.blockModal = this.modalService.open(modal);
  }

  suspendUser(): void {
    if (!this.selectedUser || !this.suspendForm.reason.trim()) {
      return;
    }

    this.loading = true;
    this.userManagementService.suspendUser(this.selectedUser.id, this.suspendForm).subscribe({
      next: () => {
        this.suspendModal?.close();
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to suspend user';
        this.loading = false;
        console.error('Error suspending user:', error);
      }
    });
  }

  unsuspendUser(user: User): void {
    this.loading = true;
    this.userManagementService.unsuspendUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to unsuspend user';
        this.loading = false;
        console.error('Error unsuspending user:', error);
      }
    });
  }

  blockUser(): void {
    if (!this.selectedUser || !this.blockForm.reason.trim()) {
      return;
    }

    this.loading = true;
    this.userManagementService.blockUser(this.selectedUser.id, this.blockForm).subscribe({
      next: () => {
        this.blockModal?.close();
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to block user';
        this.loading = false;
        console.error('Error blocking user:', error);
      }
    });
  }

  unblockUser(user: User): void {
    this.loading = true;
    this.userManagementService.unblockUser(user.id, this.unblockForm).subscribe({
      next: () => {
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to unblock user';
        this.loading = false;
        console.error('Error unblocking user:', error);
      }
    });
  }

  checkSuspensionStatus(): void {
    this.loading = true;
    this.userManagementService.checkSuspensionStatus().subscribe({
      next: (response) => {
        console.log(response.message);
        this.loadUsers();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to check suspension status';
        this.loading = false;
        console.error('Error checking suspension status:', error);
      }
    });
  }

  getUserStatusClass(user: User): string {
    return this.userManagementService.getUserStatusClass(user);
  }

  getUserStatusText(user: User): string {
    return this.userManagementService.getUserStatusText(user);
  }

  formatDate(dateString: string): string {
    return this.userManagementService.formatDate(dateString);
  }

  isSuspensionExpired(user: User): boolean {
    return this.userManagementService.isSuspensionExpired(user);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.pagination.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
