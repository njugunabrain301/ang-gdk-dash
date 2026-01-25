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

  /**
   * Fetch all ads for the business account
   * Response structure matches Facebook Insights API: { data: { data: [...], paging: {...} } }
   */
  getAds(params?: { limit?: number; after?: string; before?: string; date_preset?: string }): Observable<ApiResponse<{ data: AdWithInsights[]; paging: any }>> {
    let url = '/marketing/ads';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.after) queryParams.append('after', params.after);
      if (params.before) queryParams.append('before', params.before);
      if (params.date_preset) queryParams.append('date_preset', params.date_preset);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return this.httpClient.get<ApiResponse<{ data: AdWithInsights[]; paging: any }>>(url);
  }

  /**
   * Get marketing overview statistics
   */
  getOverviewStats(): Observable<ApiResponse<{ totalSpend: number; activeAds: number; totalAds: number; clicks: number }>> {
    return this.httpClient.get<ApiResponse<{ totalSpend: number; activeAds: number; totalAds: number; clicks: number }>>(
      '/marketing/overview'
    );
  }

  /**
   * Get creative details by creative ID
   */
  getCreativeDetails(creativeId: string): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `/marketing/creative/${creativeId}`
    );
  }

  /**
   * Get image URL by image hash
   */
  getImageUrl(imageHash: string): Observable<ApiResponse<{ url: string }>> {
    return this.httpClient.get<ApiResponse<{ url: string }>>(
      `/marketing/image/${imageHash}`
    );
  }

  /**
   * Upload image file
   */
  uploadImage(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('img', file);
    return this.httpClient.post<ApiResponse<string>>(
      '/image/upload/single',
      formData
    );
  }

  /**
   * Get adset details by adset ID
   */
  getAdsetDetails(adsetId: string): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(
      `/marketing/adset/${adsetId}`
    );
  }

  /**
   * Activate an ad using safe activation flow (campaign -> adset -> ad)
   */
  activateAd(adId: string): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(
      `/marketing/ad/${adId}/activate`,
      {}
    );
  }

  /**
   * Update an ad
   */
  updateAd(adId: string, data: { 
    name?: string; 
    status?: 'PAUSED' | 'ACTIVE' | 'ARCHIVED';
    headline?: string;
    link?: string;
    description?: string;
    message?: string;
    call_to_action?: string;
    image_url?: string;
    adsetId?: string;
    daily_budget?: number;
  }): Observable<ApiResponse<any>> {
    return this.httpClient.put<ApiResponse<any>>(
      `/marketing/ad/${adId}`,
      data
    );
  }
}

export interface AdCreativeLinkData {
  headline?: string;
  link?: string;
  description?: string;
  message?: string;
  call_to_action_type?: string;
  call_to_action?: string;
  name?: string;
  image_hash?: string;
}

export interface AdCreativeObjectStorySpec {
  link_data?: AdCreativeLinkData;
}

export interface AdCreative {
  name?: string;
  id?: string;
  object_story_spec?: AdCreativeObjectStorySpec;
  link_data?: AdCreativeLinkData;
  headline?: string;
  link?: string;
  description?: string;
  message?: string;
  call_to_action_type?: string;
  call_to_action?: string;
  image_url?: string;
  image_hash?: string;
}

export interface AdWithInsights {
  id: string;
  name: string;
  status: string;
  created_time?: string;
  updated_time?: string;
  adset_id?: string;
  campaign_id?: string;
  effective_status?: string;
  creative?: AdCreative;
  delivery_info?: {
    status?: string;
    status_code?: number;
  };
  insights?: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpp: number;
    cpm: number;
  };
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
