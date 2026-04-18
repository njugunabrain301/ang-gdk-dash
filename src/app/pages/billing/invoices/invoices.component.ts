import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  BillingService,
  Invoice,
  InvoicesPagination,
  LastPayment,
} from '../../../services/billing.service';
import { PaymentDialogComponent } from '../packages/payment-dialog.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    PaymentDialogComponent,
  ],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
})
export class InvoicesComponent implements OnInit {
  @Input() invoices: Invoice[] = [];
  /** Server pagination (from GET /invoices?page=&limit=). When set, drives mat-paginator length/index. */
  @Input() pagination: InvoicesPagination | null = null;
  @Input() profile: any;
  @Output() invoicesChange = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() lastPaymentChange = new EventEmitter<LastPayment>();

  displayedColumns: string[] = [
    'invNum',
    'dateGenerated',
    'dueDate',
    'status',
    'description',
    'datePaid',
  ];

  pageSizeOptions = [5, 10, 25];
  selectedInvoiceDescription = '';
  showDescriptionModal = false;

  constructor(
    private dialog: MatDialog,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {}

  convertDate(date: string): string {
    const dt = new Date(date);
    return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
  }

  handlePageEvent(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  showDescription(description: string): void {
    this.selectedInvoiceDescription = description;
    this.showDescriptionModal = true;
  }

  hideDescription(): void {
    this.showDescriptionModal = false;
  }

  openPaymentDialog(invoice: Invoice): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      data: {
        invNum: invoice.invNum,
        invID: invoice._id,
        amount: invoice.amount,
        iid: invoice._id,
        phone: this.profile?.phone || '',
        invPurpose: invoice.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.lastPaymentChange.emit(result.lastPayment);
        this.invoicesChange.emit();
      }
    });
  }

  getPaymentStatus(invoice: Invoice): string | any {
    if (invoice.datePaid === '-') {
      return {
        type: 'button',
        data: invoice,
      };
    } else if (invoice.status === 'Processing') {
      return 'Processing';
    } else {
      return this.convertDate(invoice.datePaid);
    }
  }
}
