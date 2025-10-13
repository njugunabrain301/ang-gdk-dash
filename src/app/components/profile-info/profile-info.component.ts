import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProfileInfoService } from '../../services/profile-info.service';
import { Profile } from '../../interfaces/profileInfo.Interface';
import { finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-info.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProfileInfoComponent implements OnInit {
  isEditing = false;
  isLoading = false;
  profile: Profile = this.getEmptyProfile();
  originalProfile: Profile = this.getEmptyProfile();
  mpesaTill: any = {};
  mpesaPaybill: any = {};
  accountProfile: any = null;
  isInitializing = true;
  iconUrl: string | undefined;

  constructor(
    private profileService: ProfileInfoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeProfile();
  }

  private initializeProfile() {
    // Load full profile
    this.profileService.getFullProfile().subscribe({
      next: (fullProfileResponse) => {
        if (fullProfileResponse.success) {
          this.profile = fullProfileResponse.data.profile;
          this.originalProfile = { ...fullProfileResponse.data.profile };
          this.mpesaTill = fullProfileResponse.data.MPesaTill || {};
          this.mpesaPaybill = fullProfileResponse.data.MPesaPaybill || {};
        }
      },
      error: (error) => {
        console.error('Error loading full profile:', error);
        this.showSnackBar('Error loading profile information', 'error');
      },
    });

    // Load account profile
    this.profileService.getAccountProfile().subscribe({
      next: (accountProfileResponse) => {
        if (accountProfileResponse.success) {
          this.accountProfile = accountProfileResponse.data;
        }
      },
      error: (error) => {
        console.error('Error loading account profile:', error);
        this.showSnackBar('Error loading account information', 'error');
      },
      complete: () => {
        this.isInitializing = false;
        this.cdr.detectChanges();
      },
    });
  }

  private getEmptyProfile(): Profile {
    return {
      icon: '',
      name: '',
      phone: '',
      email: '',
      location: '',
      about: '',
      aboutDetailed: '',
      showPrice: false,
      responseTime: { unit: 'days', amount: 1 },
      workingHours: '',
      type: '',
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profile.icon = file;
    }
  }

  toggleEditing() {
    if (this.isEditing) {
      this.updateProfile();
    } else {
      this.isEditing = true;
    }
  }

  cancelEditing() {
    this.isEditing = false;
    this.profile = { ...this.originalProfile };
  }

  updateProfile() {
    if (!this.validateProfile()) {
      return;
    }

    this.isLoading = true;
    const formData = this.createFormData();

    this.profileService
      .updateProfile(formData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.originalProfile = { ...response.data };
            this.profile = { ...response.data };
            this.isEditing = false;
            this.showSnackBar('Profile updated successfully', 'success');
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.showSnackBar('Error updating profile', 'error');
        },
      });
  }

  private validateProfile(): boolean {
    if (!this.profile.icon) {
      this.showSnackBar('Please provide an image', 'error');
      return false;
    }

    if (
      !this.profile.name ||
      !this.profile.phone ||
      !this.profile.email ||
      !this.profile.location ||
      !this.profile.about
    ) {
      this.showSnackBar('Fill in all required fields', 'error');
      return false;
    }

    if (!/(^\d{10}$)|(^\+\d{12}$)/.test(this.profile.phone)) {
      this.showSnackBar(
        'Invalid Phone Number. Use 0712345678 or +254712345678',
        'error'
      );
      return false;
    }

    if (
      !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(
        this.profile.email
      )
    ) {
      this.showSnackBar('Invalid Email', 'error');
      return false;
    }

    return true;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    Object.entries(this.profile).forEach(([key, value]) => {
      if (key === 'responseTime') {
        formData.append('responseTimeUnit', value.unit);
        formData.append('responseTimeAmount', value.amount.toString());
      } else {
        formData.append(key, value);
      }
    });
    return formData;
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['bg-green-500'] : ['bg-red-500'],
    });
  }

  isFieldModified(fieldName: keyof Profile): boolean {
    return this.profile[fieldName] !== this.originalProfile[fieldName];
  }
}
