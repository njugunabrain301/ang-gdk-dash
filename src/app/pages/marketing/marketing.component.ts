import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChangeDetectorRef } from '@angular/core';
import { MarketingService, PriorityItem, CreateAdRequest, AdWithInsights } from '../../services/marketing.service';
import { ProductsService } from '../../services/products.service';
import { ScheduleService, ScheduleData } from '../../services/schedule.service';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css'],
})
export class MarketingComponent implements OnInit {
  selectedChannel: 'overview' | 'meta' | 'twitter' | 'tiktok' | 'youtube' | 'google' = 'overview';
  selectedMetaSection: 'posts' | 'ads' = 'posts';
  
  // Priority items data (using facebook as default)
  priorityItems: PriorityItem[] = [];
  isLoadingPriorityItems = false;
  
  // Product selection
  allProducts: any[] = [];
  selectedProductId: string = '';
  isLoadingProducts = false;

  // Schedule data
  schedule: ScheduleData = {
    timezone: 'Africa/Nairobi',
    facebookPostTimes: [],
    facebookPostsMadeToday: 0,
    facebookNextRunAt: null,
    instagramPostTimes: [],
    instagramPostsMadeToday: 0,
    instagramNextRunAt: null,
    lastRunAt: null,
    status: 'paused',
  };

  // Form fields for time inputs
  facebookPostTime1: string = '';
  facebookPostTime2: string = '';
  instagramPostTime1: string = '';
  instagramPostTime2: string = '';

  // Original state for comparison
  private originalSchedule: ScheduleData | null = null;
  isLoadingSchedule = false;
  isInitializingSchedule = true;

  // Ad creation form data
  adForm: CreateAdRequest = {
    campaign: {
      name: '',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      special_ad_categories: ['NONE'],
      buying_type: 'AUCTION',
      is_adset_budget_sharing_enabled: false,
    },
    adset: {
      name: '',
      daily_budget: 0,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: {
        age_min: 18,
        age_max: 65,
        genders: [1, 2],
        geo_locations: {
          countries: [],
        },
        targeting_automation: {
          advantage_audience: 0,
        },
      },
      status: 'PAUSED',
      promoted_object: {
        custom_event_type: 'PURCHASE',
      },
    },
    ads: [
      {
        name: '',
        status: 'PAUSED',
        creative: {
          link: '',
          message: '',
          headline: '',
          description: '',
          call_to_action: 'SHOP_NOW',
          image_url: '',
        },
      },
    ],
  };

  isLoadingAd = false;
  availableCountries = ['US', 'KE', 'TZ', 'UG', 'GB', 'CA', 'AU', 'ZA'];
  // Image files for create-ad creatives, aligned by index with adForm.ads
  createAdImageFiles: (File | null)[] = [null];
  
  // Ads list
  adsList: AdWithInsights[] = [];
  isLoadingAds = false;
  adsPaging: any = null;
  selectedDatePreset: string = 'today';
  datePresetOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_3d', label: 'Last 3 Days' },
    { value: 'last_7d', label: 'Last 7 Days' },
    { value: 'last_14d', label: 'Last 14 Days' },
    { value: 'last_30d', label: 'Last 30 Days' },
    { value: 'last_90d', label: 'Last 90 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'maximum', label: 'Maximum' },
  ];

  // Overview statistics
  overviewStats = {
    totalSpend: 0,
    activeAds: 0,
    totalAds: 0,
    clicks: 0,
  };
  isLoadingOverview = false;
  displayedColumns: string[] = ['name', 'status', 'effective_status', 'spend', 'impressions', 'clicks', 'ctr', 'cpc', 'cpm', 'actions'];
  isCreateAdModalOpen = false;
  isUpdateAdModalOpen = false;
  isViewAdModalOpen = false;
  selectedAdForUpdate: AdWithInsights | null = null;
  selectedAdForView: AdWithInsights | null = null;
  updateAdForm: { 
    name: string; 
    status: string;
    headline: string;
    link: string;
    description: string;
    message: string;
    call_to_action: string;
    daily_budget: number | null;
  } = { 
    name: '', 
    status: 'PAUSED',
    headline: '',
    link: '',
    description: '',
    message: '',
    call_to_action: '',
    daily_budget: null,
  };
  viewAdForm: { 
    name: string; 
    status: string;
    headline: string;
    link: string;
    description: string;
    message: string;
    call_to_action: string;
    daily_budget: number | null;
  } = { 
    name: '', 
    status: 'PAUSED',
    headline: '',
    link: '',
    description: '',
    message: '',
    call_to_action: '',
    daily_budget: null,
  };
  // Daily budget in shillings for create form
  createAdDailyBudgetShillings: number = 0;
  // Daily budget in shillings for update form
  updateAdDailyBudgetShillings: number = 0;
  isUpdatingAd = false;
  isLoadingCreative = false;
  creativeImageUrl: string | null = null;
  selectedImageFile: File | null = null;
  selectedAdsetId: string | null = null;
  isLoadingViewCreative = false;
  viewCreativeImageUrl: string | null = null;
  callToActionOptions = [
    'SHOP_NOW',
    'LEARN_MORE',
    'SIGN_UP',
    'DOWNLOAD',
    'BOOK_TRAVEL',
    'CONTACT_US',
  ];
  objectiveOptions = [
    'OUTCOME_TRAFFIC',
    'OUTCOME_ENGAGEMENT',
    'OUTCOME_AWARENESS',
    'OUTCOME_LEADS',
    'OUTCOME_SALES',
    'OUTCOME_APP_PROMOTION',
  ];

