// angular import
import { Component, inject, input, output, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// project import
import { AuthService, AdminUser } from '../../../../../core/services/auth.service';

// icon
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [CommonModule, IconDirective, RouterModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy {
  private iconService = inject(IconService);
  private destroy$ = new Subject<void>();

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;

  // Authentication properties
  currentUser: AdminUser | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );
  }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });

    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile',
      action: 'editProfile'
    },
    {
      icon: 'user',
      title: 'View Profile',
      action: 'viewProfile'
    },
    {
      icon: 'setting',
      title: 'Account Settings',
      action: 'settings'
    },
    {
      icon: 'logout',
      title: 'Logout',
      action: 'logout'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];

  // Profile action handlers
  onProfileAction(action: string): void {
    switch (action) {
      case 'editProfile':
        this.editProfile();
        break;
      case 'viewProfile':
        this.viewProfile();
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'logout':
        this.logout();
        break;
    }
  }

  editProfile(): void {
    // TODO: Implement edit profile functionality
    console.log('Edit profile clicked');
  }

  viewProfile(): void {
    // TODO: Implement view profile functionality
    console.log('View profile clicked');
  }

  openSettings(): void {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.currentUser?.name) return 'A';
    return this.currentUser.name
      .split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Get user display name
  getUserDisplayName(): string {
    return this.currentUser?.name || 'Admin';
  }

  // Get user role
  getUserRole(): string {
    return this.currentUser?.role || 'Administrator';
  }
}
