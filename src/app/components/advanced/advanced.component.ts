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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService, ScheduleData } from '../../services/schedule.service';

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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  providers: [MatSnackBarConfig],
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.css',
})
export class AdvancedComponent implements OnInit {
  schedule: ScheduleData = {
    timezone: 'Africa/Nairobi',
    facebookPostTimes: [],
    facebookPostsMadeToday: 0,
    facebookNextRunAt: null,
    instagramPostTimes: [],
    instagramPostsMadeToday: 0,
    instagramNextRunAt: null,
    lastRunAt: null,
    status: 'paused',
  };

  // Form fields for time inputs (ensures we always have 2 inputs)
  facebookPostTime1: string = '';
  facebookPostTime2: string = '';
  instagramPostTime1: string = '';
  instagramPostTime2: string = '';

  // Form fields
  facebookPageId: string = '';
  instagramAccountId: string = '';
  facebookAccessToken: string = '';

  // Original state for comparison
  private originalSchedule: ScheduleData | null = null;
  private originalCredentials: {
    facebookPageId: string;
    instagramAccountId: string;
    facebookAccessToken: string;
  } | null = null;

  isLoading = false;
  isInitializing = true;

  constructor(
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadSchedule();
  }

  loadSchedule() {
    this.isInitializing = true;
    this.scheduleService.getSchedule().subscribe({
      next: (res) => {
        if (res.success) {
          this.schedule = res.data;

          // Ensure arrays exist
          if (!this.schedule.facebookPostTimes) {
            this.schedule.facebookPostTimes = [];
          }
          if (!this.schedule.instagramPostTimes) {
            this.schedule.instagramPostTimes = [];
          }

          // Populate form fields with values from response
          this.facebookPageId = res.data.facebookPageId || '';
          this.instagramAccountId = res.data.instagramAccountId || '';
          this.facebookAccessToken = res.data.facebookAccessToken || '';

          // Populate time input fields from arrays
          this.facebookPostTime1 = this.schedule.facebookPostTimes[0] || '';
          this.facebookPostTime2 = this.schedule.facebookPostTimes[1] || '';
          this.instagramPostTime1 = this.schedule.instagramPostTimes[0] || '';
          this.instagramPostTime2 = this.schedule.instagramPostTimes[1] || '';

          // Store original state
          this.originalSchedule = JSON.parse(JSON.stringify(res.data));
          this.originalCredentials = {
            facebookPageId: this.facebookPageId,
            instagramAccountId: this.instagramAccountId,
            facebookAccessToken: this.facebookAccessToken,
          };

          this.isInitializing = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        this.showSnackbar('Error loading schedule settings', 'error');
        this.isInitializing = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateSchedule() {
    if (!this.validateSchedule()) {
      return;
    }

    this.isLoading = true;

    // Build arrays from time inputs, filtering out empty values
    const facebookPostTimes: string[] = [];
    if (this.facebookPostTime1) facebookPostTimes.push(this.facebookPostTime1);
    if (this.facebookPostTime2) facebookPostTimes.push(this.facebookPostTime2);

    const instagramPostTimes: string[] = [];
    if (this.instagramPostTime1)
      instagramPostTimes.push(this.instagramPostTime1);
    if (this.instagramPostTime2)
      instagramPostTimes.push(this.instagramPostTime2);

    const updateData: any = {
      timezone: this.schedule.timezone,
      facebookPostTimes: facebookPostTimes,
      instagramPostTimes: instagramPostTimes,
      status: this.schedule.status,
    };

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

    this.scheduleService.updateSchedule(updateData).subscribe({
      next: (res) => {
        if (res.success) {
          this.schedule = res.data;

          // Ensure arrays exist
          if (!this.schedule.facebookPostTimes) {
            this.schedule.facebookPostTimes = [];
          }
          if (!this.schedule.instagramPostTimes) {
            this.schedule.instagramPostTimes = [];
          }

          // Populate time input fields from arrays
          this.facebookPostTime1 = this.schedule.facebookPostTimes[0] || '';
          this.facebookPostTime2 = this.schedule.facebookPostTimes[1] || '';
          this.instagramPostTime1 = this.schedule.instagramPostTimes[0] || '';
          this.instagramPostTime2 = this.schedule.instagramPostTimes[1] || '';

          this.originalSchedule = JSON.parse(JSON.stringify(res.data));

          // Populate credential fields from response (preserves existing values)
          this.facebookPageId = res.data.facebookPageId || '';
          this.instagramAccountId = res.data.instagramAccountId || '';
          this.facebookAccessToken = res.data.facebookAccessToken || '';

          // Update original credentials to match saved values
          this.originalCredentials = {
            facebookPageId: this.facebookPageId,
            instagramAccountId: this.instagramAccountId,
            facebookAccessToken: this.facebookAccessToken,
          };

          this.showSnackbar('Schedule updated successfully', 'success');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating schedule:', error);
        this.showSnackbar(
          error.error?.message || 'Error updating schedule',
          'error'
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelChanges() {
    if (this.originalSchedule) {
      this.schedule = JSON.parse(JSON.stringify(this.originalSchedule));

      // Ensure arrays exist
      if (!this.schedule.facebookPostTimes) {
        this.schedule.facebookPostTimes = [];
      }
      if (!this.schedule.instagramPostTimes) {
        this.schedule.instagramPostTimes = [];
      }

      // Restore time input fields
      this.facebookPostTime1 = this.schedule.facebookPostTimes[0] || '';
      this.facebookPostTime2 = this.schedule.facebookPostTimes[1] || '';
      this.instagramPostTime1 = this.schedule.instagramPostTimes[0] || '';
      this.instagramPostTime2 = this.schedule.instagramPostTimes[1] || '';
    }
    // Restore original credential values
    if (this.originalCredentials) {
      this.facebookPageId = this.originalCredentials.facebookPageId;
      this.instagramAccountId = this.originalCredentials.instagramAccountId;
      this.facebookAccessToken = this.originalCredentials.facebookAccessToken;
    } else {
      this.facebookPageId = '';
      this.instagramAccountId = '';
      this.facebookAccessToken = '';
    }
  }

  hasChanges(): boolean {
    // Check if time inputs have changed
    const currentFacebookTimes = [
      this.facebookPostTime1 || null,
      this.facebookPostTime2 || null,
    ].filter((t) => t !== null);
    const originalFacebookTimes =
      this.originalSchedule?.facebookPostTimes || [];
    const facebookTimesChanged =
      JSON.stringify(currentFacebookTimes.sort()) !==
      JSON.stringify(originalFacebookTimes.sort());

    const currentInstagramTimes = [
      this.instagramPostTime1 || null,
      this.instagramPostTime2 || null,
    ].filter((t) => t !== null);
    const originalInstagramTimes =
      this.originalSchedule?.instagramPostTimes || [];
    const instagramTimesChanged =
      JSON.stringify(currentInstagramTimes.sort()) !==
      JSON.stringify(originalInstagramTimes.sort());

    const scheduleChanged =
      (this.originalSchedule &&
        (this.schedule.timezone !== this.originalSchedule.timezone ||
          this.schedule.status !== this.originalSchedule.status)) ||
      facebookTimesChanged ||
      instagramTimesChanged;

    const credentialsChanged = !!(
      this.facebookPageId ||
      this.instagramAccountId ||
      this.facebookAccessToken
    );

    return scheduleChanged || credentialsChanged;
  }

  validateSchedule(): boolean {
    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    // Validate Facebook times
    if (this.facebookPostTime1 && !timeRegex.test(this.facebookPostTime1)) {
      this.showSnackbar(
        'Facebook post time 1 must be in HH:mm format (e.g., 09:00)',
        'error'
      );
      return false;
    }
    if (this.facebookPostTime2 && !timeRegex.test(this.facebookPostTime2)) {
      this.showSnackbar(
        'Facebook post time 2 must be in HH:mm format (e.g., 15:00)',
        'error'
      );
      return false;
    }

    // Validate Instagram times
    if (this.instagramPostTime1 && !timeRegex.test(this.instagramPostTime1)) {
      this.showSnackbar(
        'Instagram post time 1 must be in HH:mm format (e.g., 10:00)',
        'error'
      );
      return false;
    }
    if (this.instagramPostTime2 && !timeRegex.test(this.instagramPostTime2)) {
      this.showSnackbar(
        'Instagram post time 2 must be in HH:mm format (e.g., 16:00)',
        'error'
      );
      return false;
    }

    return true;
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