  // Mapping of campaign objectives to valid optimization goals
  // Based on Facebook Marketing API valid optimization goals list:
  // ONE, APP_INSTALLS, AD_RECALL_LIFT, ENGAGED_USERS, EVENT_RESPONSES, IMPRESSIONS,
  // LEAD_GENERATION, QUALITY_LEAD, LINK_CLICKS, OFFSITE_CONVERSIONS, PAGE_LIKES,
  // POST_ENGAGEMENT, QUALITY_CALL, REACH, LANDING_PAGE_VIEWS, VISIT_INSTAGRAM_PROFILE,
  // ENGAGED_PAGE_VIEWS, VALUE, THRUPLAY, DERIVED_EVENTS, APP_INSTALLS_AND_OFFSITE_CONVERSIONS,
  // CONVERSATIONS, IN_APP_VALUE, MESSAGING_PURCHASE_CONVERSION, SUBSCRIBERS, REMINDERS_SET,
  // MEANINGFUL_CALL_ATTEMPT, PROFILE_VISIT, PROFILE_AND_PAGE_ENGAGEMENT, ADVERTISER_SILOED_VALUE,
  // AUTOMATIC_OBJECTIVE, MESSAGING_APPOINTMENT_CONVERSION
  objectiveOptimizationMap: { [key: string]: string[] } = {
    'OUTCOME_TRAFFIC': [
      'LINK_CLICKS',
      'LANDING_PAGE_VIEWS',
      'OFFSITE_CONVERSIONS',
      'ENGAGED_PAGE_VIEWS',
      'IMPRESSIONS',
    ],
    'OUTCOME_ENGAGEMENT': [
      'POST_ENGAGEMENT',
      'PAGE_LIKES',
      'THRUPLAY',
      'ENGAGED_USERS',
      'EVENT_RESPONSES',
      'PROFILE_VISIT',
      'PROFILE_AND_PAGE_ENGAGEMENT',
      'VISIT_INSTAGRAM_PROFILE',
      'SUBSCRIBERS',
      'REMINDERS_SET',
      'CONVERSATIONS',
    ],
    'OUTCOME_AWARENESS': [
      'REACH',
      'AD_RECALL_LIFT',
      'IMPRESSIONS',
    ],
    'OUTCOME_LEADS': [
      'LEAD_GENERATION',
      'QUALITY_LEAD',
      'OFFSITE_CONVERSIONS',
      'QUALITY_CALL',
      'MEANINGFUL_CALL_ATTEMPT',
      'MESSAGING_APPOINTMENT_CONVERSION',
    ],
    'OUTCOME_SALES': [
      'VALUE',
      'OFFSITE_CONVERSIONS',
      'IN_APP_VALUE',
      'ADVERTISER_SILOED_VALUE',
      'MESSAGING_PURCHASE_CONVERSION',
      'DERIVED_EVENTS',
    ],
    'OUTCOME_APP_PROMOTION': [
      'APP_INSTALLS',
      'APP_INSTALLS_AND_OFFSITE_CONVERSIONS',
      'LINK_CLICKS',
      'OFFSITE_CONVERSIONS',
    ],
  };

  // Default optimization goal for each objective
  objectiveDefaultOptimization: { [key: string]: string } = {
    'OUTCOME_TRAFFIC': 'LINK_CLICKS',
    'OUTCOME_ENGAGEMENT': 'POST_ENGAGEMENT',
    'OUTCOME_AWARENESS': 'REACH',
    'OUTCOME_LEADS': 'LEAD_GENERATION',
    'OUTCOME_SALES': 'OFFSITE_CONVERSIONS', // Changed from CONVERSIONS (not in valid list)
    'OUTCOME_APP_PROMOTION': 'APP_INSTALLS',
  };

  get availableOptimizationGoals(): string[] {
    const objective = this.adForm.campaign.objective;
    return this.objectiveOptimizationMap[objective] || [];
  }

  constructor(
    private marketingService: MarketingService,
    private productsService: ProductsService,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadPriorityItems();
    this.loadSchedule();
    // Load overview stats if on overview channel
    if (this.selectedChannel === 'overview') {
      this.loadOverviewStats();
    }
    // Load ads when Ads section is selected and Meta channel is active
    if (this.selectedChannel === 'meta' && this.selectedMetaSection === 'ads') {
      this.loadAds();
    }
  }

  onChannelChange(channel: 'overview' | 'meta' | 'twitter' | 'tiktok' | 'youtube' | 'google') {
    this.selectedChannel = channel;
    if (channel === 'overview') {
      // Load overview statistics when switching to Overview
      this.loadOverviewStats();
    } else if (channel === 'meta' && this.selectedMetaSection === 'posts') {
      // Reload priority items when switching to Meta
      this.loadPriorityItems();
    } else if (channel === 'meta' && this.selectedMetaSection === 'ads') {
      // Load ads when switching to Meta Ads section
      this.loadAds();
    }
  }

