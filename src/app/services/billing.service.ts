import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LastPayment {
  year: number;
  month: number;
  day: number;
}

export interface Status {
  subscription: string;
  // Add other status properties as needed
}

export interface BillingResponse {
  lastPayment: LastPayment;
  subscription: string;
  invoices: any[];
  package: string;
  status: Status;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Invoice {
  _id: string;
  invNum: string;
  dateGenerated: string;
  dueDate: string;
  status: string;
  description: string;
  datePaid: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private httpClient = inject(HttpClient);

  getInvoices(): Observable<ApiResponse<BillingResponse>> {
    return this.httpClient.get<ApiResponse<BillingResponse>>('/invoices');
  }

  payInvoice(data: {
    amount: number;
    id: string;
    code: string;
    purpose: string;
  }): Observable<
    ApiResponse<{
      lastPayment: LastPayment;
      invoices: any[];
    }>
  > {
    return this.httpClient.post<ApiResponse<any>>('/invoices/pay', data);
  }

  deactivatePackage(): Observable<
    ApiResponse<{
      subscription: string;
      package: string;
      lastPayment: LastPayment;
      invoices: any[];
    }>
  > {
    return this.httpClient.post<ApiResponse<any>>('/packages/deactivate', {});
  }

  activatePackage(): Observable<
    ApiResponse<{
      subscription: string;
      package: string;
      lastPayment: LastPayment;
      invoices: any[];
    }>
  > {
    return this.httpClient.post<ApiResponse<any>>('/packages/activate', {});
  }

  generateInvoice(data: {
    amount: number;
    id: string;
    purpose: string;
  }): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/invoices/generate', data);
  }

  initiatePayment(data: {
    phone: string;
    amount: number;
    invoiceNum: string;
    description: string;
    iid: string;
  }): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/initiate-payment', data);
  }

  queryPayment(data: any): Observable<ApiResponse<{ paid: boolean }>> {
    return this.httpClient.post<ApiResponse<any>>('/query-payment', data);
  }

  getInvoicePaymentStatus(
    stkData: any
  ): Observable<ApiResponse<{ paid: boolean }>> {
    return this.httpClient.post<ApiResponse<{ paid: boolean }>>(
      '/query-payment',
      stkData
    );
  }

  initiateInvoicePayment(data: {
    phone: string;
    amount: number;
    invoiceNum: string;
    description: string;
    iid: string;
  }): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/initiate-payment', data);
  }

  // Add other billing-related API methods as needed
}
