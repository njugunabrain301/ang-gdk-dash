import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { PosInvoiceService } from '../../services/pos-invoice.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pos-invoice',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './pos-invoice.component.html',
})
export class PosInvoiceComponent {
  @Input() invoice: any;
  @Output() updateInvoices = new EventEmitter<any[]>();
  isProcessing = false;

  paymentCode: string = '';
  paymentMode: string = 'Cash';
  downloading: string = '';

  private posInvoiceService = inject(PosInvoiceService);

  ngOnInit() {
    this.paymentCode = this.invoice.paymentCode || '';
    this.paymentMode = this.invoice.paymentMode
      ? this.invoice.paymentMode.replace('-', ' ')
      : 'Cash';
  }

  // payInvoice() {
  //   if (!this.paymentCode || !this.paymentMode) {
  //     return;
  //   }

  //   const payload = {
  //     ...this.invoice,
  //     paymentCode: this.paymentCode,
  //     paymentMode: this.paymentMode,
  //   };

  //   this.posInvoiceService.payPOSInvoice(payload).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.updateInvoices.emit(response as any);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error paying invoice:', error);
  //       // Handle error (maybe show a snackbar/toast)
  //     },
  //   });
  // }

  payInvoice() {
    if (!this.paymentCode || !this.paymentMode || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const payload = {
      ...this.invoice,
      paymentCode: this.paymentCode,
      paymentMode: this.paymentMode,
    };

    this.posInvoiceService
      .payPOSInvoice(payload)
      .pipe(finalize(() => (this.isProcessing = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.updateInvoices.emit(response.data);
          }
        },
        error: (error) => {
          console.error('Error paying invoice:', error);
        },
      });
  }

  cancelInvoice() {
    this.posInvoiceService.cancelPOSInvoice(this.invoice).subscribe({
      next: (response) => {
        if (response.success) {
          this.updateInvoices.emit(response.data);
        }
      },
      error: (error) => {
        console.error('Error canceling invoice:', error);
        // Handle error (maybe show a snackbar/toast)
      },
    });
  }

  downloadReceipt(oid: string) {
    this.downloading = oid;

    this.posInvoiceService.httpClient
      .get(`/receipt/${oid}/pos`, { responseType: 'blob' })
      .pipe(finalize(() => (this.downloading = '')))
      .subscribe({
        next: (blob) => {
          // Create a URL for the blob and trigger download
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-${oid}.pdf`; // or whatever extension is appropriate
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error downloading receipt:', error);
          // Handle error (maybe show a snackbar/toast)
        },
      });
  }
}