  loadProducts() {
    this.isLoadingProducts = true;
    this.productsService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allProducts = response.data;
        }
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
        this.isLoadingProducts = false;
      },
    });
  }

  loadPriorityItems() {
    this.isLoadingPriorityItems = true;
    // Load Facebook priority items by default
    this.marketingService.getPriorityItems('facebook').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.priorityItems = response.data;
        }
        this.isLoadingPriorityItems = false;
      },
      error: (error) => {
        console.error('Error loading priority items:', error);
        this.snackBar.open(
          'Failed to load priority queue',
          'Close',
          { duration: 3000 }
        );
        this.isLoadingPriorityItems = false;
      },
    });
  }

  addToFront() {
    if (!this.selectedProductId) {
      this.snackBar.open('Please select a product', 'Close', { duration: 3000 });
      return;
    }

    this.marketingService
      .pushPriorityToFront({
        productId: this.selectedProductId,
        channel: 'facebook', // Default to facebook
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              'Product added to queue (front)',
              'Close',
              { duration: 3000 }
            );
            this.selectedProductId = '';
            this.loadPriorityItems();
          }
        },
        error: (error) => {
          console.error('Error adding product to front:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to add product',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  addToBack() {
    if (!this.selectedProductId) {
      this.snackBar.open('Please select a product', 'Close', { duration: 3000 });
      return;
    }

    this.marketingService
      .pushPriorityToBack({
        productId: this.selectedProductId,
        channel: 'facebook', // Default to facebook
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              'Product added to queue (back)',
              'Close',
              { duration: 3000 }
            );
            this.selectedProductId = '';
            this.loadPriorityItems();
          }
        },
        error: (error) => {
          console.error('Error adding product to back:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to add product',
            'Close',
            { duration: 3000 }
          );
        },
      });
  }

  clearQueue() {
    if (!confirm('Are you sure you want to clear the priority queue?')) {
      return;
    }

    this.marketingService.clearPriorityItems({ channel: 'facebook' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            'Priority queue cleared',
            'Close',
            { duration: 3000 }
          );
          this.loadPriorityItems();
        }
      },
      error: (error) => {
        console.error('Error clearing queue:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to clear queue',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  // Ad creation methods
  addAdCreative() {
    this.adForm.ads.push({
      name: '',
      status: 'PAUSED',
      creative: {
        link: '',
        message: '',
        headline: '',
        description: '',
        call_to_action: 'SHOP_NOW',
        image_url: '',
      },
    });
    this.createAdImageFiles.push(null);
  }

  removeAdCreative(index: number) {
    if (this.adForm.ads.length > 1) {
      this.adForm.ads.splice(index, 1);
      this.createAdImageFiles.splice(index, 1);
    } else {
      this.snackBar.open('At least one ad creative is required', 'Close', { duration: 3000 });
    }
  }

  isAdFormValid(): boolean {
    // Validate campaign
    if (!this.adForm.campaign.name || !this.adForm.campaign.objective || !this.adForm.campaign.status) {
      return false;
    }

    // Validate adset
    if (!this.adForm.adset.name || 
        this.createAdDailyBudgetShillings < 200 || 
        !this.adForm.adset.status) {
      return false;
    }

    // Validate optimization goal matches objective
    const validOptimizations = this.objectiveOptimizationMap[this.adForm.campaign.objective] || [];
    if (!validOptimizations.includes(this.adForm.adset.optimization_goal)) {
      return false;
    }

    // Validate billing event (should always be IMPRESSIONS)
    if (this.adForm.adset.billing_event !== 'IMPRESSIONS') {
      return false;
    }

    // Validate targeting - countries must be selected
    if (!this.adForm.adset.targeting.geo_locations?.countries || 
        this.adForm.adset.targeting.geo_locations.countries.length === 0) {
      return false;
    }

    // Validate all ad creatives
    if (this.adForm.ads.length === 0) {
      return false;
    }

    for (let i = 0; i < this.adForm.ads.length; i++) {
      const ad = this.adForm.ads[i];
      if (!ad.name || 
          !ad.status || 
          !ad.creative.link || 
          !ad.creative.message || 
          !ad.creative.headline || 
          !ad.creative.description || 
          !ad.creative.call_to_action) {
        return false;
      }
      // For image, require a selected file (or an existing image_url if ever pre-populated)
      if (!this.createAdImageFiles[i] && !ad.creative.image_url) {
        return false;
      }
    }

    return true;
  }

  createAd() {
    // Validate required fields
    if (!this.adForm.campaign.name) {
      this.snackBar.open('Campaign name is required', 'Close', { duration: 3000 });
      return;
    }
    if (!this.adForm.campaign.objective) {
      this.snackBar.open('Campaign objective is required', 'Close', { duration: 3000 });
      return;
    }
    // Validate optimization goal matches objective
    const validOptimizations = this.objectiveOptimizationMap[this.adForm.campaign.objective] || [];
    if (!validOptimizations.includes(this.adForm.adset.optimization_goal)) {
      this.snackBar.open(
        `Invalid optimization goal for ${this.adForm.campaign.objective}. Valid options: ${validOptimizations.join(', ')}`,
        'Close',
        { duration: 5000 }
      );
      return;
    }
    if (this.adForm.adset.billing_event !== 'IMPRESSIONS') {
      this.snackBar.open('Billing event must be IMPRESSIONS', 'Close', { duration: 3000 });
      return;
    }
    if (!this.adForm.adset.name) {
      this.snackBar.open('Ad set name is required', 'Close', { duration: 3000 });
      return;
    }
    // Validate daily budget in shillings (minimum 200 shillings)
    if (!this.createAdDailyBudgetShillings || this.createAdDailyBudgetShillings < 200) {
      this.snackBar.open('Daily budget must be at least 200 shillings', 'Close', { duration: 3000 });
      return;
    }
    if (!this.adForm.adset.targeting.geo_locations?.countries || 
        this.adForm.adset.targeting.geo_locations.countries.length === 0) {
      this.snackBar.open('Please select at least one target country', 'Close', { duration: 3000 });
      return;
    }
    // Per-creative validation including image files
    for (let i = 0; i < this.adForm.ads.length; i++) {
      const ad = this.adForm.ads[i] as any;
      if (!ad.name || !ad.creative.link || !ad.creative.message || !ad.creative.headline || !ad.creative.description || !ad.creative.call_to_action) {
        this.snackBar.open('Please fill in all required ad creative fields', 'Close', { duration: 3000 });
        return;
      }
      if (!this.createAdImageFiles[i] && !ad.creative.image_url) {
        this.snackBar.open('Please select an image file for each ad creative', 'Close', { duration: 3000 });
        return;
      }
    }

    this.isLoadingAd = true;

    // Upload all image files first, then submit the create-ad request with the URLs
    const uploadObservables: any[] = [];
    const indices: number[] = [];

    this.adForm.ads.forEach((_ad, index) => {
      const file = this.createAdImageFiles[index];
      if (file) {
        indices.push(index);
        uploadObservables.push(this.marketingService.uploadImage(file));
      }
    });

    // Convert shillings to cents before submitting (1 shilling = 100 cents)
    const adFormToSubmit = {
      ...this.adForm,
      adset: {
        ...this.adForm.adset,
        daily_budget: this.createAdDailyBudgetShillings * 100, // Convert shillings to cents
      },
    };

    if (uploadObservables.length === 0) {
      // No files to upload (unlikely with new UI), just send existing image_url values
      this.marketingService.createAd(adFormToSubmit).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Ad campaign created successfully!', 'Close', { duration: 5000 });
            this.resetAdForm();
            this.isCreateAdModalOpen = false;
            this.loadAds();
          }
          this.isLoadingAd = false;
        },
        error: (error) => {
          console.error('Error creating ad:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to create ad campaign',
            'Close',
            { duration: 5000 }
          );
          this.isLoadingAd = false;
        },
      });
      return;
    }

    // Upload all images in parallel
    Promise.all(uploadObservables.map(obs => obs.toPromise())).then((results: any[]) => {
      // Clone adForm to avoid mutating original while user might still be editing
      const payload: CreateAdRequest = JSON.parse(JSON.stringify(adFormToSubmit));

      results.forEach((res, idx) => {
        const adIndex = indices[idx];
        if (res && res.success && res.data) {
          payload.ads[adIndex].creative.image_url = res.data;
        }
      });

      this.marketingService.createAd(payload).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Ad campaign created successfully!', 'Close', { duration: 5000 });
            this.resetAdForm();
            this.createAdImageFiles = [null];
            this.isCreateAdModalOpen = false;
            this.loadAds();
          }
          this.isLoadingAd = false;
        },
        error: (error) => {
          console.error('Error creating ad:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to create ad campaign',
            'Close',
            { duration: 5000 }
          );
          this.isLoadingAd = false;
        },
      });
    }).catch((error) => {
      console.error('Error uploading images for create ad:', error);
      this.snackBar.open(
        'Failed to upload one or more images',
        'Close',
        { duration: 5000 }
      );
      this.isLoadingAd = false;
    });
  }

  openCreateAdModal() {
    this.isCreateAdModalOpen = true;
  }

  closeCreateAdModal() {
    this.isCreateAdModalOpen = false;
    this.resetAdForm();
  }

  loadAds(limit: number = 10, after?: string, before?: string) {
    this.isLoadingAds = true;
    this.marketingService.getAds({ limit, after, before, date_preset: this.selectedDatePreset }).subscribe({
      next: (response) => {
        if (response.success) {
          // Response structure matches Facebook Insights API: { data: { data: [...], paging: {...} } }
          this.adsList = response.data?.data || [];
          this.adsPaging = response.data?.paging || null;
        }
        this.isLoadingAds = false;
      },
      error: (error) => {
        console.error('Error loading ads:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to load ads',
          'Close',
          { duration: 3000 }
        );
        this.isLoadingAds = false;
      },
    });
  }

  loadOverviewStats() {
    this.isLoadingOverview = true;
    this.marketingService.getOverviewStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.overviewStats = {
            totalSpend: response.data.totalSpend || 0,
            activeAds: response.data.activeAds || 0,
            totalAds: response.data.totalAds || 0,
            clicks: response.data.clicks || 0,
          };
        }
        this.isLoadingOverview = false;
      },
      error: (error) => {
        console.error('Error loading overview stats:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to load overview statistics',
          'Close',
          { duration: 3000 }
        );
        this.isLoadingOverview = false;
      },
    });
  }

  onMetaSectionChange(section: 'posts' | 'ads') {
    this.selectedMetaSection = section;
    if (section === 'ads') {
      this.loadAds();
    }
  }

  onDatePresetChange() {
    // Reload ads when date preset changes
    this.loadAds();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Format monetary values from cents to shillings
  // Facebook returns spend, CPC, CPM in cents (smallest currency unit)
  formatCurrencyFromCents(cents: number): string {
    if (!cents && cents !== 0) return '0.00';
    const shillings = cents / 100; // Convert cents to shillings
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(shillings);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getDeliveryStatusClass(deliveryStatus?: string): string {
    if (!deliveryStatus) return 'text-gray-500';
    
    const status = deliveryStatus.toUpperCase();
    if (status === 'ACTIVE' || status === 'DELIVERING') {
      return 'text-green-600 font-medium';
    } else if (status === 'PAUSED' || status === 'DISAPPROVED' || status === 'WITH_ISSUES') {
      return 'text-red-600 font-medium';
    } else if (status === 'PENDING_REVIEW' || status === 'PENDING_BILLING_INFO' || status === 'PREAPPROVED') {
      return 'text-yellow-600 font-medium';
    } else if (status === 'CAMPAIGN_PAUSED' || status === 'ADSET_PAUSED') {
      return 'text-orange-600 font-medium';
    } else {
      return 'text-gray-600';
    }
  }

  getEffectiveStatusClass(effectiveStatus?: string): string {
    if (!effectiveStatus) return 'text-gray-500';
    
    const status = effectiveStatus.toUpperCase();
    // Active states
    if (status === 'ACTIVE') {
      return 'text-green-600 font-medium';
    }
    // Paused states
    else if (status === 'PAUSED' || status === 'CAMPAIGN_PAUSED' || status === 'ADSET_PAUSED' || status === 'ACCOUNT_PAUSED') {
      return 'text-orange-600 font-medium';
    }
    // Disapproved/Rejected states
    else if (status === 'DISAPPROVED' || status === 'PREAPPROVED' || status === 'PENDING_REVIEW' || status === 'PENDING_BILLING_INFO') {
      return 'text-yellow-600 font-medium';
    }
    // Error/Issue states
    else if (status === 'WITH_ISSUES' || status === 'ARCHIVED' || status === 'DELETED') {
      return 'text-red-600 font-medium';
    }
    // Inactive/Other states
    else if (status === 'INACTIVE' || status === 'ADSET_PAUSED') {
      return 'text-gray-500';
    }
    else {
      return 'text-gray-600';
    }
  }

  toggleAdStatus(ad: AdWithInsights) {
    const newStatus = ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    this.isUpdatingAd = true;
    
    // Use safe activation flow for activating ads (campaign -> adset -> ad)
    // For deactivating, simple status update is sufficient
    if (newStatus === 'ACTIVE') {
      this.marketingService.activateAd(ad.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              'Ad activated successfully',
              'Close',
              { duration: 3000 }
            );
            // Reload ads to reflect the change
            this.loadAds();
          }
          this.isUpdatingAd = false;
        },
        error: (error) => {
          console.error('Error activating ad:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to activate ad',
            'Close',
            { duration: 3000 }
          );
          this.isUpdatingAd = false;
        },
      });
    } else {
      // For pausing, use simple status update
      this.marketingService.updateAd(ad.id, { status: newStatus }).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(
              'Ad paused successfully',
              'Close',
              { duration: 3000 }
            );
            // Reload ads to reflect the change
            this.loadAds();
          }
          this.isUpdatingAd = false;
        },
        error: (error) => {
          console.error('Error pausing ad:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to pause ad',
            'Close',
            { duration: 3000 }
          );
          this.isUpdatingAd = false;
        },
      });
    }
  }

  openUpdateAdModal(ad: AdWithInsights) {
    this.selectedAdForUpdate = ad;
    this.isUpdateAdModalOpen = true;
    
    // Initialize form with basic ad data
    this.updateAdForm = {
      name: ad.name || '',
      status: ad.status || 'PAUSED',
      headline: '',
      link: '',
      description: '',
      message: '',
      call_to_action: '',
      daily_budget: null,
    };

    // Get creative ID from ad.creative
    const creativeId = ad.creative?.id;
    
    if (creativeId) {
      // Fetch creative details from the API
      this.isLoadingCreative = true;
      this.marketingService.getCreativeDetails(creativeId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const creative = response.data;
            
            // Extract creative fields from the fetched data
            // Structure: object_story_spec.link_data.{headline, link, description, message}
            const objectStorySpec = creative.object_story_spec || {};
            const linkData = objectStorySpec.link_data || creative.link_data || {};
            
            // Populate form with creative data
            // Extract call_to_action - Facebook returns it as an object with 'type' field: { type: "SHOP_NOW" }
            let callToActionValue = '';
            if (linkData.call_to_action && typeof linkData.call_to_action === 'object' && linkData.call_to_action.type) {
              callToActionValue = linkData.call_to_action.type;
            } else if ((linkData as any).call_to_action_type) {
              callToActionValue = (linkData as any).call_to_action_type;
            } else if ((linkData as any).call_to_action && typeof (linkData as any).call_to_action === 'string') {
              callToActionValue = (linkData as any).call_to_action;
            } else if ((creative as any).call_to_action_type) {
              callToActionValue = (creative as any).call_to_action_type;
            }
            
            this.updateAdForm = {
              ...this.updateAdForm,
              headline: linkData.headline || linkData.name || creative.headline || creative.name || '',
              link: linkData.link || creative.link || '',
              description: linkData.description || creative.description || '',
              message: linkData.message || creative.message || '',
              call_to_action: callToActionValue,
            };

            // Fetch image URL if image_hash is available
            this.creativeImageUrl = creative.image_url;
            

            // Fetch adset details to get daily_budget
            if (ad.adset_id) {
              this.selectedAdsetId = ad.adset_id;
              // Fetch adset details to populate daily_budget
              this.marketingService.getAdsetDetails(ad.adset_id).subscribe({
                next: (adsetResponse) => {
                  if (adsetResponse.success && adsetResponse.data) {
                    const adset = adsetResponse.data;
                    // Populate daily_budget from adset (Facebook provides budget in cents, convert to shillings for display)
                    if (adset.daily_budget !== undefined && adset.daily_budget !== null) {
                      const budgetInCents = parseInt(adset.daily_budget.toString(), 10);
                      this.updateAdDailyBudgetShillings = Math.round(budgetInCents / 100); // Convert cents to shillings
                    }
                  }
                },
                error: (adsetError) => {
                  console.error('Error fetching adset details:', adsetError);
                  // Don't show error to user, just log it - daily_budget will remain null
                },
              });
            }
          }
          this.isLoadingCreative = false;
        },
        error: (error) => {
          console.error('Error fetching creative details:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to load creative details',
            'Close',
            { duration: 3000 }
          );
          this.isLoadingCreative = false;
        },
      });
    } else {
      // If no creative ID, try to extract from ad.creative if available
      const creative = ad.creative || {};
      const objectStorySpec = creative.object_story_spec || {};
      const linkData = objectStorySpec.link_data || creative.link_data || {};
      
      this.updateAdForm = {
        ...this.updateAdForm,
        headline: linkData.headline || linkData.name || creative.headline || creative.name || '',
        link: linkData.link || creative.link || '',
        description: linkData.description || creative.description || '',
        message: linkData.message || creative.message || '',
        call_to_action: linkData.call_to_action_type || linkData.call_to_action || creative.call_to_action_type || '',
      };
      
      if ((creative as any).image_url) {
        this.creativeImageUrl = (creative as any).image_url;
      }
    }

    // Fetch adset details to populate daily_budget (if not already fetched above)
    // Check if we haven't already set the shillings value
    if (ad.adset_id && this.updateAdDailyBudgetShillings === 0) {
      this.selectedAdsetId = ad.adset_id;
      this.marketingService.getAdsetDetails(ad.adset_id).subscribe({
        next: (adsetResponse) => {
          if (adsetResponse.success && adsetResponse.data) {
            const adset = adsetResponse.data;
            // Populate daily_budget from adset (Facebook provides budget in cents, convert to shillings for display)
            if (adset.daily_budget !== undefined && adset.daily_budget !== null) {
              const budgetInCents = parseInt(adset.daily_budget.toString(), 10);
              this.updateAdDailyBudgetShillings = Math.round(budgetInCents / 100); // Convert cents to shillings
            }
          }
        },
        error: (adsetError) => {
          console.error('Error fetching adset details:', adsetError);
          // Don't show error to user, just log it - daily_budget will remain null
        },
      });
    } else if (ad.adset_id) {
      this.selectedAdsetId = ad.adset_id;
    }
  }

  closeUpdateAdModal() {
    this.isUpdateAdModalOpen = false;
    this.selectedAdForUpdate = null;
    this.isLoadingCreative = false;
    this.creativeImageUrl = null;
    this.selectedImageFile = null;
    this.selectedAdsetId = null;
    this.updateAdDailyBudgetShillings = 0;
    this.updateAdForm = {
      name: '',
      status: 'PAUSED',
      headline: '',
      link: '',
      description: '',
      message: '',
      call_to_action: '',
      daily_budget: null,
    };
  }

  openViewAdModal(ad: AdWithInsights) {
    this.selectedAdForView = ad;
    this.isViewAdModalOpen = true;
    this.isLoadingViewCreative = false;
    this.viewCreativeImageUrl = null;

    // Initialize view form with basic ad data
    this.viewAdForm = {
      name: ad.name || '',
      status: ad.status || 'PAUSED',
      headline: '',
      link: '',
      description: '',
      message: '',
      call_to_action: '',
      daily_budget: null,
    };

    // Get creative ID from ad.creative
    const creativeId = ad.creative?.id;

    if (creativeId) {
      this.isLoadingViewCreative = true;
      this.marketingService.getCreativeDetails(creativeId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const creative = response.data;
            const objectStorySpec = creative.object_story_spec || {};
            const linkData = objectStorySpec.link_data || creative.link_data || {};

            let callToActionValue = '';
            if (linkData.call_to_action && typeof linkData.call_to_action === 'object' && linkData.call_to_action.type) {
              callToActionValue = linkData.call_to_action.type;
            } else if ((linkData as any).call_to_action_type) {
              callToActionValue = (linkData as any).call_to_action_type;
            } else if ((linkData as any).call_to_action && typeof (linkData as any).call_to_action === 'string') {
              callToActionValue = (linkData as any).call_to_action;
            } else if ((creative as any).call_to_action_type) {
              callToActionValue = (creative as any).call_to_action_type;
            }

            this.viewAdForm = {
              ...this.viewAdForm,
              headline: linkData.headline || linkData.name || creative.headline || creative.name || '',
              link: linkData.link || creative.link || '',
              description: linkData.description || creative.description || '',
              message: linkData.message || creative.message || '',
              call_to_action: callToActionValue,
            };

            this.viewCreativeImageUrl = creative.image_url || null;
          }
          this.isLoadingViewCreative = false;
        },
        error: (error) => {
          console.error('Error fetching creative details for view:', error);
          this.isLoadingViewCreative = false;
        },
      });
    } else {
      const creative = ad.creative || {};
      const objectStorySpec = creative.object_story_spec || {};
      const linkData = objectStorySpec.link_data || creative.link_data || {};

      this.viewAdForm = {
        ...this.viewAdForm,
        headline: linkData.headline || linkData.name || creative.headline || creative.name || '',
        link: linkData.link || creative.link || '',
        description: linkData.description || creative.description || '',
        message: linkData.message || creative.message || '',
        call_to_action: linkData.call_to_action_type || linkData.call_to_action || creative.call_to_action_type || '',
      };

      if ((creative as any).image_url) {
        this.viewCreativeImageUrl = (creative as any).image_url;
      }
    }

    // Fetch adset details to populate daily_budget
    if (ad.adset_id) {
      this.marketingService.getAdsetDetails(ad.adset_id).subscribe({
        next: (adsetResponse) => {
          if (adsetResponse.success && adsetResponse.data) {
            const adset = adsetResponse.data;
            if (adset.daily_budget !== undefined && adset.daily_budget !== null) {
              this.viewAdForm.daily_budget = parseInt(adset.daily_budget.toString(), 10);
            }
          }
        },
        error: (adsetError) => {
          console.error('Error fetching adset details for view:', adsetError);
        },
      });
    }
  }

  closeViewAdModal() {
    this.isViewAdModalOpen = false;
    this.selectedAdForView = null;
    this.isLoadingViewCreative = false;
    this.viewCreativeImageUrl = null;
    this.viewAdForm = {
      name: '',
      status: 'PAUSED',
      headline: '',
      link: '',
      description: '',
      message: '',
      call_to_action: '',
      daily_budget: null,
    };
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.creativeImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  onCreateAdImageSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.createAdImageFiles[index] = input.files[0];
    } else {
      this.createAdImageFiles[index] = null;
    }
  }

  isUpdateAdFormValid(): boolean {
    // Validate required fields
    if (!this.updateAdForm.name || this.updateAdForm.name.trim() === '') {
      return false;
    }
    
    if (!this.updateAdForm.status) {
      return false;
    }
    
    // Creative fields are optional, but if provided they should be valid
    // No additional validation needed for optional fields
    
    return true;
  }

  updateAd() {
    if (!this.selectedAdForUpdate) {
      return;
    }

    // Validate form before submitting
    if (!this.isUpdateAdFormValid()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isUpdatingAd = true;

    // First, upload image if a new one is selected
    const uploadImageObservable = this.selectedImageFile
      ? this.marketingService.uploadImage(this.selectedImageFile)
      : null;

    if (uploadImageObservable) {
      uploadImageObservable.subscribe({
        next: (uploadResponse) => {
          if (uploadResponse.success && uploadResponse.data) {
            // Image uploaded, now proceed with ad update
            this.performAdUpdate(uploadResponse.data);
          } else {
            this.isUpdatingAd = false;
            this.snackBar.open('Failed to upload image', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.isUpdatingAd = false;
          this.snackBar.open(
            error.error?.message || 'Failed to upload image',
            'Close',
            { duration: 3000 }
          );
        },
      });
    } else {
      // No image to upload, proceed directly with ad update
      this.performAdUpdate(null);
    }
  }

  performAdUpdate(uploadedImageUrl: string | null) {
    if (!this.selectedAdForUpdate) {
      return;
    }

    // Only send fields that Facebook allows to be updated
    const updateData: { 
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
    } = {};
    
    // Ad fields
    if (this.updateAdForm.name !== undefined && this.updateAdForm.name !== this.selectedAdForUpdate.name) {
      updateData.name = this.updateAdForm.name;
    }
    
    if (this.updateAdForm.status !== undefined && this.updateAdForm.status !== this.selectedAdForUpdate.status) {
      updateData.status = this.updateAdForm.status as 'PAUSED' | 'ACTIVE' | 'ARCHIVED';
    }

    // Creative fields - compare with current creative values
    const currentCreative = this.selectedAdForUpdate.creative || {};
    const currentObjectStorySpec = currentCreative.object_story_spec || {};
    const currentLinkData = currentObjectStorySpec.link_data || currentCreative.link_data || {};
    
    // Compare and add to updateData if changed
    const currentHeadline = currentLinkData.headline || currentCreative.headline || '';
    if (this.updateAdForm.headline !== undefined && this.updateAdForm.headline !== currentHeadline) {
      updateData.headline = this.updateAdForm.headline;
    }
    
    const currentLink = currentLinkData.link || currentCreative.link || '';
    if (this.updateAdForm.link !== undefined && this.updateAdForm.link !== currentLink) {
      updateData.link = this.updateAdForm.link;
    }
    
    const currentDescription = currentLinkData.description || currentCreative.description || '';
    if (this.updateAdForm.description !== undefined && this.updateAdForm.description !== currentDescription) {
      updateData.description = this.updateAdForm.description;
    }
    
    const currentMessage = currentLinkData.message || currentCreative.message || '';
    if (this.updateAdForm.message !== undefined && this.updateAdForm.message !== currentMessage) {
      updateData.message = this.updateAdForm.message;
    }

    // Call to action - extract from object format if needed
    // Facebook returns call_to_action as an object: { type: "SHOP_NOW" }
    let currentCallToAction = '';
    const callToActionData = (currentLinkData as any).call_to_action;
    if (callToActionData) {
      if (typeof callToActionData === 'object' && (callToActionData as any).type) {
        currentCallToAction = (callToActionData as any).type;
      } else if (typeof callToActionData === 'string') {
        currentCallToAction = callToActionData;
      }
    }
    
    if (!currentCallToAction && (currentLinkData as any).call_to_action_type) {
      currentCallToAction = (currentLinkData as any).call_to_action_type;
    }
    
    if (!currentCallToAction && (currentCreative as any).call_to_action_type) {
      currentCallToAction = (currentCreative as any).call_to_action_type;
    }
    
    if (this.updateAdForm.call_to_action && this.updateAdForm.call_to_action !== currentCallToAction) {
      updateData.call_to_action = this.updateAdForm.call_to_action;
    }

    // Image URL (from uploaded image)
    if (uploadedImageUrl) {
      updateData.image_url = uploadedImageUrl;
    }

    // Adset budget - convert shillings to cents before submitting
    // Note: Facebook expects budget in cents, but we're working with shillings in the form
    if (this.selectedAdsetId && this.updateAdDailyBudgetShillings > 0) {
      // Validate minimum budget (200 shillings)
      if (this.updateAdDailyBudgetShillings < 200) {
        this.isUpdatingAd = false;
        this.snackBar.open('Daily budget must be at least 200 shillings', 'Close', { duration: 3000 });
        return;
      }
      updateData.adsetId = this.selectedAdsetId;
      updateData.daily_budget = this.updateAdDailyBudgetShillings * 100; // Convert shillings to cents
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      this.isUpdatingAd = false;
      this.snackBar.open('No changes to update', 'Close', { duration: 3000 });
      return;
    }

    this.marketingService.updateAd(this.selectedAdForUpdate.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Ad updated successfully', 'Close', { duration: 3000 });
          this.closeUpdateAdModal();
          // Reload ads to reflect the change
          this.loadAds();
        }
        this.isUpdatingAd = false;
      },
      error: (error) => {
        console.error('Error updating ad:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to update ad',
          'Close',
          { duration: 3000 }
        );
        this.isUpdatingAd = false;
      },
    });
  }

  onObjectiveChange() {
    // Update optimization goal when objective changes
    const defaultOptimization = this.objectiveDefaultOptimization[this.adForm.campaign.objective];
    if (defaultOptimization) {
      this.adForm.adset.optimization_goal = defaultOptimization;
    }
    // Billing event is always IMPRESSIONS for all objectives
    this.adForm.adset.billing_event = 'IMPRESSIONS';
  }

  resetAdForm() {
    this.adForm = {
      campaign: {
        name: '',
        objective: 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
        special_ad_categories: ['NONE'],
        buying_type: 'AUCTION',
        is_adset_budget_sharing_enabled: false,
      },
      adset: {
        name: '',
        daily_budget: 0,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        targeting: {
          age_min: 18,
          age_max: 65,
          genders: [1, 2],
          geo_locations: {
            countries: [],
          },
          targeting_automation: {
            advantage_audience: 0,
          },
        },
        status: 'PAUSED',
        promoted_object: {
          custom_event_type: 'PURCHASE',
        },
      },
      ads: [
        {
          name: '',
          status: 'PAUSED',
          creative: {
            link: '',
            message: '',
            headline: '',
            description: '',
            call_to_action: 'SHOP_NOW',
            image_url: '',
          },
        },
      ],
    };
  }

  // Schedule methods
  loadSchedule() {
    this.isInitializingSchedule = true;
    this.scheduleService.getSchedule().subscribe({
      next: (res) => {
        if (res.success) {
          this.schedule = res.data;

          // Ensure arrays exist
          if (!this.schedule.facebookPostTimes) {
            this.schedule.facebookPostTimes = [];
          }
          if (!this.schedule.instagramPostTimes) {
            this.schedule.instagramPostTimes = [];
          }

          // Populate time input fields from arrays
          this.facebookPostTime1 = this.schedule.facebookPostTimes[0] || '';
          this.facebookPostTime2 = this.schedule.facebookPostTimes[1] || '';
          this.instagramPostTime1 = this.schedule.instagramPostTimes[0] || '';
          this.instagramPostTime2 = this.schedule.instagramPostTimes[1] || '';

          // Store original state
          this.originalSchedule = JSON.parse(JSON.stringify(res.data));
          this.isInitializingSchedule = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        this.snackBar.open('Error loading schedule settings', 'Close', { duration: 3000 });
        this.isInitializingSchedule = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateSchedule() {
    if (!this.validateSchedule()) {
      return;
    }

    this.isLoadingSchedule = true;

    // Build arrays from time inputs, filtering out empty values
    const facebookPostTimes: string[] = [];
    if (this.facebookPostTime1) facebookPostTimes.push(this.facebookPostTime1);
    if (this.facebookPostTime2) facebookPostTimes.push(this.facebookPostTime2);

    const instagramPostTimes: string[] = [];
    if (this.instagramPostTime1) instagramPostTimes.push(this.instagramPostTime1);
    if (this.instagramPostTime2) instagramPostTimes.push(this.instagramPostTime2);

    const updateData: any = {
      timezone: this.schedule.timezone,
      facebookPostTimes: facebookPostTimes,
      instagramPostTimes: instagramPostTimes,
      status: this.schedule.status,
    };

    this.scheduleService.updateSchedule(updateData).subscribe({
      next: (res) => {
        if (res.success) {
          this.schedule = res.data;

          // Ensure arrays exist
          if (!this.schedule.facebookPostTimes) {
            this.schedule.facebookPostTimes = [];
          }
          if (!this.schedule.instagramPostTimes) {
            this.schedule.instagramPostTimes = [];
          }

          // Populate time input fields from arrays
          this.facebookPostTime1 = this.schedule.facebookPostTimes[0] || '';
          this.facebookPostTime2 = this.schedule.facebookPostTimes[1] || '';
          this.instagramPostTime1 = this.schedule.instagramPostTimes[0] || '';
          this.instagramPostTime2 = this.schedule.instagramPostTimes[1] || '';

          this.originalSchedule = JSON.parse(JSON.stringify(res.data));
          this.snackBar.open('Schedule updated successfully', 'Close', { duration: 3000 });
        }
        this.isLoadingSchedule = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating schedule:', error);
        this.snackBar.open(
          error.error?.message || 'Error updating schedule',
          'Close',
          { duration: 3000 }
        );
        this.isLoadingSchedule = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelScheduleChanges() {
    if (this.originalSchedule) {
      this.schedule = JSON.parse(JSON.stringify(this.originalSchedule));

      // Ensure arrays exist
      if (!this.schedule.facebookPostTimes) {
        this.schedule.facebookPostTimes = [];
      }
      if (!this.schedule.instagramPostTimes) {
        this.schedule.instagramPostTimes = [];
      }

      // Restore time input fields
      this.facebookPostTime1 = this.schedule.facebookPostTimes[0] || '';
      this.facebookPostTime2 = this.schedule.facebookPostTimes[1] || '';
      this.instagramPostTime1 = this.schedule.instagramPostTimes[0] || '';
      this.instagramPostTime2 = this.schedule.instagramPostTimes[1] || '';
    }
  }

  hasScheduleChanges(): boolean {
    // Check if time inputs have changed
    const currentFacebookTimes = [
      this.facebookPostTime1 || null,
      this.facebookPostTime2 || null,
    ].filter((t) => t !== null);
    const originalFacebookTimes = this.originalSchedule?.facebookPostTimes || [];
    const facebookTimesChanged =
      JSON.stringify(currentFacebookTimes.sort()) !==
      JSON.stringify(originalFacebookTimes.sort());

    const currentInstagramTimes = [
      this.instagramPostTime1 || null,
      this.instagramPostTime2 || null,
    ].filter((t) => t !== null);
    const originalInstagramTimes = this.originalSchedule?.instagramPostTimes || [];
    const instagramTimesChanged =
      JSON.stringify(currentInstagramTimes.sort()) !==
      JSON.stringify(originalInstagramTimes.sort());

    return (
      (this.originalSchedule &&
        (this.schedule.timezone !== this.originalSchedule.timezone ||
          this.schedule.status !== this.originalSchedule.status)) ||
      facebookTimesChanged ||
      instagramTimesChanged
    );
  }

  validateSchedule(): boolean {
    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    // Validate Facebook times
    if (this.facebookPostTime1 && !timeRegex.test(this.facebookPostTime1)) {
      this.snackBar.open(
        'Facebook post time 1 must be in HH:mm format (e.g., 09:00)',
        'Close',
        { duration: 3000 }
      );
      return false;
    }
    if (this.facebookPostTime2 && !timeRegex.test(this.facebookPostTime2)) {
      this.snackBar.open(
        'Facebook post time 2 must be in HH:mm format (e.g., 15:00)',
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    // Validate Instagram times
    if (this.instagramPostTime1 && !timeRegex.test(this.instagramPostTime1)) {
      this.snackBar.open(
        'Instagram post time 1 must be in HH:mm format (e.g., 10:00)',
        'Close',
        { duration: 3000 }
      );
      return false;
    }
    if (this.instagramPostTime2 && !timeRegex.test(this.instagramPostTime2)) {
      this.snackBar.open(
        'Instagram post time 2 must be in HH:mm format (e.g., 16:00)',
        'Close',
        { duration: 3000 }
      );
      return false;
    }

    return true;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
