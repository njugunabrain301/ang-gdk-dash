import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, interval, takeUntil } from 'rxjs';
import { BillingService } from '../../../../services/billing.service';

export interface PackagePaymentData {
  amount: number;
  invNum: string;
  invID: string;
  invPurpose: string;
  phone: string;
  isBusinessPackage: boolean;
}

@Component({
  selector: 'app-package-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ manualPayment ? 'Payment Procedure' : 'Lipa na MPesa' }}
    </h2>
    <div mat-dialog-content>
      <div *ngIf="manualPayment">
        <p>1. Go to MPesa Menu</p>
        <p>2. Select Lipa na MPesa</p>
        <p>3. Select Pay Bill</p>
        <p>4. Enter business number - 4123793</p>
        <p>5. Enter account number - {{ data.invNum }}</p>
        <p>6. Enter amount Ksh. {{ data.amount }}</p>
        <p>7. Enter MPesa Pin</p>
        <p>Business Name: Bunika Solutions</p>

        <mat-form-field class="full-width">
          <mat-label>MPesa Code</mat-label>
          <input matInput [(ngModel)]="code" />
        </mat-form-field>

        <button
          mat-raised-button
          color="primary"
          [disabled]="loading"
          (click)="submitPayment()"
        >
          {{ loading ? 'Submitting...' : 'Submit' }}
        </button>

        <button mat-button *ngIf="!sentStk" (click)="manualPayment = false">
          Try STK Push
        </button>
      </div>

      <div *ngIf="!manualPayment">
        <p>You will receive a prompt on your phone to complete the payment</p>
        <p><b>Purpose:</b> {{ data.invPurpose }}</p>
        <p>Business Name: Bunika Solutions</p>
        <p>Account Number: {{ data.invNum }}</p>
        <p>Amount: Ksh. {{ data.amount }}</p>

        <mat-form-field class="full-width">
          <mat-label>Phone Number</mat-label>
          <input matInput [(ngModel)]="paymentPhone" />
        </mat-form-field>

        <div *ngIf="sentStk">
          <p>{{ paymentStatus }}</p>
        </div>
        <div *ngIf="!sentStk">
          <button
            mat-raised-button
            color="primary"
            [disabled]="loading"
            (click)="initPayment()"
          >
            {{ loading ? 'Processing...' : 'Proceed' }}
          </button>
        </div>
      </div>

      <div class="error-message" *ngIf="error">{{ error }}</div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </div>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
        margin: 16px 0;
      }
      .error-message {
        color: #f44336;
        margin-top: 16px;
      }
      button {
        margin: 8px;
      }
    `,
  ],
})
export class PackagePaymentDialogComponent implements OnDestroy {
  code = '';
  paymentPhone: string;
  error = '';
  loading = false;
  sentStk = false;
  manualPayment = false;
  paymentStatus = 'Waiting';
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<PackagePaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PackagePaymentData,
    private billingService: BillingService
  ) {
    this.paymentPhone = data.phone;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.dialogRef.close();
  }

  submitPayment(): void {
    if (!this.code) {
      this.error = 'Please provide the payment code';
      return;
    }

    this.loading = true;
    this.error = '';

    this.billingService
      .payInvoice({
        amount: this.data.amount,
        id: this.data.invID,
        code: this.code,
        purpose: this.data.isBusinessPackage
          ? 'ACTIVATE - Business'
          : 'Purchase - Starter',
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dialogRef.close(response.data);
          } else {
            this.error = response.message || 'Payment failed';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Error occurred. Please try again';
          this.loading = false;
        },
      });
  }

  initPayment(): void {
    this.loading = true;
    this.error = '';

    this.billingService
      .initiatePayment({
        phone: this.paymentPhone,
        amount: this.data.amount,
        invoiceNum: this.data.invNum,
        description: this.data.invID,
        iid: this.data.invID,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.sentStk = true;
            this.startPaymentCheck(response.data);
          } else {
            this.manualPayment = true;
            this.error =
              'Unable to initiate payment. Please use manual payment';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Error initiating payment';
          this.loading = false;
        },
      });
  }

  private startPaymentCheck(stkData: any): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const dots = (this.paymentStatus.match(/\./g) || []).length;
        this.paymentStatus = 'Waiting for payment' + '.'.repeat((dots + 1) % 4);
      });

    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.billingService.queryPayment(stkData).subscribe({
          next: (response) => {
            if (response.success && response.data.paid) {
              this.paymentStatus = 'Payment received successfully!';
              setTimeout(() => this.dialogRef.close(true), 2000);
              this.destroy$.next();
              this.destroy$.complete();
            } else if (response.success && !response.data.paid) {
              this.paymentStatus = 'Payment failed!';
              this.manualPayment = true;
              this.destroy$.next();
              this.destroy$.complete();
            }
          },
        });
      });
  }
}
