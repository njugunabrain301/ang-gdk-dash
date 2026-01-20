import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './dashboard.service';

export interface PriorityItem {
  _id: string;
  name: string;
}

export interface PushPriorityRequest {
  productId: string;
  channel: 'facebook' | 'instagram';
  position?: 'front' | 'back';
}

export interface ClearPriorityRequest {
  channel: 'facebook' | 'instagram';
}

@Injectable({
  providedIn: 'root',
})
export class MarketingService {
  private httpClient = inject(HttpClient);

  /**
   * Fetch posting priority queue for a channel (with product names)
   * @param channel - 'facebook' or 'instagram'
   */
  getPriorityItems(channel: 'facebook' | 'instagram'): Observable<ApiResponse<PriorityItem[]>> {
    return this.httpClient.get<ApiResponse<PriorityItem[]>>(
      `/marketing/priority-items?channel=${channel}`
    );
  }

  /**
   * Add a product to the front (index 0) of the posting priority queue
   */
  pushPriorityToFront(data: PushPriorityRequest): Observable<ApiResponse<string[]>> {
    return this.httpClient.post<ApiResponse<string[]>>(
      '/marketing/priority-items/push-front',
      data
    );
  }

  /**
   * Add a product to the back of the posting priority queue
   */
  pushPriorityToBack(data: PushPriorityRequest): Observable<ApiResponse<string[]>> {
    return this.httpClient.post<ApiResponse<string[]>>(
      '/marketing/priority-items/push-back',
      data
    );
  }

  /**
   * Clear posting priority queue for a channel
   */
  clearPriorityItems(data: ClearPriorityRequest): Observable<ApiResponse<[]>> {
    return this.httpClient.post<ApiResponse<[]>>(
      '/marketing/priority-items/clear',
      data
    );
  }

  /**
   * Create Facebook ad campaign
   */
  createAd(data: CreateAdRequest): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      '/marketing/create-ad',
      data
    );
  }
}

export interface CreateAdRequest {
  campaign: {
    name: string;
    objective: string;
    status: 'PAUSED' | 'ACTIVE';
    special_ad_categories: string[];
    buying_type: string;
    is_adset_budget_sharing_enabled: boolean;
  };
  adset: {
    name: string;
    daily_budget: number;
    billing_event: string;
    optimization_goal: string;
    bid_strategy: string;
    targeting: {
      age_min?: number;
      age_max?: number;
      genders?: number[];
      geo_locations?: {
        countries?: string[];
      };
      targeting_automation?: {
        advantage_audience?: number;
      };
    };
    status: 'PAUSED' | 'ACTIVE';
    promoted_object: {
      pixel_id?: string;
      custom_event_type?: string;
    };
  };
  ads: Array<{
    name: string;
    status: 'PAUSED' | 'ACTIVE';
    creative: {
      link: string;
      message: string;
      headline: string;
      description: string;
      call_to_action: string;
      image_url: string;
    };
    tracking_specs?: Array<{
      event_name?: string;
      fb_pixel?: string;
    }>;
  }>;
}
