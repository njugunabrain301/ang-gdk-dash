import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password.service';
import { EncryptionService } from '../../services/encryption.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  cpassword = '';
  error = '';
  done = false;
  resetting = false;
  token = '';

  constructor(
    private resetPasswordService: ResetPasswordService,
    private route: ActivatedRoute,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
  }

  async handleReset() {
    if (this.resetting) {
      return;
    }

    this.error = '';

    if (this.password.length < 6) {
      this.error = 'Password needs to be a minimum of 6 characters';
      return;
    }

    if (this.password !== this.cpassword) {
      this.error = 'Passwords do not match!';
      return;
    }

    this.resetting = true;

    this.resetPasswordService
      .resetPassword({
        password: this.encryptionService.encryptString(this.password),
        token: this.token,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.done = true;
          }
          this.resetting = false;
        },
        error: (error) => {
          this.error =
            error.message ||
            'An error occurred. Please try again after some time';
          this.resetting = false;
        },
      });
  }
}
