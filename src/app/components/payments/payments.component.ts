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
import { PaymentService } from '../../services/payments.service';
import { Paybill, Till } from '../../interfaces/payment.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment',
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
  ],
  providers: [MatSnackBarConfig],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentComponent implements OnInit {
  // Current state
  paybillItem: Paybill = { paybillNumber: '', accountNumber: '', name: '' };
  tillItem: Till = { tillNumber: '', storeNumber: '', name: '' };

  // Original state
  private originalPaybill: Paybill | null = null;
  private originalTill: Till | null = null;

  isLoading = false;

  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPaymentMethods();
  }

  loadPaymentMethods() {
    this.paymentService.getPaymentMethods().subscribe({
      next: (res) => {
        if (res.success) {
          // Set current state
          this.paybillItem = res.data.MPesaPaybill;
          this.tillItem = res.data.MPesaTill;

          // Store original state
          this.originalPaybill = JSON.parse(
            JSON.stringify(res.data.MPesaPaybill)
          );
          this.originalTill = JSON.parse(JSON.stringify(res.data.MPesaTill));

          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        this.showSnackbar('Error loading payment methods', 'error');
      },
    });
  }

  updatePaybill() {
    this.isLoading = true;
    this.paymentService.updateMpesaPaybill(this.paybillItem).subscribe({
      next: (res) => {
        if (res.success) {
          this.paybillItem = res.data;
          this.originalPaybill = JSON.parse(JSON.stringify(res.data));
          this.showSnackbar('Paybill updated successfully', 'success');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating paybill:', error);
        this.showSnackbar('Error updating paybill', 'error');
        this.isLoading = false;
      },
    });
  }

  deletePaybill() {
    this.paymentService.deleteMpesaPaybill({}).subscribe({
      next: (res) => {
        if (res.success) {
          const emptyPaybill = {
            paybillNumber: '',
            accountNumber: '',
            name: '',
          };
          this.paybillItem = emptyPaybill;
          this.originalPaybill = JSON.parse(JSON.stringify(emptyPaybill));
          this.showSnackbar('Paybill deleted successfully', 'success');
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting paybill:', error);
        this.showSnackbar('Error deleting paybill', 'error');
      },
    });
  }

  updateTill() {
    if (
      !this.tillItem.tillNumber ||
      !this.tillItem.storeNumber ||
      !this.tillItem.name
    ) {
      this.showSnackbar('Please fill in all Till fields', 'error');
      return;
    }
    this.isLoading = true;
    this.paymentService.updateMpesaTill(this.tillItem).subscribe({
      next: (res) => {
        if (res.success) {
          this.tillItem = res.data;
          this.originalTill = JSON.parse(JSON.stringify(res.data));
          this.showSnackbar('Till updated successfully', 'success');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating till:', error);
        this.showSnackbar('Error updating till', 'error');
        this.isLoading = false;
      },
    });
  }

  deleteTill() {
    this.paymentService.deleteMpesaTill({}).subscribe({
      next: (res) => {
        if (res.success) {
          const emptyTill = { tillNumber: '', storeNumber: '', name: '' };
          this.tillItem = emptyTill;
          this.originalTill = JSON.parse(JSON.stringify(emptyTill));
          this.showSnackbar('Till deleted successfully', 'success');
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting till:', error);
        this.showSnackbar('Error deleting till', 'error');
      },
    });
  }

  cancelPaybillChanges() {
    if (this.originalPaybill) {
      this.paybillItem = JSON.parse(JSON.stringify(this.originalPaybill));
    }
  }

  cancelTillChanges() {
    if (this.originalTill) {
      this.tillItem = JSON.parse(JSON.stringify(this.originalTill));
    }
  }

  hasPaybillChanges(): boolean {
    return this.originalPaybill
      ? JSON.stringify(this.paybillItem) !==
          JSON.stringify(this.originalPaybill)
      : false;
  }

  hasTillChanges(): boolean {
    return this.originalTill
      ? JSON.stringify(this.tillItem) !== JSON.stringify(this.originalTill)
      : false;
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      // horizontalPosition: 'right',
      // verticalPosition: 'top',
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }
}
