import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JourneyTreeNode {
  page: string;
  count: number;
  leads?: number;
  children: JourneyTreeNode[];
}

export interface JourneySource {
  source: string;
  visitors: number;
  leads: number;
  conversionRate: number;
  /** Single root (legacy) or forest of roots from the API */
  tree: JourneyTreeNode | JourneyTreeNode[];
}

export interface CustomerJourneysData {
  sources: JourneySource[];
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private httpClient = inject(HttpClient);

  getCustomerJourneys(from: string, to: string, productId?: string | null) {
    const params: Record<string, string> = { from, to };
    if (productId) {
      params['productId'] = productId;
    }
    return this.httpClient.get<ApiResponse<CustomerJourneysData>>(
      '/analytics/customer-journeys',
      { params }
    );
  }
}
