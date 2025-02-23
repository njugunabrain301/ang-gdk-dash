import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from './dashboard.service';
import { DeliveryLocation } from '../interfaces/delivery.interface';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  constructor(private httpClient: HttpClient) {}

  getDeliveries() {
    return this.httpClient.get<ApiResponse<DeliveryLocation[]>>('/delivery');
  }

  addDelivery(delivery: any) {
    return this.httpClient.post<ApiResponse<DeliveryLocation[]>>(
      '/delivery/add',
      delivery
    );
  }

  deleteDelivery(data: any) {
    return this.httpClient.post<ApiResponse<DeliveryLocation[]>>(
      `delivery/delete`,
      data
    );
  }

  getLocations() {
    return this.httpClient.get<ApiResponse<DeliveryLocation[]>>('/locations');
  }
}
