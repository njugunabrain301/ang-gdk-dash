import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-advanced',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  providers: [MatSnackBarConfig],
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.css',
})
export class AdvancedComponent implements OnInit {
  // Form fields
  facebookPageId: string = '';
  instagramAccountId: string = '';
  facebookAccessToken: string = '';
  metaUserAccessToken: string = '';
  facebookAdAccountId: string = '';
  facebookPixelId: string = '';

  // Original state for comparison
  private originalCredentials: {
    facebookPageId: string;
    instagramAccountId: string;
    facebookAccessToken: string;
    metaUserAccessToken: string;
    facebookAdAccountId: string;
    facebookPixelId: string;
  } | null = null;

  isLoading = false;
  isInitializing = true;

  constructor(
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {  }

  ngOnInit() {
    this.loadCredentials();
  }

  loadCredentials() {
    this.isInitializing = true;
    this.scheduleService.getSchedule().subscribe({
      next: (res) => {
        if (res.success) {
          // Populate form fields with values from response
          this.facebookPageId = res.data.facebookPageId || '';
          this.instagramAccountId = res.data.instagramAccountId || '';
          this.facebookAccessToken = res.data.facebookAccessToken || '';
          this.metaUserAccessToken = res.data.metaUserAccessToken || '';
          this.facebookAdAccountId = res.data.facebookAdAccountId || '';
          this.facebookPixelId = res.data.facebookPixelId || '';

          // Store original state
          this.originalCredentials = {
            facebookPageId: this.facebookPageId,
            instagramAccountId: this.instagramAccountId,
            facebookAccessToken: this.facebookAccessToken,
            metaUserAccessToken: this.metaUserAccessToken,
            facebookAdAccountId: this.facebookAdAccountId,
            facebookPixelId: this.facebookPixelId,
          };

          this.isInitializing = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading credentials:', error);
        this.showSnackbar('Error loading credentials', 'error');
        this.isInitializing = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateCredentials() {
    this.isLoading = true;

    const updateData: any = {};

    // Include credentials if they've been provided (not empty)
    // This allows updating credentials or preserving existing ones
    if (this.facebookPageId) {
      updateData.facebookPageId = this.facebookPageId;
    }
    if (this.instagramAccountId) {
      updateData.instagramAccountId = this.instagramAccountId;
    }
    if (this.facebookAccessToken) {
      updateData.facebookAccessToken = this.facebookAccessToken;
    }
    if (this.metaUserAccessToken) {
      updateData.metaUserAccessToken = this.metaUserAccessToken;
    }
    if (this.facebookAdAccountId) {
      updateData.facebookAdAccountId = this.facebookAdAccountId;
    }
    if (this.facebookPixelId) {
      updateData.facebookPixelId = this.facebookPixelId;
    }

    this.scheduleService.updateSchedule(updateData).subscribe({
      next: (res) => {
        if (res.success) {
          // Populate credential fields from response (preserves existing values)
          this.facebookPageId = res.data.facebookPageId || '';
          this.instagramAccountId = res.data.instagramAccountId || '';
          this.facebookAccessToken = res.data.facebookAccessToken || '';
          this.metaUserAccessToken = res.data.metaUserAccessToken || '';
          this.facebookAdAccountId = res.data.facebookAdAccountId || '';
          this.facebookPixelId = res.data.facebookPixelId || '';

          // Update original credentials to match saved values
          this.originalCredentials = {
            facebookPageId: this.facebookPageId,
            instagramAccountId: this.instagramAccountId,
            facebookAccessToken: this.facebookAccessToken,
            metaUserAccessToken: this.metaUserAccessToken,
            facebookAdAccountId: this.facebookAdAccountId,
            facebookPixelId: this.facebookPixelId,
          };

          this.showSnackbar('Credentials updated successfully', 'success');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating credentials:', error);
        this.showSnackbar(
          error.error?.message || 'Error updating credentials',
          'error'
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelCredentialChanges() {
    // Restore original credential values
    if (this.originalCredentials) {
      this.facebookPageId = this.originalCredentials.facebookPageId;
      this.instagramAccountId = this.originalCredentials.instagramAccountId;
      this.facebookAccessToken = this.originalCredentials.facebookAccessToken;
      this.metaUserAccessToken = this.originalCredentials.metaUserAccessToken;
      this.facebookAdAccountId = this.originalCredentials.facebookAdAccountId;
      this.facebookPixelId = this.originalCredentials.facebookPixelId;
    } else {
      this.facebookPageId = '';
      this.instagramAccountId = '';
      this.facebookAccessToken = '';
      this.metaUserAccessToken = '';
      this.facebookAdAccountId = '';
      this.facebookPixelId = '';
    }
  }

  hasCredentialChanges(): boolean {
    if (!this.originalCredentials) {
      return !!(
        this.facebookPageId ||
        this.instagramAccountId ||
        this.facebookAccessToken ||
        this.metaUserAccessToken ||
        this.facebookAdAccountId ||
        this.facebookPixelId
      );
    }

    return (
      this.facebookPageId !== this.originalCredentials.facebookPageId ||
      this.instagramAccountId !== this.originalCredentials.instagramAccountId ||
      this.facebookAccessToken !== this.originalCredentials.facebookAccessToken ||
      this.metaUserAccessToken !== this.originalCredentials.metaUserAccessToken ||
      this.facebookAdAccountId !== this.originalCredentials.facebookAdAccountId ||
      this.facebookPixelId !== this.originalCredentials.facebookPixelId
    );
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }

}
