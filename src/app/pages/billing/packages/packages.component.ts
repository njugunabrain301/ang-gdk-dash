import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { BillingService } from '../../../services/billing.service';
import { PackagePaymentDialogComponent } from './package-payment-dialog/package-payment-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatGridListModule,
    PackagePaymentDialogComponent,
  ],
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit, OnChanges {
  @Input() profile: any;
  @Input() invoices: any[] = [];
  /** From GET /invoices invoiceSummary — required when invoices list is paginated */
  @Input() hasPendingActivationInvoice = false;
  @Input() lastPayment: any;
  @Input() currentPackage: string = '';
  @Input() status: any;

  @Output() invoicesChange = new EventEmitter<void>();
  @Output() lastPaymentChange = new EventEmitter<any>();
  @Output() subscriptionChange = new EventEmitter<string>();
  @Output() packageChange = new EventEmitter<string>();

  pending = false;
  invNum = 'GD' + (Date.now() % 100000);
  invID = '';
  invPurpose = '';

  constructor(
    private dialog: MatDialog,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.syncPendingFromInput();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasPendingActivationInvoice']) {
      this.syncPendingFromInput();
    }
  }

  private syncPendingFromInput(): void {
    this.pending = this.hasPendingActivationInvoice;
  }

  async generateInvoice(amount: number, purpose: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.billingService.generateInvoice({
          amount,
          id: this.invNum,
          purpose,
        })
      );

      if (response.success) {
        const inv = response.data;
        this.invID = inv._id;
        this.invNum = inv.invNum;
        this.invPurpose = inv.description;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async openPaymentDialog(isBusinessPackage: boolean): Promise<void> {
    const amount = isBusinessPackage ? 3000 : 6000;
    const purpose = isBusinessPackage
      ? 'ACTIVATE - Business'
      : 'Purchase - Starter';

    if (!this.invID) {
      const success = await this.generateInvoice(amount, purpose);
      if (!success) {
        console.error('Failed to generate invoice');
        return;
      }
    }

    const dialogRef = this.dialog.open(PackagePaymentDialogComponent, {
      width: '400px',
      data: {
        amount,
        invNum: this.invNum,
        invID: this.invID,
        invPurpose: this.invPurpose,
        phone: this.profile?.phone || '',
        isBusinessPackage,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (isBusinessPackage) {
          this.pending = true;
        }
        this.lastPaymentChange.emit(result.lastPayment);
        this.invoicesChange.emit();
      }
    });
  }

  deactivatePackage(): void {
    this.billingService.deactivatePackage().subscribe({
      next: (response) => {
        if (response.success) {
          this.subscriptionChange.emit(response.data.subscription);
          this.packageChange.emit(response.data.package);
          this.lastPaymentChange.emit(response.data.lastPayment);
          this.invoicesChange.emit();
        }
      },
    });
  }

  activatePackage(): void {
    this.billingService.activatePackage().subscribe({
      next: (response) => {
        if (response.success) {
          this.subscriptionChange.emit(response.data.subscription);
          this.packageChange.emit(response.data.package);
          this.lastPaymentChange.emit(response.data.lastPayment);
          this.invoicesChange.emit();
        }
      },
    });
  }
}
