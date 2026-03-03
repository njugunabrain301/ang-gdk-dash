import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './dashboard.service';

export interface GoogleConnectionStatus {
  connected: boolean;
  googleAdsCustomerId?: string | null;
  merchantCenterId?: string | null;
  accountCurrencyCode?: string | null;
  productFeedStoreId?: string | null;
  linkedAt?: string | null;
}

/** Product from GET /google/product-feed (RSS with g: namespace) */
export interface ProductFeedItem {
  itemId: string;
  title?: string;
  brand?: string;
  productType?: string;
  condition?: string;
  availability?: string;
  price?: string;
  imageLink?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAdsService {
  private httpClient = inject(HttpClient);

  /**
   * Get Google connection status for the current business
   */
  getConnectionStatus(): Observable<ApiResponse<GoogleConnectionStatus>> {
    return this.httpClient.get<ApiResponse<GoogleConnectionStatus>>('/google/status');
  }

  /**
   * Start Google OAuth flow: call backend with auth to get Google OAuth URL, then redirect to Google only.
   * Does NOT redirect to our backend - only XHR to /google/oauth/start-url, then window.location to Google.
   */
  startOAuth(): Observable<ApiResponse<{ redirectUrl: string }>> {
    return this.httpClient.get<ApiResponse<{ redirectUrl: string }>>('/google/oauth/start-url');
  }

  /**
   * Disconnect Google account (removes stored credentials)
   */
  disconnect(): Observable<ApiResponse<{ disconnected: boolean }>> {
    return this.httpClient.post<ApiResponse<{ disconnected: boolean }>>('/google/disconnect', {});
  }

  /**
   * Get approximate CPC estimate (micros) in account currency for a USD amount.
   */
  getCpcEstimate(amountUsd: number): Observable<ApiResponse<{ micros: number; accountCurrencyCode?: string; rate?: number }>> {
    const p = new URLSearchParams();
    p.set('amountUsd', String(amountUsd));
    return this.httpClient.get<ApiResponse<{ micros: number; accountCurrencyCode?: string; rate?: number }>>(
      `/google/cpc-estimate?${p.toString()}`,
    );
  }

  /**
   * Get product feed for ad group product picker (fetches and parses merchant RSS feed).
   */
  getProductFeed(): Observable<ApiResponse<{ products: ProductFeedItem[] }>> {
    return this.httpClient.get<ApiResponse<{ products: ProductFeedItem[] }>>('/google/product-feed');
  }

  // --- Phase 2: read-only campaigns, ad-groups, shopping-ads, metrics ---

  /** Campaign list item from GET /google/campaigns */
  getCampaigns(params?: { limit?: number; pageToken?: string }): Observable<ApiResponse<CampaignsResponse>> {
    const p = new URLSearchParams();
    if (params?.limit != null) p.set('limit', String(params.limit));
    if (params?.pageToken) p.set('pageToken', params.pageToken);
    const q = p.toString();
    return this.httpClient.get<ApiResponse<CampaignsResponse>>(`/google/campaigns${q ? `?${q}` : ''}`);
  }

  /** Ad groups for a campaign from GET /google/ad-groups */
  getAdGroups(campaignId: string, params?: { limit?: number; pageToken?: string }): Observable<ApiResponse<AdGroupsResponse>> {
    const p = new URLSearchParams({ campaignId });
    if (params?.limit != null) p.set('limit', String(params.limit));
    if (params?.pageToken) p.set('pageToken', params.pageToken);
    return this.httpClient.get<ApiResponse<AdGroupsResponse>>(`/google/ad-groups?${p.toString()}`);
  }

  /** Shopping ads list from GET /google/shopping-ads (optional from/to for metrics date range) */
  getShoppingAds(params?: { limit?: number; pageToken?: string; from?: string; to?: string }): Observable<ApiResponse<ShoppingAdsResponse>> {
    const p = new URLSearchParams();
    if (params?.limit != null) p.set('limit', String(params.limit));
    if (params?.pageToken) p.set('pageToken', params.pageToken);
    if (params?.from) p.set('from', params.from);
    if (params?.to) p.set('to', params.to);
    const q = p.toString();
    return this.httpClient.get<ApiResponse<ShoppingAdsResponse>>(`/google/shopping-ads${q ? `?${q}` : ''}`);
  }

  /** Product-level stats for a campaign from GET /google/shopping-ads/products */
  getShoppingAdProducts(campaignId: string, params?: { from?: string; to?: string }): Observable<ApiResponse<ShoppingAdProductsResponse>> {
    const p = new URLSearchParams({ campaignId });
    if (params?.from) p.set('from', params.from);
    if (params?.to) p.set('to', params.to);
    return this.httpClient.get<ApiResponse<ShoppingAdProductsResponse>>(`/google/shopping-ads/products?${p.toString()}`);
  }

  /** Metrics from GET /google/metrics (entity, from, to) */
  getMetrics(params: { entity: 'campaign' | 'ad_group' | 'ad'; from?: string; to?: string }): Observable<ApiResponse<MetricsResponse>> {
    const p = new URLSearchParams({ entity: params.entity });
    if (params.from) p.set('from', params.from);
    if (params.to) p.set('to', params.to);
    return this.httpClient.get<ApiResponse<MetricsResponse>>(`/google/metrics?${p.toString()}`);
  }

  // --- Phase 3: create and update ---

  createCampaign(body: { name: string; amountMicros?: number; merchantId?: string }): Observable<ApiResponse<{ campaignId: string; resourceName?: string }>> {
    return this.httpClient.post<ApiResponse<{ campaignId: string; resourceName?: string }>>('/google/campaigns', body);
  }

  pauseCampaign(campaignId: string): Observable<ApiResponse<{ campaignId: string; status: string }>> {
    return this.httpClient.post<ApiResponse<{ campaignId: string; status: string }>>(`/google/campaigns/${campaignId}/pause`, {});
  }

  enableCampaign(campaignId: string): Observable<ApiResponse<{ campaignId: string; status: string }>> {
    return this.httpClient.post<ApiResponse<{ campaignId: string; status: string }>>(`/google/campaigns/${campaignId}/enable`, {});
  }

  createAdGroup(body: { campaignId: string; name: string; productItemIds?: string[]; cpcBidMicros?: number }): Observable<ApiResponse<{ adGroupId: string; resourceName?: string }>> {
    return this.httpClient.post<ApiResponse<{ adGroupId: string; resourceName?: string }>>('/google/ad-groups', body);
  }

  /** Products currently targeted by an ad group listing tree */
  getAdGroupProducts(adGroupId: string): Observable<ApiResponse<{ adGroupId: string; productItemIds: string[]; cpcBidMicros?: number | null }>> {
    return this.httpClient.get<ApiResponse<{ adGroupId: string; productItemIds: string[]; cpcBidMicros?: number | null }>>(
      `/google/ad-groups/${adGroupId}/products`,
    );
  }

  /** Update an ad group's listing group products and optional CPC */
  updateAdGroupProducts(
    adGroupId: string,
    body: { productItemIds: string[]; cpcBidMicros?: number; name?: string },
  ): Observable<ApiResponse<{ adGroupId: string; productItemIds: string[]; cpcBidMicros: number }>> {
    return this.httpClient.put<ApiResponse<{ adGroupId: string; productItemIds: string[]; cpcBidMicros: number }>>(
      `/google/ad-groups/${adGroupId}/products`,
      body,
    );
  }

  createShoppingAd(body: { adGroupId: string }): Observable<ApiResponse<{ adId: string; resourceName?: string }>> {
    return this.httpClient.post<ApiResponse<{ adId: string; resourceName?: string }>>('/google/shopping-ads', body);
  }

  pauseShoppingAd(adId: string, adGroupId: string): Observable<ApiResponse<{ adId: string; status: string }>> {
    return this.httpClient.post<ApiResponse<{ adId: string; status: string }>>(`/google/shopping-ads/${adId}/pause`, { adGroupId });
  }

  enableShoppingAd(adId: string, adGroupId: string): Observable<ApiResponse<{ adId: string; status: string }>> {
    return this.httpClient.post<ApiResponse<{ adId: string; status: string }>>(`/google/shopping-ads/${adId}/enable`, { adGroupId });
  }
}

// --- Phase 2 response types ---

export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  advertisingChannelType?: string;
  budgetAmountMicros?: string | number;
  resourceName?: string;
}

