import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  activeTab = 'profile';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
