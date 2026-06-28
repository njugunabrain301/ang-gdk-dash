import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  GoogleAdsService,
  GoogleConnectionStatus,
  GoogleAdsAccountOption,
  GoogleCampaign,
  GoogleAdGroup,
  GoogleShoppingAd,
  MetricsResponse,
  ShoppingAdProduct,
  ProductFeedItem,
  ShoppingAdsResponse,
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
    MatSelectModule,
    MatFormFieldModule,
    RouterModule,
  ],
  templateUrl: './google.component.html',
  styleUrls: ['./google.component.css'],
})
export class GoogleComponent implements OnInit {
  selectedGoogleSection: 'overview' | 'campaigns' | 'adGroups' | 'ads' = 'overview';
  googleConnectionStatus: GoogleConnectionStatus = { connected: false };
  isLoadingGoogleStatus = false;

  // Account picker
  showAccountPicker = false;
  adsAccounts: GoogleAdsAccountOption[] = [];
  selectedAdsAccountId: string | null = null;
  isLoadingAdsAccounts = false;
  isSelectingAdsAccount = false;
  adsAccountsError: string | null = null;

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
  /** Performance = metrics + dates; All ads = inventory (no date filter on API) */
  shoppingAdsMode: 'metrics' | 'inventory' = 'metrics';
  shoppingAdsPageSize = 10;
  shoppingAdsFrom = this.dateToString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  shoppingAdsTo = this.dateToString(new Date());
  /** Last applied date range from the API response (for empty-state message) */
  shoppingAdsDateFrom: string | null = null;
  shoppingAdsDateTo: string | null = null;
  isLoadingShoppingAds = false;
  shoppingAdsError: string | null = null;
  /** Pagination: token sent to Google for current page */
  shoppingAdsRequestPageToken: string | undefined = undefined;
  shoppingAdsNextPageToken: string | null = null;
  /** Stack of prior request tokens for Previous (undefined = first page) */
  shoppingAdsTokenTrail: (string | undefined)[] = [];
  /** Buffered ads from Google (metrics and inventory); UI shows `shoppingAdsPageSize` rows at a time */
  shoppingAdsMetricsBuffer: GoogleShoppingAd[] = [];
  /** First row index of current view (handles partial last page before more API data) */
  shoppingAdsMetricsListStart = 0;
  /** Stack of list starts before each Next (for Previous within buffered data) */
  shoppingAdsMetricsStartStack: number[] = [];

  // Products drawer (scoped to the row’s Shopping ad group)
  productsDrawerAdGroupId: string | null = null;
  productsDrawerAdGroupName: string | null = null;
  productsDrawerCampaignName: string | null = null;
  productsForCampaign: ShoppingAdProduct[] = [];
  productsForCampaignMode: 'inventory' | 'metrics' | null = null;
  productsDateFrom: string | null = null;
  productsDateTo: string | null = null;
  loadingProducts = false;
  productsError: string | null = null;

  // Create campaign modal (Phase 3)
  showCreateCampaignModal = false;
  createCampaignName = '';
  /** Daily budget in USD (converted to micros on submit). */
  createCampaignDailyBudgetUsd = 1;
  createCampaignMerchantId = '';
  createCampaignSubmitting = false;

