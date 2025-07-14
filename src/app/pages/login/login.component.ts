import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      url: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.loginError = '';

      const { url, password, rememberMe } = this.loginForm.value;

      this.loginService.login(url, password).subscribe({
        next: (res: any) => {
          
          if (res.success) {
            // Store data first
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('profile', JSON.stringify(res.data));

            if (rememberMe) {
              localStorage.setItem('rememberedUrl', url);
            } else {
              localStorage.removeItem('rememberedUrl');
            }

            // Navigate after data is stored
            this.router
              .navigate(['/dashboard'])
              .then(() => {
                this.isLoading = false;
              })
              .catch((err) => {
                console.error('Navigation failed:', err);
                this.isLoading = false;
              });
          } else {
            this.loginError = 'Invalid credentials';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.loginError = 'Invalid credentials';
          this.isLoading = false;
          console.error('Login error', err);
        },
      });
    }
  }
}
