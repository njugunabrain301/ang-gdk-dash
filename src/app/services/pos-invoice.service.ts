import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutInfo } from '../interfaces/CheckoutInfo.Interface';
import { POSInvoice } from '../interfaces/POSInvoice.interface';
import { ApiResponse, ApiResponseArray } from './dashboard.service';

@Injectable({
  providedIn: 'root',
})
export class PosInvoiceService {
  httpClient = inject(HttpClient);
  constructor() {}

  getCheckoutInfo() {
    return this.httpClient.get<ApiResponse<CheckoutInfo>>('/checkoutinfo', {});
  }

  getPOSInvoices() {
    return this.httpClient.get<ApiResponseArray<POSInvoice>>(
      '/pos/invoices',
      {}
    );
  }

  sendPOSInvoice(payload: any) {
    return this.httpClient.post<ApiResponse<POSInvoice>>(
      '/pos/invoice',
      payload
    );
  }

  payPOSInvoice(payload: any) {
    return this.httpClient.post<ApiResponseArray<POSInvoice>>(
      '/pos/invoice/pay',
      payload
    );
  }

  cancelPOSInvoice(payload: any) {
    return this.httpClient.post<ApiResponseArray<POSInvoice>>(
      '/pos/invoice/cancel',
      payload
    );
  }
}