export interface CampaignsResponse {
  data: GoogleCampaign[];
  page: number;
  limit: number;
  total: number;
  nextPageToken?: string;
}

export interface GoogleAdGroup {
  id: string;
  name: string;
  status: string;
  campaignId?: string;
}

export interface AdGroupsResponse {
  data: GoogleAdGroup[];
  nextPageToken?: string;
}

export interface GoogleShoppingAd {
  id: string;
  name: string;
  status: string;
  type?: string;
  adGroupId?: string;
  campaignId?: string;
  campaignName?: string;
  clicks?: number;
  costMicros?: number;
}

export interface ShoppingAdsResponse {
  data: GoogleShoppingAd[];
  page: number;
  limit: number;
  total: number;
  from?: string;
  to?: string;
  nextPageToken?: string;
}

export interface ShoppingAdProduct {
  productItemId: string | null;
  productTitle: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  conversionsValue: number;
}

export interface ShoppingAdProductsResponse {
  campaignId: string;
  from: string;
  to: string;
  products: ShoppingAdProduct[];
}

export interface MetricsSummary {
  impressions: number;
  clicks: number;
  costMicros: number;
  conversionsValue: number;
}

export interface MetricsRow {
  entity: string;
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  ctr?: number;
  conversionsValue?: number;
  campaignId?: string;
  adGroupId?: string;
}

export interface MetricsResponse {
  from: string;
  to: string;
  entity: string;
  rows: MetricsRow[];
  summary: MetricsSummary;
}
