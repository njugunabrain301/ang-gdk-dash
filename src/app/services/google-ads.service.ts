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

  /**
   * GET /google/shopping-ads
   * mode=metrics: date-segmented performance (from/to); mode=inventory: all Shopping product ads (from/to ignored).
   * Server uses a large Google page size; UI slices with `shoppingAdsPageSize` in the component.
   */
  getShoppingAds(params?: {
    mode?: 'metrics' | 'inventory';
    pageToken?: string;
    from?: string;
    to?: string;
  }): Observable<ApiResponse<ShoppingAdsResponse>> {
    const p = new URLSearchParams();
    const mode = params?.mode ?? 'metrics';
    p.set('mode', mode);
    if (params?.pageToken != null && String(params.pageToken).length > 0) {
      p.set('pageToken', String(params.pageToken));
    }
    if (mode === 'metrics') {
      if (params?.from) p.set('from', params.from);
      if (params?.to) p.set('to', params.to);
    }
    return this.httpClient.get<ApiResponse<ShoppingAdsResponse>>(`/google/shopping-ads?${p.toString()}`);
  }

  /** GET /google/shopping-ads/products — pass `adGroupId` to scope listing groups / performance to that ad group. */
  getShoppingAdProducts(params: {
    adGroupId: string;
    campaignId?: string;
    from?: string;
    to?: string;
  }): Observable<ApiResponse<ShoppingAdProductsResponse>> {
    const p = new URLSearchParams();
    p.set('adGroupId', params.adGroupId);
    if (params.campaignId) p.set('campaignId', params.campaignId);
    if (params.from) p.set('from', params.from);
    if (params.to) p.set('to', params.to);
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

  updateCampaignBudget(
    campaignId: string,
    amountMicros: number,
  ): Observable<ApiResponse<{ campaignId: string; budgetResourceName?: string; amountMicros: number }>> {
    return this.httpClient.post<ApiResponse<{ campaignId: string; budgetResourceName?: string; amountMicros: number }>>(
      `/google/campaigns/${campaignId}/budget`,
      { amountMicros },
    );
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
  adGroupName?: string;
  campaignId?: string;
  campaignName?: string;
  /**
   * Metrics mode only: earliest day in the selected date range with reporting data for this ad.
   * Not the ad’s creation date (Google Ads does not expose that on ad_group_ad).
   */
  firstActivityDate?: string;
  clicks?: number;
  costMicros?: number;
}

export interface ShoppingAdsResponse {
  mode: 'metrics' | 'inventory';
  data: GoogleShoppingAd[];
  /** @deprecated Ignored by API; use client page size only. */
  limit?: number;
  nextPageToken?: string;
  /** metrics mode only */
  from?: string;
  to?: string;
  /** legacy fields (optional) */
  page?: number;
  total?: number;
}

export interface ShoppingAdProduct {
  productItemId: string | null;
  productTitle: string;
  /** When productItemId matches GProduct._id for this business (e.g. Merchant offer id). */
  gProductId?: string | null;
  gProductName?: string | null;
  /** Present when `mode === 'metrics'`; omitted or null for inventory listing */
  impressions?: number | null;
  clicks?: number | null;
  costMicros?: number | null;
  conversions?: number | null;
  conversionsValue?: number | null;
}

export interface ShoppingAdProductsResponse {
  campaignId?: string | null;
  adGroupId?: string | null;
  /** inventory = listing-group products for the campaign (no date). metrics = performance view for from/to. */
  mode?: 'inventory' | 'metrics';
  from?: string;
  to?: string;
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
