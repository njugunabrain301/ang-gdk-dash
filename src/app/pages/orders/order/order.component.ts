import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { OrdersService } from '../../../services/orders.service';
import { BehaviorSubject, finalize } from 'rxjs';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent {
  @Input() order: any;
  @Input() modifiable: boolean = false;
  @Output() orderUpdate = new EventEmitter<any>();

  private downloadingSubject = new BehaviorSubject<string>('');
  downloading$ = this.downloadingSubject.asObservable();

  private updatingSubject = new BehaviorSubject<string>('');
  updating$ = this.updatingSubject.asObservable();

  constructor(private ordersService: OrdersService) {}

  handleSetStatus(
    oid: string,
    uid: string,
    opid: string,
    status: string
  ): void {
    if (this.updatingSubject.value) return;

    this.updatingSubject.next(status);
    this.ordersService
      .setStatus(oid, uid, opid, status)
      .pipe(finalize(() => this.updatingSubject.next('')))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.orderUpdate.emit(response.data);
          }
        },
        error: (error) => console.error('Error updating status:', error),
      });
  }

  downloadReceipt(oid: string, uid: string): void {
    this.downloadingSubject.next(oid);
    this.ordersService
      .downloadReceipt(oid, uid)
      .pipe(finalize(() => this.downloadingSubject.next('')))
      .subscribe({
        next: (response) => {
          // Handle the blob response here
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `receipt-${oid}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => console.error('Error downloading receipt:', error),
      });
  }

  openDescriptionDialog(item: any): void {
    // Implement dialog logic here using MatDialog
  }
}
