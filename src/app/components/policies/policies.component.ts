import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { PoliciesService } from '../../services/policies.service';
import {
  PolicyReturns,
  PolicyShipping,
} from '../../interfaces/policy.interface';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  providers: [MatSnackBarConfig],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.css'], // Optional: Add styles if needed
})
export class PoliciesComponent implements OnInit {
  // Current state
  returns: PolicyReturns = {
    accept: false,
    refundPurchaseShipping: false,
    refundReturnShipping: false,
    replace: false,
    cashRefund: false,
    raiseTimeline: { unit: 'days', amount: 0 },
    refundTimeline: { unit: 'days', amount: 0 },
    eligibility: [],
  };
  shipping: PolicyShipping = {
    accept: false,
    cutoffTime: '',
    earliestShipTime: '',
    guaranteeCourier: false,
    handlingType: 'constant',
    handlingTime: { unit: 'days', amount: 0 },
  };

  // Original state
  private originalReturns: PolicyReturns | null = null;
  private originalShipping: PolicyShipping | null = null;

  updating = false;
  loading = false;

  constructor(
    private policiesService: PoliciesService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initPolicies();
  }

  initPolicies() {
    this.policiesService.fetchPolicies().subscribe({
      next: (res) => {
        if (res.success) {
          // Set current state
          this.returns = res.data.returnsPolicy;
          this.shipping = res.data.shippingPolicy;

          // Store original state
          this.originalReturns = JSON.parse(
            JSON.stringify(res.data.returnsPolicy)
          );
          this.originalShipping = JSON.parse(
            JSON.stringify(res.data.shippingPolicy)
          );

          this.checkForChanges();

          // Trigger change detection
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error fetching policies:', error);
        this.showSnackbar('Error fetching policies', 'error');
      },
    });
  }

  updateItem() {
    if (!this.updating) {
      this.updating = true;
      return;
    }

    this.loading = true;
    this.policiesService
      .updatePolicies({ returns: this.returns, shipping: this.shipping })
      .subscribe({
        next: (res) => {
          if (res.success) {
            // Update both current and original states
            this.returns = res.data.returnsPolicy;
            this.shipping = res.data.shippingPolicy;
            this.originalReturns = JSON.parse(
              JSON.stringify(res.data.returnsPolicy)
            );
            this.originalShipping = JSON.parse(
              JSON.stringify(res.data.shippingPolicy)
            );

            this.showSnackbar('Policies updated successfully', 'success');
            this.updating = false;
          }
          this.loading = false;
          this.checkForChanges();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating policies:', error);
          this.showSnackbar('Error updating policies', 'error');
          this.loading = false;
        },
      });
  }

  cancelUpdating() {
    if (this.originalReturns && this.originalShipping) {
      this.returns = JSON.parse(JSON.stringify(this.originalReturns));
      this.shipping = JSON.parse(JSON.stringify(this.originalShipping));
    }
    this.updating = false;
    this.checkForChanges();
  }

  checkForChanges(): boolean {
    if (!this.originalReturns || !this.originalShipping) {
      return false;
    }

    const returnsChanged = !this.areObjectsEqual(
      this.returns,
      this.originalReturns
    );
    const shippingChanged = !this.areObjectsEqual(
      this.shipping,
      this.originalShipping
    );

    return returnsChanged || shippingChanged;
  }

  private areObjectsEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  onReturnsChange() {
    this.checkForChanges();
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'bg-green-500' : 'bg-red-500',
    });
  }

  // Getter for template to check if save button should be enabled
  get canSave(): boolean {
    return this.checkForChanges();
  }

  // Getter for template to check if cancel button should be enabled
  get canCancel(): boolean {
    return this.checkForChanges();
  }

  // Helper method to check if option exists in eligibility array
  isEligibilitySelected(option: string): boolean {
    return this.returns.eligibility.includes(option);
  }

  // Helper method to toggle eligibility option
  toggleEligibility(option: string): void {
    const index = this.returns.eligibility.indexOf(option);
    if (index === -1) {
      this.returns.eligibility.push(option);
    } else {
      this.returns.eligibility.splice(index, 1);
    }
    this.checkForChanges();
  }
}
