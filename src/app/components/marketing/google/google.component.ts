import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  GoogleAdsService,
  GoogleConnectionStatus,
  GoogleCampaign,
  GoogleAdGroup,
  GoogleShoppingAd,
  MetricsResponse,
  ShoppingAdProduct,
  ProductFeedItem,
} from '../../../services/google-ads.service';

@Component({
  selector: 'app-google',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule,
  ],
  templateUrl: './google.component.html',
  styleUrls: ['./google.component.css'],
})
export class GoogleComponent implements OnInit {
  selectedGoogleSection: 'overview' | 'campaigns' | 'adGroups' | 'ads' = 'overview';
  googleConnectionStatus: GoogleConnectionStatus = { connected: false };
  isLoadingGoogleStatus = false;

  // Overview (metrics)
  metricsData: MetricsResponse | null = null;
  metricsFrom = this.dateToString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  metricsTo = this.dateToString(new Date());
  isLoadingMetrics = false;
  metricsError: string | null = null;

  // Campaigns
  campaigns: GoogleCampaign[] = [];
  campaignsNextPageToken: string | null = null;
  isLoadingCampaigns = false;
  campaignsError: string | null = null;
  // Ad groups tab
  selectedAdGroupsCampaignId: string | null = null;
  adGroupsForCampaign: GoogleAdGroup[] = [];
  adGroupsForCampaignNextPageToken: string | null = null;
  isLoadingAdGroupsForCampaign = false;
  adGroupsForCampaignError: string | null = null;

  // Edit ad group modal
  showEditAdGroupModal = false;
  editAdGroupId: string | null = null;
  editAdGroupName = '';
  editAdGroupCpcUsd = 0.5;
  editAdGroupCpcMicrosEstimate: number | null = null;
  editAdGroupCpcEstimateLoading = false;
  editAdGroupCpcEstimateError: string | null = null;
  editAdGroupSelectedItemIds: string[] = [];
  editAdGroupSubmitting = false;

  // Product picker for edit
  showProductPickerEdit = false;

  // Shopping Ads
  shoppingAds: GoogleShoppingAd[] = [];
  shoppingAdsFrom = this.dateToString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  shoppingAdsTo = this.dateToString(new Date());
  /** Last applied date range from the API response (for empty-state message) */
  shoppingAdsDateFrom: string | null = null;
  shoppingAdsDateTo: string | null = null;
  isLoadingShoppingAds = false;
  shoppingAdsError: string | null = null;

  // Products drawer (campaign products)
  productsForCampaignId: string | null = null;
  productsForCampaignName: string | null = null;
  productsForCampaign: ShoppingAdProduct[] = [];
  productsDateFrom: string | null = null;
  productsDateTo: string | null = null;
  loadingProducts = false;
  productsError: string | null = null;

  // Create campaign modal (Phase 3)
  showCreateCampaignModal = false;
  createCampaignName = '';
  createCampaignAmountMicros = 1_000_000; // 1 unit default
  createCampaignMerchantId = '';
  createCampaignSubmitting = false;

  // Create ad group modal (Phase 3)
  showCreateAdGroupModal = false;
  createAdGroupCampaignId = '';
  createAdGroupName = '';
  createAdGroupCpcUsd = 0.5;
  createAdGroupCpcMicrosEstimate: number | null = null;
  createAdGroupCpcEstimateLoading = false;
  createAdGroupCpcEstimateError: string | null = null;
  createAdGroupSelectedItemIds: string[] = [];
  createAdGroupSubmitting = false;

  // Product picker for ad group (product feed)
  showProductPicker = false;
  productFeedProducts: ProductFeedItem[] = [];
  productFeedLoading = false;
  productFeedError: string | null = null;
  productSearchFilter = '';

  // Create Shopping ad modal (Phase 3)
  showCreateShoppingAdModal = false;
  createAdCampaignId = '';
  createAdAdGroupId = '';
  adGroupsForSelect: GoogleAdGroup[] = [];
  loadingAdGroupsForSelect = false;
  createAdSubmitting = false;

