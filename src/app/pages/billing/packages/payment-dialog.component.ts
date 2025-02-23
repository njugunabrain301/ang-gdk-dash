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
import { Subject } from 'rxjs';
import { BillingService } from '../../../services/billing.service';

export interface PaymentDialogData {
  amount: number;
  invNum: string;
  invID: string;
  invPurpose: string;
  phone: string;
}

@Component({
  selector: 'app-payment-dialog',
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
      {{ manualPayment ? 'Manual Payment' : 'Lipa na MPesa' }}
    </h2>
    <mat-dialog-content>
      <div *ngIf="manualPayment">
        <p>1. Go to MPesa Menu</p>
        <p>2. Select Lipa na MPesa</p>
        <p>3. Select Pay Bill</p>
        <p>4. Enter business number - 4123793</p>
        <p>5. Enter account number - {{ data.invNum }}</p>
        <p>6. Enter amount Ksh. {{ data.amount }}</p>
        <p>7. Enter MPesa Pin</p>
        <p>Business Name: Bunika Solutions</p>

        <mat-form-field>
          <input matInput placeholder="MPesa Code" [(ngModel)]="code" />
        </mat-form-field>
      </div>

      <div *ngIf="!manualPayment">
        <p>You will receive a prompt on your phone to complete the payment</p>
        <p><b>Purpose:</b> {{ data.invPurpose }}</p>
        <p>Business Name: Bunika Solutions</p>
        <p>Account Number: {{ data.invNum }}</p>
        <p>Amount: Ksh. {{ data.amount }}</p>

        <mat-form-field>
          <input
            matInput
            placeholder="Phone Number"
            [(ngModel)]="paymentPhone"
          />
        </mat-form-field>
      </div>

      <div *ngIf="sentStk">{{ paymentStatus }}</div>
      <div class="error-message" *ngIf="error">{{ error }}</div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        *ngIf="!sentStk"
        [disabled]="loading"
        (click)="manualPayment ? submitPayment() : initPayment()"
      >
        {{ loading ? 'Processing...' : manualPayment ? 'Submit' : 'Proceed' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .error-message {
        color: #f44336;
        margin-top: 16px;
      }
      mat-form-field {
        width: 100%;
        margin: 16px 0;
      }
    `,
  ],
})
export class PaymentDialogComponent implements OnDestroy {
  code = '';
  paymentPhone: string;
  error = '';
  loading = false;
  manualPayment = false;
  sentStk = false;
  paymentStatus = 'Waiting';
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
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
    this.billingService
      .payInvoice({
        amount: this.data.amount,
        id: this.data.invID,
        code: this.code,
        purpose: 'ACTIVATE - Business',
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
    let dots = 0;
    const statusInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      this.paymentStatus = 'Waiting' + '.'.repeat(dots);
    }, 500);

    const checkPayment = setInterval(() => {
      this.billingService.queryPayment(stkData).subscribe({
        next: (response) => {
          if (response.success && response.data.paid) {
            clearInterval(statusInterval);
            clearInterval(checkPayment);
            this.paymentStatus = 'Payment received successfully!';
            setTimeout(() => this.dialogRef.close(true), 2000);
            clearInterval(statusInterval);
            clearInterval(checkPayment);
          } else if (response.success && !response.data.paid) {
            this.error = 'Payment processing failed!';
            this.manualPayment = true;
            this.sentStk = false;
            clearInterval(statusInterval);
            clearInterval(checkPayment);
          }
        },
      });
    }, 2000);

    // Cleanup intervals after 5 minutes
    setTimeout(() => {
      clearInterval(statusInterval);
      clearInterval(checkPayment);
      if (this.sentStk) {
        this.error = 'Payment timeout. Please try again';
        this.sentStk = false;
      }
    }, 300000);
  }
}
