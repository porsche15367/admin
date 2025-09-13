// project import
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-login',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent implements OnInit {
  // Login form
  loginForm = {
    email: '',
    password: '',
    type: 'admin' as const
  };

  loading = false;
  error: string | null = null;

  // public method
  SignInOptions = [
    {
      image: 'assets/images/authentication/google.svg',
      name: 'Google'
    },
    {
      image: 'assets/images/authentication/twitter.svg',
      name: 'Twitter'
    },
    {
      image: 'assets/images/authentication/facebook.svg',
      name: 'Facebook'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin-dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm as LoginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/admin-dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error || 'Login failed. Please check your credentials.';
      }
    });
  }
}
