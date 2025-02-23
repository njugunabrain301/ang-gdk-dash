import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface DashboardAPIResponse<T> {
  success: boolean;
  data: T;
}

export interface Statistics {
  growth: ChartData;
  visits_data: ChartData;
  revenue_data: ChartData;
  visits: number;
  users: number;
  revenue: number;
  orders: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  };
}

export interface EssentialInfo {
  orders: number;
  invoices: number;
}

export interface CheckoutInfo {
  deliveryLocations: DeliveryLocation[];
}

export interface DeliveryLocation {
  county: string;
  subcounty: string;
  courier: string;
  description: string;
  price: number;
}

export interface POSInvoice {
  _id: string;
  // Add other relevant fields
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiResponseArray<T> {
  success: boolean;
  data: [T];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private httpClient = inject(HttpClient);
  constructor() {}

  fetchDashboard() {
    return this.httpClient.post<DashboardAPIResponse<String>>('', {});
  }

  getStatistics() {
    return this.httpClient.get<DashboardAPIResponse<Statistics>>(
      '/statistics',
      {}
    );
  }
}
