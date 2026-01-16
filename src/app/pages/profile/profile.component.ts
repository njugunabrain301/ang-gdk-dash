import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from '../../components/profile-info/profile-info.component';
import { PoliciesComponent } from '../../components/policies/policies.component';
import { DeliveriesComponent } from '../../components/shipping/shipping.component';
import { PaymentComponent } from '../../components/payments/payments.component';
import { AdvancedComponent } from '../../components/advanced/advanced.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ProfileInfoComponent,
    PoliciesComponent,
    DeliveriesComponent,
    PaymentComponent,
    AdvancedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  activeTab = 'profile';
  isBusinessPackage: boolean = false;

  ngOnInit() {
    this.checkBusinessPackage();
    // If activeTab is 'advanced' but user doesn't have business package, reset to 'profile'
    if (this.activeTab === 'advanced' && !this.isBusinessPackage) {
      this.activeTab = 'profile';
    }
  }

  setActiveTab(tab: string) {
    // Prevent switching to 'advanced' tab if user doesn't have business package
    if (tab === 'advanced' && !this.isBusinessPackage) {
      return;
    }
    this.activeTab = tab;
  }

  checkBusinessPackage() {
    const profileData = localStorage.getItem('profile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      this.isBusinessPackage = profile.accountType === 'business';
    } else {
      this.isBusinessPackage = false;
    }
  }
}