  showEditCampaignBudgetModal = false;
  editBudgetCampaignId = '';
  editBudgetCampaignName = '';
  editBudgetAmountMicros = 1_000_000;
  editBudgetSubmitting = false;

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
          if (response.data.needsCustomerSelection) {
            this.openAccountSelection();
          } else if (response.data.connected) {
            this.showAccountPicker = false;
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
          this.showAccountPicker = false;
          this.adsAccounts = [];
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

  private needsAccountSelection(): boolean {
    return !!(
      this.googleConnectionStatus.connected &&
      this.googleConnectionStatus.needsCustomerSelection
    );
  }

  openAccountSelection() {
    this.showAccountPicker = true;
    this.adsAccountsError = null;
    this.selectedAdsAccountId = null;
    this.isLoadingAdsAccounts = true;
    this.googleAdsService.getAdsAccounts().subscribe({
      next: (res) => {
        this.isLoadingAdsAccounts = false;
        if (res.success && res.data?.accounts) {
          this.adsAccounts = res.data.accounts;
          if (this.adsAccounts.length === 1) {
            this.selectedAdsAccountId = this.adsAccounts[0].id;
          }
          if (this.adsAccounts.length === 0) {
            this.adsAccountsError = 'No Google Ads accounts found for this connection.';
          }
        } else {
          this.adsAccounts = [];
          this.adsAccountsError = res?.error || 'Failed to load Google Ads accounts';
        }
      },
      error: (err) => {
        this.isLoadingAdsAccounts = false;
        this.adsAccounts = [];
        this.adsAccountsError =
          err?.error?.error || err?.message || 'Failed to load Google Ads accounts';
      },
    });
  }

  cancelAccountSelection() {
    if (this.needsAccountSelection()) return;
    this.showAccountPicker = false;
    this.adsAccountsError = null;
  }

  confirmAdsAccountSelection() {
    const customerId = this.selectedAdsAccountId?.trim();
    if (!customerId) {
      this.snackBar.open('Select a Google Ads account', 'Close', { duration: 3000 });
      return;
    }
    this.isSelectingAdsAccount = true;
    this.googleAdsService.selectAdsAccount(customerId).subscribe({
      next: (res) => {
        this.isSelectingAdsAccount = false;
        if (res.success && res.data) {
          this.googleConnectionStatus = res.data;
          this.showAccountPicker = false;
          this.snackBar.open('Google Ads account selected', 'Close', { duration: 3000 });
          this.loadOverviewMetrics();
        } else {
          this.snackBar.open(res?.error || 'Failed to select account', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.isSelectingAdsAccount = false;
        this.snackBar.open(
          err?.error?.error || err?.message || 'Failed to select account',
          'Close',
          { duration: 4000 },
        );
      },
    });
  }

  formatCustomerIdDisplay(customerId: string | null | undefined): string {
    if (!customerId) return '';
    const digits = String(customerId).replace(/\D/g, '');
    if (digits.length !== 10) return digits;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
    if (section === 'ads') this.loadShoppingAds(true);
  }

  loadOverviewMetrics() {
    if (!this.googleConnectionStatus.connected || this.needsAccountSelection()) return;
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
    if (!this.googleConnectionStatus.connected || this.needsAccountSelection()) return;
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

  private shoppingAdsRowKey(a: GoogleShoppingAd): string {
    return `${a.campaignId ?? ''}|${a.adGroupId ?? ''}|${a.id ?? ''}`;
  }

  private mergeDedupeShoppingAds(existing: GoogleShoppingAd[], incoming: GoogleShoppingAd[]): GoogleShoppingAd[] {
    const m = new Map<string, GoogleShoppingAd>();
    for (const a of existing) {
      m.set(this.shoppingAdsRowKey(a), { ...a });
    }
    for (const a of incoming) {
      const k = this.shoppingAdsRowKey(a);
      if (!m.has(k)) m.set(k, { ...a });
    }
    return Array.from(m.values());
  }

  private applyMetricsShoppingAdsPage() {
    const size = this.shoppingAdsPageSize;
    const start = this.shoppingAdsMetricsListStart;
    this.shoppingAds = this.shoppingAdsMetricsBuffer.slice(start, start + size);
  }

  private readShoppingAdsNextToken(payload: ShoppingAdsResponse): string | null {
    const anyPayload = payload as { nextPageToken?: string; next_page_token?: string };
    const t = anyPayload?.nextPageToken ?? anyPayload?.next_page_token ?? null;
    return typeof t === 'string' && t.length > 0 ? t : null;
  }

  /**
   * @param reset true: first API page (clear pagination trail and buffer)
   * @param append true: merge next Google page into buffer and advance the visible slice (after nextPageToken)
   */
  loadShoppingAds(reset = false, append = false) {
    if (!this.googleConnectionStatus.connected || this.needsAccountSelection()) return;
    if (reset) {
      this.shoppingAdsTokenTrail = [];
      this.shoppingAdsRequestPageToken = undefined;
      this.shoppingAdsMetricsBuffer = [];
      this.shoppingAdsMetricsListStart = 0;
      this.shoppingAdsMetricsStartStack = [];
    }
    this.isLoadingShoppingAds = true;
    this.shoppingAdsError = null;
    if (!append) {
      this.shoppingAds = [];
    }
    this.googleAdsService
      .getShoppingAds({
        mode: this.shoppingAdsMode,
        pageToken: this.shoppingAdsRequestPageToken,
        from: this.shoppingAdsMode === 'metrics' ? this.shoppingAdsFrom : undefined,
        to: this.shoppingAdsMode === 'metrics' ? this.shoppingAdsTo : undefined,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const payload = res.data;
            const incoming = payload.data ?? [];
            this.shoppingAdsDateFrom = payload.from ?? null;
            this.shoppingAdsDateTo = payload.to ?? null;
            this.shoppingAdsNextPageToken = this.readShoppingAdsNextToken(payload);

            if (append) {
              const start = this.shoppingAdsMetricsListStart;
              const prevLen = this.shoppingAdsMetricsBuffer.length;
              this.shoppingAdsMetricsBuffer = this.mergeDedupeShoppingAds(this.shoppingAdsMetricsBuffer, incoming);
              const span = Math.min(this.shoppingAdsPageSize, Math.max(0, prevLen - start));
              this.shoppingAdsMetricsListStart = start + span;
              this.applyMetricsShoppingAdsPage();
            } else {
              this.shoppingAdsMetricsBuffer = [...incoming];
              this.shoppingAdsMetricsListStart = 0;
              this.applyMetricsShoppingAdsPage();
            }
          } else {
            if (!append) {
              this.shoppingAds = [];
              this.shoppingAdsMetricsBuffer = [];
              this.shoppingAdsMetricsListStart = 0;
            }
            this.shoppingAdsNextPageToken = null;
          }
          this.isLoadingShoppingAds = false;
        },
        error: (err) => {
          const msg = err?.error?.error || err?.message || 'Failed to load shopping ads';
          this.shoppingAdsError = msg;
          if (!append) {
            this.shoppingAds = [];
            this.shoppingAdsMetricsBuffer = [];
            this.shoppingAdsMetricsListStart = 0;
            this.shoppingAdsMetricsStartStack = [];
          } else {
            this.shoppingAdsMetricsStartStack.pop();
          }
          this.shoppingAdsNextPageToken = null;
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

  onShoppingAdsModeChange() {
    this.loadShoppingAds(true);
  }

  setShoppingAdsMode(m: 'metrics' | 'inventory') {
    if (this.shoppingAdsMode === m) return;
    this.shoppingAdsMode = m;
    this.onShoppingAdsModeChange();
  }

  shoppingAdsNextPage() {
    if (this.isLoadingShoppingAds) return;
    const buf = this.shoppingAdsMetricsBuffer;
    const size = this.shoppingAdsPageSize;
    const start = this.shoppingAdsMetricsListStart;
    const span = Math.min(size, Math.max(0, buf.length - start));
    const nextStart = start + span;
    if (nextStart < buf.length) {
      this.shoppingAdsMetricsStartStack.push(start);
      this.shoppingAdsMetricsListStart = nextStart;
      this.applyMetricsShoppingAdsPage();
      return;
    }
    if (!this.shoppingAdsNextPageToken) return;
    this.shoppingAdsMetricsStartStack.push(this.shoppingAdsMetricsListStart);
    this.shoppingAdsTokenTrail.push(this.shoppingAdsRequestPageToken);
    this.shoppingAdsRequestPageToken = this.shoppingAdsNextPageToken;
    this.loadShoppingAds(false, true);
  }

  shoppingAdsPrevPage() {
    if (this.isLoadingShoppingAds) return;
    if (this.shoppingAdsMetricsStartStack.length > 0) {
      this.shoppingAdsMetricsListStart = this.shoppingAdsMetricsStartStack.pop()!;
      this.applyMetricsShoppingAdsPage();
      return;
    }
    if (this.shoppingAdsTokenTrail.length === 0) return;
    const prev = this.shoppingAdsTokenTrail.pop();
    this.shoppingAdsRequestPageToken = prev;
    this.shoppingAdsMetricsStartStack = [];
    this.loadShoppingAds(false, false);
  }

  shoppingAdsCanGoPrev(): boolean {
    if (this.shoppingAdsMetricsStartStack.length > 0) return true;
    return this.shoppingAdsTokenTrail.length > 0;
  }

  shoppingAdsCanGoNext(): boolean {
    const buf = this.shoppingAdsMetricsBuffer;
    const size = this.shoppingAdsPageSize;
    const start = this.shoppingAdsMetricsListStart;
    const span = Math.min(size, Math.max(0, buf.length - start));
    if (start + span < buf.length) return true;
    return !!this.shoppingAdsNextPageToken;
  }

  openProducts(ad: GoogleShoppingAd) {
    const adGroupId = ad.adGroupId != null && String(ad.adGroupId).trim() !== '' ? String(ad.adGroupId).trim() : '';
    if (!adGroupId) {
      this.snackBar.open('This ad has no ad group id; cannot list products.', 'Close', { duration: 4000 });
      return;
    }
    this.productsDrawerAdGroupId = adGroupId;
    this.productsDrawerAdGroupName = ad.adGroupName ?? null;
    this.productsDrawerCampaignName = ad.campaignName ?? null;
    this.productsForCampaign = [];
    this.productsForCampaignMode = null;
    this.productsDateFrom = null;
    this.productsDateTo = null;
    this.loadingProducts = true;
    this.productsError = null;
    this.googleAdsService
      .getShoppingAdProducts({
        adGroupId,
        campaignId:
          ad.campaignId != null && String(ad.campaignId).trim() !== '' ? String(ad.campaignId).trim() : undefined,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.productsForCampaign = res.data.products || [];
            this.productsForCampaignMode = res.data.mode ?? 'inventory';
            if (res.data.mode === 'metrics') {
              this.productsDateFrom = res.data.from ?? null;
              this.productsDateTo = res.data.to ?? null;
            } else {
              this.productsDateFrom = null;
              this.productsDateTo = null;
            }
          }
          this.loadingProducts = false;
        },
        error: (err) => {
          this.productsError = err?.error?.error || err?.message || 'Failed to load products';
          this.productsForCampaign = [];
          this.productsForCampaignMode = null;
          this.loadingProducts = false;
        },
      });
  }

  closeProducts() {
    this.productsDrawerAdGroupId = null;
    this.productsDrawerAdGroupName = null;
    this.productsDrawerCampaignName = null;
    this.productsForCampaign = [];
    this.productsForCampaignMode = null;
    this.productsDateFrom = null;
    this.productsDateTo = null;
    this.productsError = null;
  }

  // --- Phase 3: Create modals and Pause/Enable ---

  openCreateCampaignModal() {
    this.showCreateCampaignModal = true;
    this.createCampaignName = '';
    this.createCampaignDailyBudgetUsd = 1;
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
    const budgetUsd = Number(this.createCampaignDailyBudgetUsd);
    if (Number.isNaN(budgetUsd) || budgetUsd <= 0) {
      this.snackBar.open('Enter a valid daily budget (USD)', 'Close', { duration: 3000 });
      return;
    }
    const amountMicros = Math.round(budgetUsd * 1_000_000);
    this.createCampaignSubmitting = true;
    this.googleAdsService.createCampaign({
      name,
      amountMicros,
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

  openEditCampaignBudget(c: GoogleCampaign) {
    if (!c?.id) return;
    this.showEditCampaignBudgetModal = true;
    this.editBudgetCampaignId = c.id;
    this.editBudgetCampaignName = c.name || c.id;
    const cur = c.budgetAmountMicros != null ? Number(c.budgetAmountMicros) : NaN;
    this.editBudgetAmountMicros = !Number.isNaN(cur) && cur >= 0 ? cur : 1_000_000;
  }

  closeEditCampaignBudgetModal() {
    this.showEditCampaignBudgetModal = false;
    this.editBudgetSubmitting = false;
  }

  submitEditCampaignBudget() {
    const id = this.editBudgetCampaignId?.trim();
    if (!id) return;
    const micros = Number(this.editBudgetAmountMicros);
    if (Number.isNaN(micros) || micros < 0) {
      this.snackBar.open('Enter a valid budget (micros)', 'Close', { duration: 3000 });
      return;
    }
    this.editBudgetSubmitting = true;
    this.googleAdsService.updateCampaignBudget(id, micros).subscribe({
      next: (res) => {
        this.editBudgetSubmitting = false;
        if (res.success) {
          this.snackBar.open('Budget updated', 'Close', { duration: 3000 });
          this.closeEditCampaignBudgetModal();
          this.loadCampaigns();
        } else {
          this.snackBar.open((res as any).error || 'Failed to update budget', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.editBudgetSubmitting = false;
        this.snackBar.open(err?.error?.error || err?.message || 'Failed to update budget', 'Close', { duration: 4000 });
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
    if (!this.googleConnectionStatus.connected || this.needsAccountSelection() || !campaignId) return;
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
          this.loadShoppingAds(true);
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
  costFromMicros(micros: number | string | null | undefined): string {
    if (micros == null) return '0';
    return (Number(micros) / 1_000_000).toFixed(2);
  }
}
