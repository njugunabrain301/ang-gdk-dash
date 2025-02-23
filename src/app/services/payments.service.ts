import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from './dashboard.service';
import { Paybill, Till } from '../interfaces/payment.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private httpClient: HttpClient) {}

  getPaymentMethods() {
    return this.httpClient.get<
      ApiResponse<{ MPesaPaybill: Paybill; MPesaTill: Till }>
    >('/profile');
  }

  updateMpesaPaybill(paybill: Paybill) {
    return this.httpClient.post<ApiResponse<Paybill>>(
      '/profile/update/mpesapaybill',
      paybill
    );
  }

  deleteMpesaPaybill(payload: any) {
    return this.httpClient.post<ApiResponse<Paybill>>(
      '/profile/delete/mpesapaybill',
      payload
    );
  }

  updateMpesaTill(till: Till) {
    return this.httpClient.post<ApiResponse<Till>>(
      '/profile/update/mpesatill',
      till
    );
  }

  deleteMpesaTill(payload: any) {
    return this.httpClient.post<ApiResponse<Till>>(
      '/profile/delete/mpesatill',
      payload
    );
  }
}