  constructor(
    private googleAdsService: GoogleAdsService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  private dateToString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  ngOnInit() {
    this.handleOAuthCallback();
    this.loadGoogleStatus();
  }

  loadGoogleStatus() {
    this.isLoadingGoogleStatus = true;
    this.googleAdsService.getConnectionStatus().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.googleConnectionStatus = response.data;
          if (response.data.connected) {
            this.loadOverviewMetrics();
          }
        }
        this.isLoadingGoogleStatus = false;
      },
      error: (error) => {
        console.error('Error loading Google status:', error);
        this.snackBar.open('Failed to load Google connection status', 'Close', { duration: 3000 });
        this.isLoadingGoogleStatus = false;
      },
    });
  }

  connectGoogle() {
    // Call backend with Bearer token (no full-page redirect to backend)
    this.googleAdsService.startOAuth().subscribe({
      next: (response) => {
        const url = response?.data?.redirectUrl;
        // Only redirect to Google's domain, never to our backend
        if (url && (url.startsWith('https://accounts.google.com/') || url.startsWith('https://www.google.com/'))) {
          window.location.href = url;
        } else {
          this.snackBar.open('Could not start Google sign-in', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Failed to get OAuth start URL', err);
        const msg = err?.error?.error || err?.message || 'Failed to connect. Please try again.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
    });
  }

  disconnectGoogle() {
    if (!confirm('Are you sure you want to disconnect your Google account? This will remove all stored credentials.')) {
      return;
    }
    this.googleAdsService.disconnect().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Google account disconnected successfully', 'Close', { duration: 3000 });
          this.googleConnectionStatus = { connected: false };
        }
      },
      error: (error) => {
        console.error('Error disconnecting Google:', error);
        this.snackBar.open('Failed to disconnect Google account', 'Close', { duration: 3000 });
      },
    });
  }

  handleOAuthCallback() {
    this.route.queryParams.subscribe((params) => {
      const channel = params['channel'];
      const status = params['status'];
      const message = params['message'];

      if (channel === 'google' && status) {
        // Remove query params from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });

        if (status === 'connected') {
          this.snackBar.open('Google account connected successfully!', 'Close', { duration: 5000 });
          this.loadGoogleStatus();
        } else if (status === 'error') {
          const errorMsg = message || 'Failed to connect Google account';
          this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
        }
      }
    });
  }

  onGoogleSectionChange(section: 'overview' | 'campaigns' | 'adGroups' | 'ads') {
    this.selectedGoogleSection = section;
    if (section === 'overview') this.loadOverviewMetrics();
    if (section === 'campaigns') this.loadCampaigns();
    if (section === 'adGroups') {
      if (!this.campaigns.length) {
        this.loadCampaigns();
      } else if (!this.selectedAdGroupsCampaignId && this.campaigns.length) {
        this.selectedAdGroupsCampaignId = this.campaigns[0].id;
        this.loadAdGroupsForCampaign(this.selectedAdGroupsCampaignId);
      }
    }
    if (section === 'ads') this.loadShoppingAds();
  }

  loadOverviewMetrics() {
    if (!this.googleConnectionStatus.connected) return;
    this.isLoadingMetrics = true;
    this.metricsError = null;
    this.googleAdsService.getMetrics({ entity: 'campaign', from: this.metricsFrom, to: this.metricsTo }).subscribe({
      next: (res) => {
        if (res.success && res.data) this.metricsData = res.data;
        this.isLoadingMetrics = false;
      },
      error: (err) => {
        this.metricsError = err?.error?.error || err?.message || 'Failed to load metrics';
        this.metricsData = null;
        this.isLoadingMetrics = false;
      },
    });
  }

  loadCampaigns(pageToken?: string) {
    if (!this.googleConnectionStatus.connected) return;
    if (!pageToken) {
      this.isLoadingCampaigns = true;
      this.campaignsError = null;
      this.campaigns = [];
      this.campaignsNextPageToken = null;
    }
    this.googleAdsService.getCampaigns({ limit: 20, pageToken: pageToken || undefined }).subscribe({
      next: (res) => {
        if (res.success && res.data?.data) {
          if (pageToken) {
            this.campaigns = this.campaigns.concat(res.data.data);
          } else {
            this.campaigns = res.data.data;
            // Initialize Ad Groups tab on first load
            if (this.selectedGoogleSection === 'adGroups' && this.campaigns.length && !this.selectedAdGroupsCampaignId) {
              this.selectedAdGroupsCampaignId = this.campaigns[0].id;
              this.loadAdGroupsForCampaign(this.selectedAdGroupsCampaignId);
            }
          }
          this.campaignsNextPageToken = res.data.nextPageToken || null;
        }
        this.isLoadingCampaigns = false;
      },
      error: (err) => {
        this.campaignsError = err?.error?.error || err?.message || 'Failed to load campaigns';
        this.campaigns = [];
        this.isLoadingCampaigns = false;
      },
    });
  }

  loadShoppingAds() {
    if (!this.googleConnectionStatus.connected) return;
    this.isLoadingShoppingAds = true;
    this.shoppingAdsError = null;
    this.shoppingAds = [];
    this.googleAdsService.getShoppingAds({
      limit: 20,
      from: this.shoppingAdsFrom,
      to: this.shoppingAdsTo,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.shoppingAds = res.data.data ?? [];
          this.shoppingAdsDateFrom = res.data.from ?? null;
          this.shoppingAdsDateTo = res.data.to ?? null;
        }
        this.isLoadingShoppingAds = false;
      },
      error: (err) => {
        const msg = err?.error?.error || err?.message || 'Failed to load shopping ads';
        this.shoppingAdsError = msg;
        this.shoppingAds = [];
        this.isLoadingShoppingAds = false;
        console.error('[Google Shopping Ads] Request failed:', {
          message: msg,
          status: err?.status,
          statusText: err?.statusText,
          backendError: err?.error?.error,
          backendDetails: err?.error?.details,
          fullError: err,
        });
      },
    });
  }

  openProducts(campaignId: string, campaignName?: string) {
    if (!campaignId) return;
    this.productsForCampaignId = campaignId;
    this.productsForCampaignName = campaignName || null;
    this.productsForCampaign = [];
    this.productsDateFrom = this.shoppingAdsFrom;
    this.productsDateTo = this.shoppingAdsTo;
    this.loadingProducts = true;
    this.productsError = null;
    this.googleAdsService.getShoppingAdProducts(campaignId, {
      from: this.shoppingAdsFrom,
      to: this.shoppingAdsTo,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.productsForCampaign = res.data.products || [];
          this.productsDateFrom = res.data.from;
          this.productsDateTo = res.data.to;
        }
        this.loadingProducts = false;
      },
      error: (err) => {
        this.productsError = err?.error?.error || err?.message || 'Failed to load products';
        this.productsForCampaign = [];
        this.loadingProducts = false;
      },
    });
  }

  closeProducts() {
    this.productsForCampaignId = null;
    this.productsForCampaignName = null;
    this.productsForCampaign = [];
    this.productsDateFrom = null;
    this.productsDateTo = null;
    this.productsError = null;
  }

  // --- Phase 3: Create modals and Pause/Enable ---

  openCreateCampaignModal() {
    this.showCreateCampaignModal = true;
    this.createCampaignName = '';
    this.createCampaignAmountMicros = 1_000_000;
    this.createCampaignMerchantId = '';
  }

  closeCreateCampaignModal() {
    this.showCreateCampaignModal = false;
    this.createCampaignSubmitting = false;
  }

  submitCreateCampaign() {
    const name = this.createCampaignName?.trim();
    if (!name) {
      this.snackBar.open('Enter campaign name', 'Close', { duration: 3000 });
      return;
    }
    this.createCampaignSubmitting = true;
    this.googleAdsService.createCampaign({
      name,
      amountMicros: this.createCampaignAmountMicros,
      merchantId: this.createCampaignMerchantId?.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.createCampaignSubmitting = false;
        if (res.success) {
          this.snackBar.open('Campaign created', 'Close', { duration: 3000 });
          this.closeCreateCampaignModal();
          this.loadCampaigns();
        } else {
          this.snackBar.open((res as any).error || 'Failed to create campaign', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.createCampaignSubmitting = false;
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to create campaign', 'Close', { duration: 4000 });
      },
    });
  }

  openCreateAdGroupModal() {
    this.showCreateAdGroupModal = true;
    this.createAdGroupCampaignId = this.campaigns[0]?.id ?? '';
    this.createAdGroupName = '';
    this.createAdGroupCpcUsd = 0.5;
    this.createAdGroupCpcMicrosEstimate = null;
    this.createAdGroupCpcEstimateError = null;
    this.createAdGroupSelectedItemIds = [];
    if (!this.campaigns.length) this.loadCampaigns();
  }

  closeCreateAdGroupModal() {
    this.showCreateAdGroupModal = false;
    this.createAdGroupSubmitting = false;
  }

  openProductPicker() {
    this.showProductPicker = true;
    this.productSearchFilter = '';
    if (this.productFeedProducts.length === 0 && !this.productFeedLoading) this.loadProductFeed();
  }

  closeProductPicker() {
    this.showProductPicker = false;
  }

  loadProductFeed() {
    this.productFeedLoading = true;
    this.productFeedError = null;
    this.googleAdsService.getProductFeed().subscribe({
      next: (res: { success?: boolean; data?: { products?: ProductFeedItem[] }; error?: string }) => {
        this.productFeedLoading = false;
        if (res.success && res.data?.products) {
          this.productFeedProducts = res.data.products;
        } else {
          this.productFeedProducts = [];
          this.productFeedError = res?.error || 'No products returned';
        }
      },
      error: (err: { error?: { error?: string }; message?: string }) => {
        this.productFeedLoading = false;
        this.productFeedProducts = [];
        this.productFeedError = err?.error?.error || err?.message || 'Failed to load product feed';
      },
    });
  }

  get filteredProductsForPicker(): ProductFeedItem[] {
    const q = (this.productSearchFilter || '').toLowerCase().trim();
    if (!q) return this.productFeedProducts;
    return this.productFeedProducts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.productType || '').toLowerCase().includes(q) ||
        (p.itemId || '').toLowerCase().includes(q)
    );
  }

  toggleProductSelection(itemId: string) {
    const idx = this.createAdGroupSelectedItemIds.indexOf(itemId);
    if (idx === -1) this.createAdGroupSelectedItemIds = [...this.createAdGroupSelectedItemIds, itemId];
    else this.createAdGroupSelectedItemIds = this.createAdGroupSelectedItemIds.filter((id) => id !== itemId);
  }

  isProductSelected(itemId: string): boolean {
    return this.createAdGroupSelectedItemIds.includes(itemId);
  }

  selectAllProductsInPicker() {
    const list = this.filteredProductsForPicker.map((p) => p.itemId);
    this.createAdGroupSelectedItemIds = [...new Set([...this.createAdGroupSelectedItemIds, ...list])];
  }

  clearProductSelection() {
    this.createAdGroupSelectedItemIds = [];
  }

  applyProductSelection() {
    this.showProductPicker = false;
  }

  onCreateAdGroupCpcUsdChange() {
    const amount = Number(this.createAdGroupCpcUsd);
    if (!amount || amount <= 0) {
      this.createAdGroupCpcMicrosEstimate = null;
      this.createAdGroupCpcEstimateError = null;
      return;
    }
    this.createAdGroupCpcEstimateLoading = true;
    this.createAdGroupCpcEstimateError = null;
    this.googleAdsService.getCpcEstimate(amount).subscribe({
      next: (res) => {
        this.createAdGroupCpcEstimateLoading = false;
        if (res.success && res.data) {
          this.createAdGroupCpcMicrosEstimate = res.data.micros ?? null;
        } else {
          this.createAdGroupCpcMicrosEstimate = null;
          this.createAdGroupCpcEstimateError = (res as any)?.error || 'Failed to estimate CPC';
        }
      },
      error: (err) => {
        this.createAdGroupCpcEstimateLoading = false;
        this.createAdGroupCpcMicrosEstimate = null;
        this.createAdGroupCpcEstimateError = err?.error?.error || err?.message || 'Failed to estimate CPC';
      },
    });
  }

  openEditAdGroupModal(ag: GoogleAdGroup) {
    this.showEditAdGroupModal = true;
    this.editAdGroupId = ag.id;
    this.editAdGroupName = ag.name || '';
    this.editAdGroupCpcUsd = 0.5;
    this.editAdGroupCpcMicrosEstimate = null;
    this.editAdGroupCpcEstimateError = null;
    this.editAdGroupSelectedItemIds = [];

    // Ensure feed is loaded
    if (this.productFeedProducts.length === 0 && !this.productFeedLoading) {
      this.loadProductFeed();
    }

    // Load existing products and CPC for this ad group
    this.googleAdsService.getAdGroupProducts(ag.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.editAdGroupSelectedItemIds = res.data.productItemIds || [];
          if (res.data.cpcBidMicros != null) {
            this.editAdGroupCpcMicrosEstimate = res.data.cpcBidMicros;
            this.editAdGroupCpcUsd = (res.data.cpcBidMicros || 0) / 1_000_000;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load ad group products', err);
      },
    });
  }

  closeEditAdGroupModal() {
    this.showEditAdGroupModal = false;
    this.editAdGroupSubmitting = false;
  }

  openProductPickerEdit() {
    this.showProductPickerEdit = true;
    this.productSearchFilter = '';
    if (this.productFeedProducts.length === 0 && !this.productFeedLoading) this.loadProductFeed();
  }

  closeProductPickerEdit() {
    this.showProductPickerEdit = false;
  }

  toggleProductSelectionEdit(itemId: string) {
    const idx = this.editAdGroupSelectedItemIds.indexOf(itemId);
    if (idx === -1) this.editAdGroupSelectedItemIds = [...this.editAdGroupSelectedItemIds, itemId];
    else this.editAdGroupSelectedItemIds = this.editAdGroupSelectedItemIds.filter((id) => id !== itemId);
  }

  isProductSelectedEdit(itemId: string): boolean {
    return this.editAdGroupSelectedItemIds.includes(itemId);
  }

  selectAllProductsInPickerEdit() {
    const list = this.filteredProductsForPicker.map((p) => p.itemId);
    this.editAdGroupSelectedItemIds = [...new Set([...this.editAdGroupSelectedItemIds, ...list])];
  }

  clearProductSelectionEdit() {
    this.editAdGroupSelectedItemIds = [];
  }

  applyProductSelectionEdit() {
    this.showProductPickerEdit = false;
  }

  onEditAdGroupCpcUsdChange() {
    const amount = Number(this.editAdGroupCpcUsd);
    if (!amount || amount <= 0) {
      this.editAdGroupCpcMicrosEstimate = null;
      this.editAdGroupCpcEstimateError = null;
      return;
    }
    this.editAdGroupCpcEstimateLoading = true;
    this.editAdGroupCpcEstimateError = null;
    this.googleAdsService.getCpcEstimate(amount).subscribe({
      next: (res) => {
        this.editAdGroupCpcEstimateLoading = false;
        if (res.success && res.data) {
          this.editAdGroupCpcMicrosEstimate = res.data.micros ?? null;
        } else {
          this.editAdGroupCpcMicrosEstimate = null;
          this.editAdGroupCpcEstimateError = (res as any)?.error || 'Failed to estimate CPC';
        }
      },
      error: (err) => {
        this.editAdGroupCpcEstimateLoading = false;
        this.editAdGroupCpcMicrosEstimate = null;
        this.editAdGroupCpcEstimateError = err?.error?.error || err?.message || 'Failed to estimate CPC';
      },
    });
  }

  submitEditAdGroup() {
    const id = this.editAdGroupId;
    const name = this.editAdGroupName?.trim();
    if (!id || !name) {
      this.snackBar.open('Select ad group and enter name', 'Close', { duration: 3000 });
      return;
    }
    this.editAdGroupSubmitting = true;
    let cpcBidMicros = this.editAdGroupCpcMicrosEstimate ?? Math.round((this.editAdGroupCpcUsd || 0) * 1_000_000);
    if (!cpcBidMicros || cpcBidMicros <= 0) cpcBidMicros = 1_000_000;
    this.googleAdsService
      .updateAdGroupProducts(id, {
        productItemIds: this.editAdGroupSelectedItemIds,
        cpcBidMicros,
        name,
      })
      .subscribe({
        next: (res) => {
          this.editAdGroupSubmitting = false;
          if (res.success) {
            this.snackBar.open('Ad group updated', 'Close', { duration: 3000 });
            this.closeEditAdGroupModal();
            if (this.selectedAdGroupsCampaignId) {
              this.loadAdGroupsForCampaign(this.selectedAdGroupsCampaignId);
            }
          } else {
            this.snackBar.open((res as any).error || 'Failed to update ad group', 'Close', { duration: 4000 });
          }
        },
        error: (err) => {
          this.editAdGroupSubmitting = false;
          this.snackBar.open(err?.error?.error || err?.message || 'Failed to update ad group', 'Close', {
            duration: 4000,
          });
        },
      });
  }

  submitCreateAdGroup() {
    const campaignId = this.createAdGroupCampaignId?.trim();
    const name = this.createAdGroupName?.trim();
    if (!campaignId || !name) {
      this.snackBar.open('Select campaign and enter ad group name', 'Close', { duration: 3000 });
      return;
    }
    this.createAdGroupSubmitting = true;
    let cpcBidMicros = this.createAdGroupCpcMicrosEstimate ?? Math.round((this.createAdGroupCpcUsd || 0) * 1_000_000);
    if (!cpcBidMicros || cpcBidMicros <= 0) cpcBidMicros = 1_000_000;
    const body: { campaignId: string; name: string; productItemIds?: string[]; cpcBidMicros?: number } = {
      campaignId,
      name,
      cpcBidMicros,
    };
    if (this.createAdGroupSelectedItemIds.length > 0) body.productItemIds = this.createAdGroupSelectedItemIds;
    this.googleAdsService.createAdGroup(body).subscribe({
      next: (res) => {
        this.createAdGroupSubmitting = false;
        if (res.success) {
          this.snackBar.open('Ad group created', 'Close', { duration: 3000 });
          this.closeCreateAdGroupModal();
          this.loadCampaigns();
        } else {
          this.snackBar.open((res as any).error || 'Failed to create ad group', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.createAdGroupSubmitting = false;
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to create ad group', 'Close', { duration: 4000 });
      },
    });
  }

  // --- Ad Groups tab ---

  loadAdGroupsForCampaign(campaignId: string | null, pageToken?: string) {
    if (!this.googleConnectionStatus.connected || !campaignId) return;
    if (!pageToken) {
      this.adGroupsForCampaign = [];
      this.adGroupsForCampaignError = null;
      this.adGroupsForCampaignNextPageToken = null;
      this.isLoadingAdGroupsForCampaign = true;
    }
    this.googleAdsService.getAdGroups(campaignId, { limit: 50, pageToken: pageToken || undefined }).subscribe({
      next: (res) => {
        if (res.success && res.data?.data) {
          if (pageToken) {
            this.adGroupsForCampaign = this.adGroupsForCampaign.concat(res.data.data);
          } else {
            this.adGroupsForCampaign = res.data.data;
          }
          this.adGroupsForCampaignNextPageToken = res.data.nextPageToken || null;
        }
        this.isLoadingAdGroupsForCampaign = false;
      },
      error: (err) => {
        this.adGroupsForCampaignError = err?.error?.error || err?.message || 'Failed to load ad groups';
        this.adGroupsForCampaign = [];
        this.isLoadingAdGroupsForCampaign = false;
      },
    });
  }

  openCreateShoppingAdModal() {
    this.showCreateShoppingAdModal = true;
    this.createAdCampaignId = this.campaigns[0]?.id ?? '';
    this.createAdAdGroupId = '';
    this.adGroupsForSelect = [];
    if (this.createAdCampaignId) this.loadAdGroupsForSelect(this.createAdCampaignId);
    if (!this.campaigns.length) this.loadCampaigns();
  }

  loadAdGroupsForSelect(campaignId: string) {
    if (!campaignId) {
      this.adGroupsForSelect = [];
      return;
    }
    this.loadingAdGroupsForSelect = true;
    this.googleAdsService.getAdGroups(campaignId, { limit: 100 }).subscribe({
      next: (res) => {
        this.adGroupsForSelect = res.success && res.data?.data ? res.data.data : [];
        this.loadingAdGroupsForSelect = false;
        if (!this.createAdAdGroupId && this.adGroupsForSelect.length) {
          this.createAdAdGroupId = this.adGroupsForSelect[0].id;
        }
      },
      error: () => {
        this.adGroupsForSelect = [];
        this.loadingAdGroupsForSelect = false;
      },
    });
  }

  onCreateAdCampaignChange() {
    this.createAdAdGroupId = '';
    this.loadAdGroupsForSelect(this.createAdCampaignId);
  }

  closeCreateShoppingAdModal() {
    this.showCreateShoppingAdModal = false;
    this.createAdSubmitting = false;
  }

  submitCreateShoppingAd() {
    const adGroupId = this.createAdAdGroupId?.trim();
    if (!adGroupId) {
      this.snackBar.open('Select an ad group', 'Close', { duration: 3000 });
      return;
    }
    this.createAdSubmitting = true;
    this.googleAdsService.createShoppingAd({ adGroupId }).subscribe({
      next: (res) => {
        this.createAdSubmitting = false;
        if (res.success) {
          this.snackBar.open('Shopping ad created', 'Close', { duration: 3000 });
          this.closeCreateShoppingAdModal();
          this.loadShoppingAds();
        } else {
          this.snackBar.open((res as any).error || 'Failed to create Shopping ad', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.createAdSubmitting = false;
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to create Shopping ad', 'Close', { duration: 4000 });
      },
    });
  }

  pauseCampaign(c: GoogleCampaign) {
    if (!c?.id) return;
    this.googleAdsService.pauseCampaign(c.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Campaign paused', 'Close', { duration: 2000 });
          c.status = 'PAUSED';
        } else {
          this.snackBar.open((res as any).error || 'Failed to pause', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to pause campaign', 'Close', { duration: 3000 });
      },
    });
  }

  enableCampaign(c: GoogleCampaign) {
    if (!c?.id) return;
    this.googleAdsService.enableCampaign(c.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Campaign enabled', 'Close', { duration: 2000 });
          c.status = 'ENABLED';
        } else {
          this.snackBar.open((res as any).error || 'Failed to enable', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to enable campaign', 'Close', { duration: 3000 });
      },
    });
  }

  pauseShoppingAd(a: GoogleShoppingAd) {
    if (!a?.id || !a?.adGroupId) return;
    this.googleAdsService.pauseShoppingAd(a.id, a.adGroupId).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Ad paused', 'Close', { duration: 2000 });
          a.status = 'PAUSED';
        } else {
          this.snackBar.open((res as any).error || 'Failed to pause ad', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to pause ad', 'Close', { duration: 3000 });
      },
    });
  }

  enableShoppingAd(a: GoogleShoppingAd) {
    if (!a?.id || !a?.adGroupId) return;
    this.googleAdsService.enableShoppingAd(a.id, a.adGroupId).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Ad enabled', 'Close', { duration: 2000 });
          a.status = 'ENABLED';
        } else {
          this.snackBar.open((res as any).error || 'Failed to enable ad', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to enable ad', 'Close', { duration: 3000 });
      },
    });
  }

  /** Cost in currency units (micros to units). Accepts number or string (from API). */
  costFromMicros(micros: number | string | undefined): string {
    if (micros == null) return '0';
    return (Number(micros) / 1_000_000).toFixed(2);
  }
}
