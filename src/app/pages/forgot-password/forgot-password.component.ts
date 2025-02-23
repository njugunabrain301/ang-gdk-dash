import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForgotPasswordService } from './forgot-password.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  requestSuccessful = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private service: ForgotPasswordService) {
    this.forgotPasswordForm = this.fb.group({
      url: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const url = this.forgotPasswordForm.get('url')?.value;

      this.service.requestPasswordReset({ url: url }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.requestSuccessful = true;
          this.successMessage =
            'Password reset link has been sent to your email.';
          this.forgotPasswordForm.disable();
        },
        error: (error) => {
          this.isLoading = false;
          this.requestSuccessful = false;
          this.errorMessage =
            error.message || 'An error occurred. Please try again.';
        },
      });
    }
  }

  private simulatePasswordResetRequest(email: string): void {
    // Simulate an API call
    setTimeout(() => {
      if (email === 'error@example.com') {
        this.errorMessage = 'An error occurred. Please try again later.';
        this.successMessage = '';
      } else {
        this.successMessage =
          'Password reset link sent. Please check your email.';
        this.errorMessage = '';
        this.forgotPasswordForm.reset();
      }
    }, 1500);
  }
}
