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
  channel: 'meta';
  position: 'front' | 'back';
}

export interface ClearPriorityRequest {
  channel: 'meta';
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
   * Add a product to the posting priority queue
   * @param data - Contains productId, channel ('meta' adds to both facebook and instagram), and position ('front' or 'back')
   */
  pushPriority(data: PushPriorityRequest): Observable<ApiResponse<string[] | { facebook: string[]; instagram: string[] }>> {
    return this.httpClient.post<ApiResponse<string[] | { facebook: string[]; instagram: string[] }>>(
      '/marketing/priority-items/push',
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
   * Generate ad copy for a product (AI-powered primary text, headlines, descriptions).
   * Optional landingPageName targets a specific landing page; otherwise uses the first.
   */
  generateAd(productId: string, landingPageName?: string): Observable<ApiResponse<GenerateAdData>> {
    const body = landingPageName
      ? { productId, landingPageName }
      : { productId };
    return this.httpClient.post<ApiResponse<GenerateAdData>>(
      '/marketing/generateAd',
      body
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

  // --- TikTok ---

  getTiktokOAuthStartUrl(): Observable<ApiResponse<{ redirectUrl: string }>> {
    return this.httpClient.get<ApiResponse<{ redirectUrl: string }>>('/tiktok/oauth/start-url');
  }

  getTiktokStatus(): Observable<ApiResponse<TiktokStatus>> {
    return this.httpClient.get<ApiResponse<TiktokStatus>>('/tiktok/status');
  }

  getTiktokAdvertisers(): Observable<ApiResponse<TiktokAdvertiser[]>> {
    return this.httpClient.get<ApiResponse<TiktokAdvertiser[]>>('/tiktok/advertisers');
  }

  getTiktokAds(params?: { advertiser_id?: string; page?: number; page_size?: number }): Observable<ApiResponse<TiktokAdsResponse>> {
    const q = new URLSearchParams();
    if (params?.advertiser_id) q.append('advertiser_id', params.advertiser_id);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.page_size) q.append('page_size', params.page_size.toString());
    const query = q.toString();
    return this.httpClient.get<ApiResponse<TiktokAdsResponse>>(`/tiktok/ads${query ? `?${query}` : ''}`);
  }

  updateTiktokAdStatus(adId: string, status: 'ENABLE' | 'DISABLE', advertiserId?: string): Observable<ApiResponse<any>> {
    return this.httpClient.put<ApiResponse<any>>(`/tiktok/ads/${adId}/status`, { status, advertiser_id: advertiserId });
  }

  getTiktokCreatorInfo(): Observable<ApiResponse<TiktokCreatorInfo>> {
    return this.httpClient.get<ApiResponse<TiktokCreatorInfo>>('/tiktok/creator-info');
  }

  postTiktokPhoto(body: TiktokPostPhotoRequest): Observable<ApiResponse<{ publish_id: string }>> {
    return this.httpClient.post<ApiResponse<{ publish_id: string }>>('/tiktok/post/photo', body);
  }

  postTiktokVideo(body: TiktokPostVideoRequest): Observable<ApiResponse<{ publish_id: string }>> {
    return this.httpClient.post<ApiResponse<{ publish_id: string }>>('/tiktok/post/video', body);
  }

  getTiktokPostStatus(publishId: string): Observable<ApiResponse<TiktokPublishStatus>> {
    return this.httpClient.get<ApiResponse<TiktokPublishStatus>>(`/tiktok/post/status/${publishId}`);
  }

  createTiktokCampaign(body: TiktokCampaignCreateRequest): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/tiktok/campaigns', body);
  }

  createTiktokAdgroup(body: TiktokAdgroupCreateRequest): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/tiktok/adgroups', body);
  }

  createTiktokAd(body: TiktokAdCreateRequest): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/tiktok/ads', body);
  }
}

export interface TiktokStatus {
  connected: boolean;
  advertiserId: string | null;
  openId: string | null;
  displayName: string | null;
}

export interface TiktokAdvertiser {
  advertiser_id?: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface TiktokAdsResponse {
  list: TiktokAd[];
  page?: number;
  total_page?: number;
  total_number?: number;
}

export interface TiktokAd {
  ad_id: string;
  ad_name?: string;
  status?: string;
  operation_status?: string;
  campaign_id?: string;
  adgroup_id?: string;
  create_time?: string;
  modify_time?: string;
  [key: string]: unknown;
}

export interface TiktokCreatorInfo {
  privacy_level_options?: string[];
  [key: string]: unknown;
}

export interface TiktokPostPhotoRequest {
  photo_images: string[];
  photo_cover_index: number;
  title?: string;
  description?: string;
  privacy_level?: string;
}

export interface TiktokPostVideoRequest {
  video_url: string;
  title?: string;
  description?: string;
  privacy_level?: string;
  disable_comment?: boolean;
  disable_duet?: boolean;
  disable_stitch?: boolean;
  video_cover_timestamp_ms?: number;
}

export interface TiktokPublishStatus {
  status?: string;
  publish_id?: string;
  fail_reason?: string;
  [key: string]: unknown;
}

export interface TiktokCampaignCreateRequest {
  advertiser_id?: string;
  campaign_name: string;
  objective_type: string;
  budget_mode?: string;
  budget?: number;
  operation_status?: string;
  [key: string]: unknown;
}

export interface TiktokAdgroupCreateRequest {
  advertiser_id?: string;
  campaign_id: string;
  adgroup_name: string;
  budget?: number;
  budget_mode?: string;
  billing_event?: string;
  [key: string]: unknown;
}

export interface TiktokAdCreateRequest {
  advertiser_id?: string;
  adgroup_id: string;
  ad_name: string;
  creatives?: unknown[];
  [key: string]: unknown;
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

export interface GenerateAdData {
  image: string;
  link: string;
  campaign_name: string;
  adset_name: string;
  ads: Array<{
    name: string;
    primary_text: string;
    headline: string;
    description: string;
  }>;
  /** Generated image URL per ad (one per ad when provided by backend). */
  images?: string[];
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
