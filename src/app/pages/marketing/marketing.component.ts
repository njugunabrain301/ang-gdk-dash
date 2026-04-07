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
import { MatRadioModule } from '@angular/material/radio';
import { ChangeDetectorRef } from '@angular/core';
import {
  MarketingService,
  PriorityItem,
  CreateAdRequest,
  AdWithInsights,
  GenerateAdData,
  TiktokStatus,
  TiktokAd,
  TiktokAdgroup,
  TiktokCampaign,
  TiktokAdCreateRequest,
  TiktokPostPhotoRequest,
  TiktokPostVideoRequest,
  TiktokImageInfo,
  TiktokVideoInfo,
  TiktokMetrics,
} from '../../services/marketing.service';
import { ProductsService } from '../../services/products.service';
import { ProductService } from '../../services/product.service';
import { ScheduleService, ScheduleData } from '../../services/schedule.service';
import { GoogleComponent } from '../../components/marketing/google/google.component';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';

Chart.register(...registerables);

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
    MatRadioModule,
    GoogleComponent,
    BaseChartDirective,
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css'],
})
export class MarketingComponent implements OnInit {
  selectedChannel: 'overview' | 'meta' | 'twitter' | 'tiktok' | 'youtube' | 'google' = 'overview';

  /** Nav row title matching the selected channel */
  get selectedChannelTitle(): string {
    const labels: Record<typeof this.selectedChannel, string> = {
      overview: 'Overview',
      meta: 'Meta',
      twitter: 'Twitter',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      google: 'Google',
    };
    return labels[this.selectedChannel] ?? this.selectedChannel;
  }
  selectedMetaSection: 'posts' | 'ads' = 'posts';
  selectedTiktokSection: 'posts' | 'campaigns' | 'adgroups' | 'ads' = 'ads';
  
  // Priority items data (using facebook as default)
  priorityItems: PriorityItem[] = [];
  isLoadingPriorityItems = false;
  
  // Product selection
  allProducts: any[] = [];
  selectedProductId: string = '';
  isLoadingProducts = false;

  // Create ad: product & landing page for "Generate ad copy"
  createAdSelectedProductId: string = '';
  createAdSelectedLandingPageName: string = '';
  createAdLandingPages: { name: string }[] = [];
  isLoadingProductForAd = false;
  isGenerateAdLoading = false;

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
    merchantCenterId: null,
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
  selectedOverviewDatePreset: string = 'maximum';
  overviewStats = {
    totalSpend: 0,
    activeAds: 0,
    totalAds: 0,
    clicks: 0,
    impressions: 0,
    reach: 0,
    ctr: 0,
    cpc: 0,
  };
  isLoadingOverview = false;

  // TikTok overview statistics
  tiktokOverviewStats = {
    spend: 0, impressions: 0, clicks: 0, reach: 0, frequency: 0, ctr: 0, cpc: 0,
  };
  isLoadingTiktokOverview = false;

  // Overview charts
  spendChartData: ChartData<'doughnut'> = {
    labels: ['Facebook', 'TikTok'],
    datasets: [{ data: [0, 0], backgroundColor: ['#3B82F6', '#10B981'], hoverBackgroundColor: ['#2563EB', '#059669'] }],
  };
  spendChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed || 0;
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${ctx.label}: Ksh. ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
  };
  performanceChartData: ChartData<'bar'> = {
    labels: ['Impressions', 'Clicks', 'Reach'],
    datasets: [
      { label: 'Facebook', data: [0, 0, 0], backgroundColor: '#3B82F6' },
      { label: 'TikTok', data: [0, 0, 0], backgroundColor: '#10B981' },
    ],
  };
  performanceChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y || 0).toLocaleString()}` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            const n = Number(value);
            if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
            if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
            return n.toString();
          },
        },
      },
    },
  };
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
  // TikTok
  tiktokStatus: TiktokStatus = { connected: false, advertiserId: null, openId: null, displayName: null };
  tiktokAdsList: TiktokAd[] = [];
  isLoadingTiktokStatus = false;
  isLoadingTiktokAds = false;
  tiktokAdsPage = 1;
  tiktokAdsTotalPages = 0;
  tiktokAdsTotalNumber = 0;
  isTiktokAdStatusUpdating: { [adId: string]: boolean } = {};
  tiktokPostPhotoUrls = '';
  tiktokPostPhotoCoverIndex = 0;
  tiktokPostTitle = '';
  tiktokPostDescription = '';
  tiktokPostPrivacy = 'PUBLIC_TO_EVERYONE';
  isTiktokPosting = false;
  tiktokCreatorInfo: { privacy_level_options?: string[] } = {};
  // Video post
  tiktokPostVideoUrl = '';
  tiktokPostVideoTitle = '';
  tiktokPostVideoPrivacy = 'PUBLIC_TO_EVERYONE';
  tiktokPostVideoDisableComment = false;
  tiktokPostVideoDisableDuet = false;
  tiktokPostVideoDisableStitch = false;
  isTiktokPostingVideo = false;
  // Advertiser selection (for ads tab)
  tiktokAdvertisersList: { advertiser_id?: string; id?: string; name?: string }[] = [];
  selectedTiktokAdvertiserId: string | null = null;
  isLoadingTiktokAdvertisers = false;
  // Create TikTok ad dialog
  isTiktokCreateAdModalOpen = false;
  tiktokCreateCampaignMode: 'new' | 'existing' = 'new';
  tiktokCampaignsList: { campaign_id?: string; campaign_name?: string; [key: string]: unknown }[] = [];
  isLoadingTiktokCampaigns = false;
  tiktokCreateCampaignName = '';
  tiktokCreateObjectiveType = 'CONVERSIONS';
  tiktokCreateCampaignId: string | null = null;
  /** 'new' = create ad group form; 'existing' = pick from list */
  tiktokCreateAdgroupMode: 'new' | 'existing' = 'new';
  tiktokCreateAdgroupName = '';
  tiktokCreateAdgroupBudget = 50;
  tiktokCreateAdgroupBillingEvent = 'CPC';
  /** Bid price (USD) for CPC/CPM/OCPM; required by TikTok at ad group level. */
  tiktokCreateAdgroupBidPrice = 0.5;
  /** Placement type: PLACEMENT_TYPE_AUTOMATIC | PLACEMENT_TYPE_NORMAL */
  tiktokCreateAdgroupPlacementType: 'PLACEMENT_TYPE_AUTOMATIC' | 'PLACEMENT_TYPE_NORMAL' = 'PLACEMENT_TYPE_AUTOMATIC';
  /** Selected placements when placement type is NORMAL (e.g. PLACEMENT_TIKTOK) */
  tiktokCreateAdgroupPlacements: string[] = ['PLACEMENT_TIKTOK'];
  /** SCHEDULE_FROM_NOW | SCHEDULE_START_END */
  tiktokCreateAdgroupScheduleType: 'SCHEDULE_FROM_NOW' | 'SCHEDULE_START_END' = 'SCHEDULE_FROM_NOW';
  /** Schedule start (datetime-local). */
  tiktokCreateAdgroupScheduleStart = '';
  /** Schedule end (datetime-local); used when schedule_type is SCHEDULE_START_END. */
  tiktokCreateAdgroupScheduleEnd = '';
  /** Optimization goal (e.g. CLICK, CONVERT, REACH). Must match TikTok enum. */
  tiktokCreateAdgroupOptimizationGoal = 'CLICK';
  /** Location targeting: at least one required by TikTok. */
  tiktokCreateAdgroupLocationIds: string[] = ['6255148'];
  /** Options for location dropdown (from GET /tiktok/targeting/locations). */
  tiktokLocationOptions: { id: string; name: string }[] = [];
  /** List of ad groups (for "use existing" in step 2). */
  tiktokAdgroupsList: TiktokAdgroup[] = [];
  isLoadingTiktokAdgroups = false;
  /** Selected existing ad group id (when tiktokCreateAdgroupMode === 'existing'). */
  tiktokCreateAdgroupSelectedId: string | null = null;
  /** Options for optimization goal dropdown (value, label). */
  tiktokOptimizationGoalOptions: { value: string; label: string }[] = [
    { value: 'CLICK', label: 'Clicks' },
    { value: 'CONVERT', label: 'Conversions' },
    { value: 'REACH', label: 'Reach' },
    { value: 'SHOW', label: 'Impressions (Show)' },
    { value: 'VIDEO_VIEW', label: 'Video views' },
    { value: 'TRAFFIC_LANDING_PAGE_VIEW', label: 'Landing page views' },
    { value: 'PAGE_VISIT', label: 'Page visit' },
    { value: 'INSTALL', label: 'App installs' },
    { value: 'LEAD_GENERATION', label: 'Lead generation' },
    { value: 'LEADS', label: 'Leads' },
    { value: 'CONVERSION_LEADS', label: 'Conversion leads' },
    { value: 'ENGAGED_VIEW', label: 'Engaged view' },
    { value: 'ENGAGED_VIEW_FIFTEEN', label: 'Engaged view (15s)' },
    { value: 'MESSAGE', label: 'Messages' },
    { value: 'FOLLOWERS', label: 'Followers' },
    { value: 'PROFILE_VIEWS', label: 'Profile views' },
    { value: 'DESTINATION_VISIT', label: 'Destination visit' },
    { value: 'VALUE', label: 'Value' },
    { value: 'AUTOMATIC_VALUE_OPTIMIZATION', label: 'Automatic value optimization' },
    { value: 'IN_APP_EVENT', label: 'In-app event' },
    { value: 'ENGAGEMENT_SESSION', label: 'Engagement session' },
    { value: 'POST_ENGAGEMNT', label: 'Post engagement' },
    { value: 'CONVERSATION', label: 'Conversation' },
    { value: 'LEAD_WEB_ENGAGEMENT', label: 'Lead web engagement' },
    { value: 'PREFERRED_LEAD', label: 'Preferred lead' },
    { value: 'MESSAGE_CLUE', label: 'Message clue' },
    { value: 'ANCHOR_CLICK', label: 'Anchor click' },
    { value: 'ANCHOR_CLICK_PURCHASE', label: 'Anchor click purchase' },
    { value: 'MT_LIVE_FOLLOW', label: 'Live follow' },
    { value: 'MT_LIVE_ROOM', label: 'Live room' },
    { value: 'MT_LIVE_SHOPPING', label: 'Live shopping' },
    { value: 'PRODUCT_CLICK_IN_LIVE', label: 'Product click in live' },
    { value: 'A3', label: 'A3' },
  ];
  tiktokCreateAdgroupId: string | null = null;
  tiktokCreateAdName = '';
  tiktokCreateAdLink = '';
  tiktokCreateAdCaption = '';
  /** Optional. TikTok video ID from Ads Manager or upload API; used as creatives[0].video_id */
  tiktokCreateAdVideoId = '';
  /** Optional. TikTok image IDs (comma-separated) from Ads Manager or upload API; used as creatives[0].image_ids */
  tiktokCreateAdImageIds = '';
  /** Optional direct image file upload; backend uploads to TikTok and uses returned image_id. */
  tiktokCreateAdImageFile: File | null = null;
  tiktokCreateAdImagePreviewUrl: string | null = null;
  /** AI-generated image URL; sent to backend for server-side download + upload to TikTok. */
  tiktokCreateAdGeneratedImageUrl: string | null = null;
  /** Optional direct video file upload; backend uploads to TikTok and uses returned video_id. */
  tiktokCreateAdVideoFile: File | null = null;
  tiktokCreateAdVideoPreviewUrl: string | null = null;
  /** AI-generated video URL; displayed when generateAd returns data.video. */
  tiktokCreateAdGeneratedVideoUrl: string | null = null;
  isTiktokCreateSubmitting = false;
  tiktokCreateStep: 1 | 2 | 3 = 1;

  // TikTok AI ad generation
  tiktokCreateAdSelectedProductId: string = '';
  tiktokCreateAdSelectedLandingPageName: string = '';
  tiktokCreateAdLandingPages: { name: string }[] = [];
  isLoadingTiktokProductForAd: boolean = false;
  isTiktokGenerateAdLoading: boolean = false;

  // Campaigns tab
  tiktokCampaignsTabList: TiktokCampaign[] = [];
  isLoadingTiktokCampaignsTab = false;
  tiktokCampaignsTabPage = 1;
  tiktokCampaignsTabTotalPages = 0;
  tiktokCampaignsTabTotalNumber = 0;
  // Campaign view modal
  isTiktokCampaignViewOpen = false;
  selectedTiktokCampaignForView: TiktokCampaign | null = null;
  tiktokCampaignChildAdgroups: TiktokAdgroup[] = [];
  isLoadingCampaignChildAdgroups = false;
  // Campaign edit modal
  isTiktokCampaignEditOpen = false;
  selectedTiktokCampaignForEdit: TiktokCampaign | null = null;
  tiktokCampaignEditForm = { campaign_name: '', budget: 0, budget_mode: '', operation_status: '' };
  isTiktokCampaignEditSubmitting = false;

  // Adgroups tab
  tiktokAdgroupsTabList: TiktokAdgroup[] = [];
  isLoadingTiktokAdgroupsTab = false;
  tiktokAdgroupsTabPage = 1;
  tiktokAdgroupsTabTotalPages = 0;
  tiktokAdgroupsTabTotalNumber = 0;
  tiktokAdgroupsFilterCampaignId: string | null = null;
  tiktokAdgroupsFilterCampaigns: TiktokCampaign[] = [];
  tiktokAdsLookupAdgroups: TiktokAdgroup[] = [];
  // Adgroup view modal
  isTiktokAdgroupViewOpen = false;
  selectedTiktokAdgroupForView: TiktokAdgroup | null = null;
  tiktokAdgroupChildAds: TiktokAd[] = [];
  isLoadingAdgroupChildAds = false;
  // Adgroup edit modal
  isTiktokAdgroupEditOpen = false;
  selectedTiktokAdgroupForEdit: TiktokAdgroup | null = null;
  tiktokAdgroupEditForm = { adgroup_name: '', budget: 0, bid_price: 0, operation_status: '' };
  isTiktokAdgroupEditSubmitting = false;

  // TikTok Ad view/edit modals
  isTiktokAdViewOpen = false;
  selectedTiktokAdForView: TiktokAd | null = null;
  tiktokAdViewImages: TiktokImageInfo[] = [];
  tiktokAdViewVideos: TiktokVideoInfo[] = [];
  isLoadingTiktokAdCreatives = false;
  isTiktokAdEditOpen = false;
  selectedTiktokAdForEdit: TiktokAd | null = null;
  tiktokAdEditForm = { ad_name: '', landing_page_url: '', call_to_action: '', operation_status: '', ad_text: '' };
  isTiktokAdEditSubmitting = false;

  // TikTok metrics (reporting)
  tiktokAdMetrics: Record<string, TiktokMetrics> = {};
  tiktokAdgroupMetrics: Record<string, TiktokMetrics> = {};
  tiktokCampaignMetrics: Record<string, TiktokMetrics> = {};
  isLoadingTiktokAdMetrics = false;
  isLoadingTiktokAdgroupMetrics = false;
  isLoadingTiktokCampaignMetrics = false;

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
    private productService: ProductService,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadPriorityItems();
    this.loadSchedule();
    // Check query params for OAuth callback (e.g. ?channel=tiktok&status=connected)
    const params = new URLSearchParams(window.location.search);
    const channel = params.get('channel');
    const status = params.get('status');
    if (channel === 'tiktok' && status === 'connected') {
      this.selectedChannel = 'tiktok';
      this.loadTiktokStatus();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (channel === 'tiktok' && status === 'error') {
      this.selectedChannel = 'tiktok';
      const msg = params.get('message') || 'TikTok connection failed';
      this.snackBar.open(msg, 'Close', { duration: 5000 });
      window.history.replaceState({}, '', window.location.pathname);
    }
    // Load overview stats if on overview channel
    if (this.selectedChannel === 'overview') {
      this.loadOverviewStats();
      this.loadTiktokStatus();
    }
    // Load ads when Ads section is selected and Meta channel is active
    if (this.selectedChannel === 'meta' && this.selectedMetaSection === 'ads') {
      this.loadAds();
    }
    if (this.selectedChannel === 'tiktok') {
      this.loadTiktokStatus();
    }
  }

  onChannelChange(channel: 'overview' | 'meta' | 'twitter' | 'tiktok' | 'youtube' | 'google') {
    this.selectedChannel = channel;
    if (channel === 'overview') {
      this.loadOverviewStats();
      if (this.tiktokStatus.connected) {
        this.loadTiktokOverviewStats();
      } else {
        this.loadTiktokStatus();
      }
    } else if (channel === 'meta' && this.selectedMetaSection === 'posts') {
      this.loadPriorityItems();
    } else if (channel === 'meta' && this.selectedMetaSection === 'ads') {
      this.loadAds();
    } else if (channel === 'tiktok') {
      this.loadTiktokStatus();
    }
  }

  onTiktokSectionChange(section: 'posts' | 'campaigns' | 'adgroups' | 'ads') {
    this.selectedTiktokSection = section;
    if (section === 'ads') {
      this.loadTiktokAdvertisers();
      this.loadTiktokAds();
      this.loadTiktokAdsLookupData();
    } else if (section === 'campaigns') {
      this.loadTiktokCampaignsTab();
    } else if (section === 'adgroups') {
      this.loadTiktokAdgroupsTab();
      this.loadTiktokAdgroupsFilterCampaigns();
    }
  }

  /** Privacy options from creator_info or default list */
  get tiktokPrivacyOptions(): string[] {
    const fromApi = this.tiktokCreatorInfo?.privacy_level_options;
    if (fromApi && fromApi.length > 0) return fromApi;
    return ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'];
  }

  loadTiktokAdvertisers() {
    if (!this.tiktokStatus.connected) return;
    this.isLoadingTiktokAdvertisers = true;
    this.marketingService.getTiktokAdvertisers().subscribe({
      next: (res) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          this.tiktokAdvertisersList = res.data;
          if (!this.selectedTiktokAdvertiserId && this.tiktokStatus.advertiserId)
            this.selectedTiktokAdvertiserId = this.tiktokStatus.advertiserId;
          if (!this.selectedTiktokAdvertiserId && this.tiktokAdvertisersList.length > 0) {
            const first = this.tiktokAdvertisersList[0];
            this.selectedTiktokAdvertiserId = first.advertiser_id || first.id || null;
          }
        }
        this.isLoadingTiktokAdvertisers = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingTiktokAdvertisers = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTiktokStatus() {
    this.isLoadingTiktokStatus = true;
    this.marketingService.getTiktokStatus().subscribe({
      next: (res) => {
        if (res.success && res.data) this.tiktokStatus = res.data;
        this.isLoadingTiktokStatus = false;
        if (this.tiktokStatus.connected) this.onTiktokStatusReady();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingTiktokStatus = false;
        this.cdr.detectChanges();
      },
    });
  }

  private onTiktokStatusReady() {
    if (this.selectedChannel === 'overview') {
      this.loadTiktokOverviewStats();
    } else if (this.selectedTiktokSection === 'ads') {
      this.loadTiktokAdvertisers();
      this.loadTiktokAds();
      this.loadTiktokAdsLookupData();
    } else if (this.selectedTiktokSection === 'campaigns') {
      this.loadTiktokCampaignsTab();
    } else if (this.selectedTiktokSection === 'adgroups') {
      this.loadTiktokAdgroupsTab();
      this.loadTiktokAdgroupsFilterCampaigns();
    }
  }

  connectTiktok() {
    this.marketingService.getTiktokOAuthStartUrl().subscribe({
      next: (res) => {
        if (res.success && res.data?.redirectUrl) window.location.href = res.data.redirectUrl;
        else this.snackBar.open('Could not get TikTok connect URL', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to start TikTok connection', 'Close', { duration: 3000 });
      },
    });
  }

  disconnectTiktok() {
    if (!confirm('Are you sure you want to disconnect TikTok Ads? This will remove stored credentials.')) {
      return;
    }
    this.marketingService.disconnectTiktok().subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('TikTok Ads disconnected successfully', 'Close', { duration: 3000 });
          this.tiktokStatus = { connected: false, advertiserId: null, openId: null, displayName: null };
          this.tiktokAdvertisersList = [];
          this.tiktokAdsList = [];
          this.selectedTiktokAdvertiserId = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to disconnect TikTok Ads', 'Close', { duration: 3000 });
      },
    });
  }

  loadTiktokAds() {
    if (!this.tiktokStatus.connected) return;
    this.isLoadingTiktokAds = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    this.marketingService.getTiktokAds({ advertiser_id: advertiserId, page: this.tiktokAdsPage, page_size: 10 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tiktokAdsList = res.data.list || [];
          this.tiktokAdsTotalPages = res.data.total_page ?? 0;
          this.tiktokAdsTotalNumber = res.data.total_number ?? 0;
          this.loadTiktokMetrics('AUCTION_AD');
        }
        this.isLoadingTiktokAds = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to load TikTok ads', 'Close', { duration: 3000 });
        this.isLoadingTiktokAds = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateTiktokAdStatus(ad: TiktokAd, enable: boolean) {
    const adId = ad.ad_id;
    const status = enable ? 'ENABLE' : 'DISABLE';
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    this.isTiktokAdStatusUpdating[adId] = true;
    this.marketingService.updateTiktokAdStatus(adId, status, advertiserId).subscribe({
      next: () => {
        this.isTiktokAdStatusUpdating[adId] = false;
        this.snackBar.open(enable ? 'Ad enabled' : 'Ad disabled', 'Close', { duration: 2000 });
        this.loadTiktokAds();
      },
      error: (err) => {
        this.isTiktokAdStatusUpdating[adId] = false;
        this.snackBar.open(err.error?.error || 'Failed to update ad status', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  loadTiktokCreatorInfo() {
    if (!this.tiktokStatus.connected) return;
    this.marketingService.getTiktokCreatorInfo().subscribe({
      next: (res) => {
        if (res.success && res.data) this.tiktokCreatorInfo = res.data;
      },
      error: () => {},
    });
  }

  submitTiktokPostPhoto() {
    const urls = this.tiktokPostPhotoUrls.trim().split(/\s+/).filter(Boolean);
    if (urls.length === 0) {
      this.snackBar.open('Enter at least one image URL', 'Close', { duration: 3000 });
      return;
    }
    const body: TiktokPostPhotoRequest = {
      photo_images: urls,
      photo_cover_index: this.tiktokPostPhotoCoverIndex,
      title: this.tiktokPostTitle.trim() || undefined,
      description: this.tiktokPostDescription.trim() || undefined,
      privacy_level: this.tiktokPostPrivacy,
    };
    this.isTiktokPosting = true;
    this.marketingService.postTiktokPhoto(body).subscribe({
      next: (res) => {
        this.isTiktokPosting = false;
        if (res.success && res.data?.publish_id) {
          this.snackBar.open('Post submitted. Publish ID: ' + res.data!.publish_id, 'Close', { duration: 4000 });
          this.tiktokPostPhotoUrls = '';
          this.tiktokPostTitle = '';
          this.tiktokPostDescription = '';
          this.pollTiktokPostStatus(res.data!.publish_id);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokPosting = false;
        this.snackBar.open(err.error?.error || 'Failed to post photo', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  submitTiktokPostVideo() {
    const url = this.tiktokPostVideoUrl.trim();
    if (!url) {
      this.snackBar.open('Enter a video URL', 'Close', { duration: 3000 });
      return;
    }
    const body: TiktokPostVideoRequest = {
      video_url: url,
      title: this.tiktokPostVideoTitle.trim() || undefined,
      privacy_level: this.tiktokPostVideoPrivacy,
      disable_comment: this.tiktokPostVideoDisableComment,
      disable_duet: this.tiktokPostVideoDisableDuet,
      disable_stitch: this.tiktokPostVideoDisableStitch,
    };
    this.isTiktokPostingVideo = true;
    this.marketingService.postTiktokVideo(body).subscribe({
      next: (res) => {
        this.isTiktokPostingVideo = false;
        if (res.success && res.data?.publish_id) {
          this.snackBar.open('Video post submitted. Publish ID: ' + res.data!.publish_id, 'Close', { duration: 4000 });
          this.tiktokPostVideoUrl = '';
          this.tiktokPostVideoTitle = '';
          this.pollTiktokPostStatus(res.data!.publish_id);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokPostingVideo = false;
        this.snackBar.open(err.error?.error || 'Failed to post video', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  private pollTiktokPostStatus(publishId: string, attempt = 0) {
    const maxAttempts = 20;
    const delayMs = 3000;
    if (attempt >= maxAttempts) return;
    this.marketingService.getTiktokPostStatus(publishId).subscribe({
      next: (res) => {
        if (!res.success || !res.data) return;
        const status = (res.data as { status?: string }).status;
        if (status === 'PUBLISH_COMPLETE' || status === 'FAILED') {
          this.snackBar.open(
            status === 'PUBLISH_COMPLETE' ? 'Post published successfully' : 'Post failed: ' + (res.data as { fail_reason?: string }).fail_reason,
            'Close',
            { duration: 4000 }
          );
          return;
        }
        setTimeout(() => this.pollTiktokPostStatus(publishId, attempt + 1), delayMs);
      },
    });
  }

  openTiktokCreateAdModal() {
    this.tiktokCreateStep = 1;
    this.tiktokCreateCampaignMode = 'new';
    this.tiktokCreateCampaignName = '';
    this.tiktokCreateObjectiveType = 'CONVERSIONS';
    this.tiktokCreateCampaignId = null;
    this.tiktokCreateAdgroupMode = 'new';
    this.tiktokCreateAdgroupSelectedId = null;
    this.tiktokAdgroupsList = [];
    this.tiktokCreateAdgroupName = '';
    this.tiktokCreateAdgroupBudget = 50;
    this.tiktokCreateAdgroupBillingEvent = 'CPC';
    this.tiktokCreateAdgroupPlacementType = 'PLACEMENT_TYPE_AUTOMATIC';
    this.tiktokCreateAdgroupPlacements = ['PLACEMENT_TIKTOK'];
    this.tiktokCreateAdgroupScheduleType = 'SCHEDULE_FROM_NOW';
    const scheduleStart = new Date();
    scheduleStart.setHours(scheduleStart.getHours() + 1, 0, 0, 0);
    this.tiktokCreateAdgroupScheduleStart = scheduleStart.toISOString().slice(0, 16);
    this.tiktokCreateAdgroupScheduleEnd = '';
    this.tiktokCreateAdgroupOptimizationGoal = 'CLICK';
    this.tiktokCreateAdgroupLocationIds = ['6255148'];
    this.tiktokCreateAdgroupId = null;
    this.tiktokCreateAdName = '';
    this.tiktokCreateAdLink = '';
    this.tiktokCreateAdCaption = '';
    this.tiktokCreateAdVideoId = '';
    this.tiktokCreateAdImageIds = '';
    this.tiktokCreateAdImageFile = null;
    this.tiktokCreateAdVideoFile = null;
    this.tiktokCreateAdGeneratedImageUrl = null;
    this.tiktokCreateAdImagePreviewUrl = null;
    this.tiktokCreateAdGeneratedVideoUrl = null;
    if (this.tiktokCreateAdVideoPreviewUrl) { URL.revokeObjectURL(this.tiktokCreateAdVideoPreviewUrl); this.tiktokCreateAdVideoPreviewUrl = null; }
    this.tiktokCreateAdSelectedProductId = '';
    this.tiktokCreateAdSelectedLandingPageName = '';
    this.tiktokCreateAdLandingPages = [];
    this.isLoadingTiktokProductForAd = false;
    this.isTiktokGenerateAdLoading = false;
    this.isTiktokCreateAdModalOpen = true;
    this.loadTiktokCampaigns();
    this.loadTiktokLocations();
  }

  loadTiktokLocations() {
    this.marketingService.getTiktokTargetingLocations().subscribe({
      next: (res) => {
        if (res.success && res.data) this.tiktokLocationOptions = res.data;
        else this.tiktokLocationOptions = [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.tiktokLocationOptions = [];
        this.cdr.detectChanges();
      },
    });
  }

  loadTiktokCampaigns() {
    if (!this.tiktokStatus.connected) return;
    this.isLoadingTiktokCampaigns = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    this.marketingService.getTiktokCampaigns({ advertiser_id: advertiserId, page: 1, page_size: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data?.list) {
          this.tiktokCampaignsList = res.data.list;
        } else {
          this.tiktokCampaignsList = [];
        }
        this.isLoadingTiktokCampaigns = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.tiktokCampaignsList = [];
        this.isLoadingTiktokCampaigns = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTiktokAdgroups() {
    if (!this.tiktokCreateCampaignId || !this.tiktokStatus.connected) return;
    this.isLoadingTiktokAdgroups = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    this.marketingService.getTiktokAdgroups({
      advertiser_id: advertiserId,
      campaign_id: this.tiktokCreateCampaignId,
      page: 1,
      page_size: 100,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data?.list) {
          this.tiktokAdgroupsList = res.data.list;
        } else {
          this.tiktokAdgroupsList = [];
        }
        this.isLoadingTiktokAdgroups = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.tiktokAdgroupsList = [];
        this.isLoadingTiktokAdgroups = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeTiktokCreateAdModal() {
    this.isTiktokCreateAdModalOpen = false;
  }

  // --- Campaigns tab ---

  loadTiktokCampaignsTab() {
    if (!this.tiktokStatus.connected) return;
    this.isLoadingTiktokCampaignsTab = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    this.marketingService.getTiktokCampaigns({ advertiser_id: advertiserId, page: this.tiktokCampaignsTabPage, page_size: 10 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tiktokCampaignsTabList = res.data.list || [];
          this.tiktokCampaignsTabTotalPages = res.data.total_page ?? 0;
          this.tiktokCampaignsTabTotalNumber = res.data.total_number ?? 0;
          this.loadTiktokMetrics('AUCTION_CAMPAIGN');
        }
        this.isLoadingTiktokCampaignsTab = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to load campaigns', 'Close', { duration: 3000 });
        this.isLoadingTiktokCampaignsTab = false;
        this.cdr.detectChanges();
      },
    });
  }

  openTiktokCampaignView(campaign: TiktokCampaign) {
    this.selectedTiktokCampaignForView = campaign;
    this.isTiktokCampaignViewOpen = true;
    this.tiktokCampaignChildAdgroups = [];
    this.isLoadingCampaignChildAdgroups = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    const campaignId = campaign.campaign_id;
    if (campaignId) {
      this.marketingService.getTiktokAdgroups({ advertiser_id: advertiserId, campaign_id: campaignId, page: 1, page_size: 100 }).subscribe({
        next: (res) => {
          this.tiktokCampaignChildAdgroups = res.success && res.data?.list ? res.data.list : [];
          this.isLoadingCampaignChildAdgroups = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingCampaignChildAdgroups = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.isLoadingCampaignChildAdgroups = false;
    }
  }

  closeTiktokCampaignView() {
    this.isTiktokCampaignViewOpen = false;
    this.selectedTiktokCampaignForView = null;
    this.tiktokCampaignChildAdgroups = [];
  }

  openTiktokCampaignEdit(campaign: TiktokCampaign) {
    this.selectedTiktokCampaignForEdit = campaign;
    this.tiktokCampaignEditForm = {
      campaign_name: (campaign.campaign_name as string) || '',
      budget: Number(campaign['budget']) || 0,
      budget_mode: (campaign['budget_mode'] as string) || '',
      operation_status: (campaign.operation_status || campaign.status) as string || '',
    };
    this.isTiktokCampaignEditOpen = true;
  }

  closeTiktokCampaignEdit() {
    this.isTiktokCampaignEditOpen = false;
    this.selectedTiktokCampaignForEdit = null;
  }

  submitTiktokCampaignEdit() {
    if (!this.selectedTiktokCampaignForEdit?.campaign_id) return;
    this.isTiktokCampaignEditSubmitting = true;
    const body: Record<string, unknown> = {};
    if (this.tiktokCampaignEditForm.campaign_name) body['campaign_name'] = this.tiktokCampaignEditForm.campaign_name;
    if (this.tiktokCampaignEditForm.budget) body['budget'] = this.tiktokCampaignEditForm.budget;
    if (this.tiktokCampaignEditForm.budget_mode) body['budget_mode'] = this.tiktokCampaignEditForm.budget_mode;
    if (this.tiktokCampaignEditForm.operation_status) body['operation_status'] = this.tiktokCampaignEditForm.operation_status;
    this.marketingService.updateTiktokCampaign(this.selectedTiktokCampaignForEdit.campaign_id, body as any).subscribe({
      next: (res) => {
        this.isTiktokCampaignEditSubmitting = false;
        if (res.success) {
          this.snackBar.open('Campaign updated', 'Close', { duration: 3000 });
          this.closeTiktokCampaignEdit();
          this.loadTiktokCampaignsTab();
        } else {
          this.snackBar.open(res.error || 'Failed to update campaign', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokCampaignEditSubmitting = false;
        this.snackBar.open(err.error?.error || 'Failed to update campaign', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  // --- Adgroups tab ---

  loadTiktokAdgroupsTab() {
    if (!this.tiktokStatus.connected) return;
    this.isLoadingTiktokAdgroupsTab = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    const params: Record<string, any> = { advertiser_id: advertiserId, page: this.tiktokAdgroupsTabPage, page_size: 10 };
    if (this.tiktokAdgroupsFilterCampaignId) params['campaign_id'] = this.tiktokAdgroupsFilterCampaignId;
    this.marketingService.getTiktokAdgroups(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tiktokAdgroupsTabList = res.data.list || [];
          this.tiktokAdgroupsTabTotalPages = res.data.total_page ?? 0;
          this.tiktokAdgroupsTabTotalNumber = res.data.total_number ?? 0;
          this.loadTiktokMetrics('AUCTION_ADGROUP');
        }
        this.isLoadingTiktokAdgroupsTab = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to load ad groups', 'Close', { duration: 3000 });
        this.isLoadingTiktokAdgroupsTab = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTiktokAdgroupsFilterCampaigns() {
    if (!this.tiktokStatus.connected) return;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    this.marketingService.getTiktokCampaigns({ advertiser_id: advertiserId, page: 1, page_size: 100 }).subscribe({
      next: (res) => {
        this.tiktokAdgroupsFilterCampaigns = res.success && res.data?.list ? res.data.list : [];
        this.cdr.detectChanges();
      },
      error: () => { this.tiktokAdgroupsFilterCampaigns = []; },
    });
  }

  onTiktokAdgroupsFilterChange() {
    this.tiktokAdgroupsTabPage = 1;
    this.loadTiktokAdgroupsTab();
  }

  getCampaignName(campaignId: string | undefined): string {
    if (!campaignId) return '—';
    const campaign = this.tiktokAdgroupsFilterCampaigns.find(c => c.campaign_id === campaignId);
    return campaign?.campaign_name || campaignId;
  }

  getAdgroupName(adgroupId: string | undefined): string {
    if (!adgroupId) return '—';
    const adgroup = this.tiktokAdsLookupAdgroups.find(ag => ag.adgroup_id === adgroupId);
    return adgroup?.adgroup_name || adgroupId;
  }

  loadTiktokAdsLookupData() {
    if (!this.tiktokStatus.connected) return;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    if (!this.tiktokAdgroupsFilterCampaigns.length) {
      this.marketingService.getTiktokCampaigns({ advertiser_id: advertiserId, page: 1, page_size: 100 }).subscribe({
        next: (res) => {
          this.tiktokAdgroupsFilterCampaigns = res.success && res.data?.list ? res.data.list : [];
          this.cdr.detectChanges();
        },
        error: () => { this.tiktokAdgroupsFilterCampaigns = []; },
      });
    }
    this.marketingService.getTiktokAdgroups({ advertiser_id: advertiserId, page: 1, page_size: 100 }).subscribe({
      next: (res) => {
        this.tiktokAdsLookupAdgroups = res.success && res.data?.list ? res.data.list : [];
        this.cdr.detectChanges();
      },
      error: () => { this.tiktokAdsLookupAdgroups = []; },
    });
  }

  loadTiktokMetrics(dataLevel: 'AUCTION_AD' | 'AUCTION_ADGROUP' | 'AUCTION_CAMPAIGN') {
    if (!this.tiktokStatus.connected) return;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;

    if (dataLevel === 'AUCTION_AD') this.isLoadingTiktokAdMetrics = true;
    else if (dataLevel === 'AUCTION_ADGROUP') this.isLoadingTiktokAdgroupMetrics = true;
    else this.isLoadingTiktokCampaignMetrics = true;

    this.marketingService.getTiktokReporting({ advertiser_id: advertiserId, data_level: dataLevel, page_size: 200 }).subscribe({
      next: (res) => {
        if (res.success && res.data?.list) {
          const map: Record<string, TiktokMetrics> = {};
          const idKey = dataLevel === 'AUCTION_AD' ? 'ad_id' : dataLevel === 'AUCTION_ADGROUP' ? 'adgroup_id' : 'campaign_id';
          for (const item of res.data.list) {
            const id = item.dimensions?.[idKey];
            if (id) map[id] = item.metrics;
          }
          if (dataLevel === 'AUCTION_AD') this.tiktokAdMetrics = map;
          else if (dataLevel === 'AUCTION_ADGROUP') this.tiktokAdgroupMetrics = map;
          else this.tiktokCampaignMetrics = map;
        }
        if (dataLevel === 'AUCTION_AD') this.isLoadingTiktokAdMetrics = false;
        else if (dataLevel === 'AUCTION_ADGROUP') this.isLoadingTiktokAdgroupMetrics = false;
        else this.isLoadingTiktokCampaignMetrics = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (dataLevel === 'AUCTION_AD') this.isLoadingTiktokAdMetrics = false;
        else if (dataLevel === 'AUCTION_ADGROUP') this.isLoadingTiktokAdgroupMetrics = false;
        else this.isLoadingTiktokCampaignMetrics = false;
        this.cdr.detectChanges();
      },
    });
  }

  getMetric(metricsMap: Record<string, TiktokMetrics>, id: string | undefined, field: keyof TiktokMetrics): string {
    if (!id) return '—';
    const m = metricsMap[id];
    if (!m) return '—';
    const val = m[field];
    if (val === undefined || val === null || val === '') return '—';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (field === 'spend' || field === 'cpc') return num.toFixed(2);
    if (field === 'ctr') return num.toFixed(2) + '%';
    if (field === 'frequency') return num.toFixed(1);
    return num.toLocaleString();
  }

  openTiktokAdgroupView(adgroup: TiktokAdgroup) {
    this.selectedTiktokAdgroupForView = adgroup;
    this.isTiktokAdgroupViewOpen = true;
    this.tiktokAdgroupChildAds = [];
    this.isLoadingAdgroupChildAds = true;
    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;
    const adgroupId = adgroup.adgroup_id;
    if (adgroupId) {
      this.marketingService.getTiktokAds({ advertiser_id: advertiserId, page: 1, page_size: 100 }).subscribe({
        next: (res) => {
          const allAds = res.success && res.data?.list ? res.data.list : [];
          this.tiktokAdgroupChildAds = allAds.filter((ad: TiktokAd) => ad.adgroup_id === adgroupId);
          this.isLoadingAdgroupChildAds = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingAdgroupChildAds = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.isLoadingAdgroupChildAds = false;
    }
  }

  closeTiktokAdgroupView() {
    this.isTiktokAdgroupViewOpen = false;
    this.selectedTiktokAdgroupForView = null;
    this.tiktokAdgroupChildAds = [];
  }

  openTiktokAdgroupEdit(adgroup: TiktokAdgroup) {
    this.selectedTiktokAdgroupForEdit = adgroup;
    this.tiktokAdgroupEditForm = {
      adgroup_name: (adgroup.adgroup_name as string) || '',
      budget: Number(adgroup['budget']) || 0,
      bid_price: Number(adgroup['bid_price']) || 0,
      operation_status: (adgroup.operation_status || adgroup.status) as string || '',
    };
    this.isTiktokAdgroupEditOpen = true;
  }

  closeTiktokAdgroupEdit() {
    this.isTiktokAdgroupEditOpen = false;
    this.selectedTiktokAdgroupForEdit = null;
  }

  submitTiktokAdgroupEdit() {
    if (!this.selectedTiktokAdgroupForEdit?.adgroup_id) return;
    this.isTiktokAdgroupEditSubmitting = true;
    const body: Record<string, unknown> = {};
    if (this.tiktokAdgroupEditForm.adgroup_name) body['adgroup_name'] = this.tiktokAdgroupEditForm.adgroup_name;
    if (this.tiktokAdgroupEditForm.budget) body['budget'] = this.tiktokAdgroupEditForm.budget;
    if (this.tiktokAdgroupEditForm.bid_price) body['bid_price'] = this.tiktokAdgroupEditForm.bid_price;
    if (this.tiktokAdgroupEditForm.operation_status) body['operation_status'] = this.tiktokAdgroupEditForm.operation_status;
    this.marketingService.updateTiktokAdgroup(this.selectedTiktokAdgroupForEdit.adgroup_id, body as any).subscribe({
      next: (res) => {
        this.isTiktokAdgroupEditSubmitting = false;
        if (res.success) {
          this.snackBar.open('Ad group updated', 'Close', { duration: 3000 });
          this.closeTiktokAdgroupEdit();
          this.loadTiktokAdgroupsTab();
        } else {
          this.snackBar.open(res.error || 'Failed to update ad group', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokAdgroupEditSubmitting = false;
        this.snackBar.open(err.error?.error || 'Failed to update ad group', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  // --- TikTok Ad view/edit ---

  openTiktokAdView(ad: TiktokAd) {
    this.selectedTiktokAdForView = ad;
    this.isTiktokAdViewOpen = true;
    this.tiktokAdViewImages = [];
    this.tiktokAdViewVideos = [];
    this.isLoadingTiktokAdCreatives = false;

    const imageIds: string[] = Array.isArray(ad['image_ids']) ? ad['image_ids'] as string[] : [];
    const videoId = ad['video_id'] as string | undefined;
    const hasCreatives = imageIds.length > 0 || !!videoId;

    if (hasCreatives) {
      this.isLoadingTiktokAdCreatives = true;
      let pending = 0;
      const done = () => { pending--; if (pending <= 0) { this.isLoadingTiktokAdCreatives = false; this.cdr.detectChanges(); } };

      if (imageIds.length > 0) {
        pending++;
        this.marketingService.getTiktokImageInfo(imageIds).subscribe({
          next: (res) => { this.tiktokAdViewImages = res.success && res.data?.list ? res.data.list : []; done(); },
          error: () => { done(); },
        });
      }
      if (videoId) {
        pending++;
        this.marketingService.getTiktokVideoInfo([videoId]).subscribe({
          next: (res) => { this.tiktokAdViewVideos = res.success && res.data?.list ? res.data.list : []; done(); },
          error: () => { done(); },
        });
      }
    }
  }

  closeTiktokAdView() {
    this.isTiktokAdViewOpen = false;
    this.selectedTiktokAdForView = null;
    this.tiktokAdViewImages = [];
    this.tiktokAdViewVideos = [];
  }

  openTiktokAdEdit(ad: TiktokAd) {
    this.selectedTiktokAdForEdit = ad;
    this.tiktokAdEditForm = {
      ad_name: (ad.ad_name as string) || '',
      landing_page_url: (ad['landing_page_url'] as string) || '',
      call_to_action: (ad['call_to_action'] as string) || '',
      operation_status: (ad.operation_status || ad.status) as string || '',
      ad_text: (ad['ad_text'] as string) || '',
    };
    this.isTiktokAdEditOpen = true;
  }

  closeTiktokAdEdit() {
    this.isTiktokAdEditOpen = false;
    this.selectedTiktokAdForEdit = null;
  }

  submitTiktokAdEdit() {
    if (!this.selectedTiktokAdForEdit?.ad_id) return;
    this.isTiktokAdEditSubmitting = true;
    const body: Record<string, unknown> = {};
    if (this.selectedTiktokAdForEdit.adgroup_id) body['adgroup_id'] = this.selectedTiktokAdForEdit.adgroup_id;
    if (this.tiktokAdEditForm.ad_name) body['ad_name'] = this.tiktokAdEditForm.ad_name;
    if (this.tiktokAdEditForm.landing_page_url) body['landing_page_url'] = this.tiktokAdEditForm.landing_page_url;
    if (this.tiktokAdEditForm.call_to_action) body['call_to_action'] = this.tiktokAdEditForm.call_to_action;
    if (this.tiktokAdEditForm.operation_status) body['operation_status'] = this.tiktokAdEditForm.operation_status;
    if (this.tiktokAdEditForm.ad_text) body['ad_text'] = this.tiktokAdEditForm.ad_text;
    this.marketingService.updateTiktokAd(this.selectedTiktokAdForEdit.ad_id, body as any).subscribe({
      next: (res) => {
        this.isTiktokAdEditSubmitting = false;
        if (res.success) {
          this.snackBar.open('Ad updated', 'Close', { duration: 3000 });
          this.closeTiktokAdEdit();
          this.loadTiktokAds();
        } else {
          this.snackBar.open(res.error || 'Failed to update ad', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokAdEditSubmitting = false;
        this.snackBar.open(err.error?.error || 'Failed to update ad', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  /** Proceed to step 2 when user selected an existing campaign. */
  submitTiktokCreateStep1UseExisting() {
    if (!this.tiktokCreateCampaignId) {
      this.snackBar.open('Select a campaign', 'Close', { duration: 3000 });
      return;
    }
    this.tiktokCreateStep = 2;
    this.tiktokCreateAdgroupMode = 'new';
    this.tiktokCreateAdgroupSelectedId = null;
    this.tiktokAdgroupsList = [];
    this.loadTiktokAdgroups();
    this.cdr.detectChanges();
  }

  submitTiktokCreateStep1() {
    if (this.tiktokCreateCampaignMode === 'existing') {
      this.submitTiktokCreateStep1UseExisting();
      return;
    }
    if (!this.tiktokCreateCampaignName.trim()) {
      this.snackBar.open('Campaign name is required', 'Close', { duration: 3000 });
      return;
    }
    this.isTiktokCreateSubmitting = true;
    this.marketingService.createTiktokCampaign({
      campaign_name: this.tiktokCreateCampaignName.trim(),
      objective_type: this.tiktokCreateObjectiveType,
      budget_mode: 'BUDGET_MODE_INFINITE',
    }).subscribe({
      next: (res) => {
        this.isTiktokCreateSubmitting = false;
        if (res.success && res.data?.campaign_id) {
          this.tiktokCreateCampaignId = res.data.campaign_id;
          this.tiktokCreateStep = 2;
        } else {
          this.snackBar.open(res.error || 'Failed to create campaign', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokCreateSubmitting = false;
        this.snackBar.open(err.error?.error || 'Failed to create campaign', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  onTiktokCreateAdImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    this.tiktokCreateAdImageFile = file;
    this.tiktokCreateAdGeneratedImageUrl = null;
    if (this.tiktokCreateAdImagePreviewUrl) {
      URL.revokeObjectURL(this.tiktokCreateAdImagePreviewUrl);
      this.tiktokCreateAdImagePreviewUrl = null;
    }
    if (file) {
      this.tiktokCreateAdImagePreviewUrl = URL.createObjectURL(file);
    }
  }

  onTiktokCreateAdVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] || null;
    this.tiktokCreateAdVideoFile = file;
    this.tiktokCreateAdGeneratedVideoUrl = null;
    if (this.tiktokCreateAdVideoPreviewUrl) {
      URL.revokeObjectURL(this.tiktokCreateAdVideoPreviewUrl);
      this.tiktokCreateAdVideoPreviewUrl = null;
    }
    if (file) {
      this.tiktokCreateAdVideoPreviewUrl = URL.createObjectURL(file);
    }
  }

  onTiktokCreateAdProductChange() {
    this.tiktokCreateAdSelectedLandingPageName = '';
    this.tiktokCreateAdLandingPages = [];
    if (!this.tiktokCreateAdSelectedProductId) {
      this.cdr.markForCheck();
      return;
    }
    this.isLoadingTiktokProductForAd = true;
    this.productService.fetchProduct(this.tiktokCreateAdSelectedProductId).subscribe({
      next: (response) => {
        if (response.success && response.data?.landingPages?.length) {
          this.tiktokCreateAdLandingPages = response.data.landingPages.map((lp: { name: string }) => ({ name: lp.name }));
        } else {
          this.tiktokCreateAdLandingPages = [];
        }
        this.isLoadingTiktokProductForAd = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.tiktokCreateAdLandingPages = [];
        this.isLoadingTiktokProductForAd = false;
        this.cdr.markForCheck();
      },
    });
  }

  generateTiktokAdCopy() {
    if (!this.tiktokCreateAdSelectedProductId) return;
    this.isTiktokGenerateAdLoading = true;
    const landingPageName = this.tiktokCreateAdSelectedLandingPageName || undefined;
    this.marketingService.generateTiktokAd(this.tiktokCreateAdSelectedProductId, landingPageName).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          if (data.ads?.length > 0) {
            this.tiktokCreateAdName = data.ads[0].name;
            this.tiktokCreateAdCaption = data.ads[0].primary_text;
          }
          if (data.link) {
            this.tiktokCreateAdLink = data.link;
          }
          const imageUrl = data.images?.[0] || (typeof data.image === 'string' ? data.image : '');
          if (imageUrl) {
            this.tiktokCreateAdGeneratedImageUrl = imageUrl;
            this.tiktokCreateAdImagePreviewUrl = imageUrl;
            this.tiktokCreateAdImageFile = null;
          }
          const videoUrl = data.video || '';
          if (videoUrl) {
            this.tiktokCreateAdGeneratedVideoUrl = videoUrl;
            this.tiktokCreateAdVideoPreviewUrl = videoUrl;
            this.tiktokCreateAdVideoFile = null;
          }
          this.isTiktokGenerateAdLoading = false;
          this.snackBar.open('Ad generated. Review and edit as needed.', 'Close', { duration: 5000 });
        } else {
          this.isTiktokGenerateAdLoading = false;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error generating TikTok ad copy:', err);
        this.snackBar.open(err.error?.message || 'Failed to generate ad copy', 'Close', { duration: 5000 });
        this.isTiktokGenerateAdLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /** Proceed to step 3 when user selected an existing ad group. */
  submitTiktokCreateStep2UseExisting() {
    if (!this.tiktokCreateAdgroupSelectedId) {
      this.snackBar.open('Select an ad group', 'Close', { duration: 3000 });
      return;
    }
    this.tiktokCreateAdgroupId = this.tiktokCreateAdgroupSelectedId;
    this.tiktokCreateStep = 3;
    this.cdr.detectChanges();
  }

  submitTiktokCreateStep2() {
    if (this.tiktokCreateAdgroupMode === 'existing') {
      this.submitTiktokCreateStep2UseExisting();
      return;
    }
    if (!this.tiktokCreateAdgroupName.trim() || !this.tiktokCreateCampaignId) return;
    this.isTiktokCreateSubmitting = true;
    const payload: Parameters<MarketingService['createTiktokAdgroup']>[0] = {
      campaign_id: this.tiktokCreateCampaignId,
      adgroup_name: this.tiktokCreateAdgroupName.trim(),
      budget: this.tiktokCreateAdgroupBudget,
      budget_mode: 'BUDGET_MODE_DAY',
      billing_event: this.tiktokCreateAdgroupBillingEvent,
      bid_price: this.tiktokCreateAdgroupBidPrice,
      placement_type: this.tiktokCreateAdgroupPlacementType,
      schedule_type: this.tiktokCreateAdgroupScheduleType,
      optimization_goal: this.tiktokCreateAdgroupOptimizationGoal,
      location_ids: this.tiktokCreateAdgroupLocationIds.length > 0 ? [...this.tiktokCreateAdgroupLocationIds] : undefined,
    };
    if (this.tiktokCreateAdgroupPlacementType === 'PLACEMENT_TYPE_NORMAL' && this.tiktokCreateAdgroupPlacements.length > 0) {
      payload['placements'] = [...this.tiktokCreateAdgroupPlacements];
    }
    if (this.tiktokCreateAdgroupScheduleStart) {
      payload['schedule_start_time'] = this.tiktokCreateAdgroupScheduleStart;
    }
    if (this.tiktokCreateAdgroupScheduleType === 'SCHEDULE_START_END' && this.tiktokCreateAdgroupScheduleEnd) {
      payload['schedule_end_time'] = this.tiktokCreateAdgroupScheduleEnd;
    }
    this.marketingService.createTiktokAdgroup(payload).subscribe({
      next: (res) => {
        this.isTiktokCreateSubmitting = false;
        if (res.success && res.data?.adgroup_id) {
          this.tiktokCreateAdgroupId = res.data.adgroup_id;
          this.tiktokCreateStep = 3;
        } else {
          this.snackBar.open(res.error || 'Failed to create ad group', 'Close', { duration: 3000 });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTiktokCreateSubmitting = false;
        this.snackBar.open(err.error?.error || 'Failed to create ad group', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  submitTiktokCreateStep3() {
    if (!this.tiktokCreateAdName.trim() || !this.tiktokCreateAdgroupId) return;
    this.isTiktokCreateSubmitting = true;
    const createAd = (opts?: { uploadedImageIds?: string[]; uploadedVideoId?: string }) => {
      const adName = this.tiktokCreateAdName.trim();
      const creative: Record<string, unknown> = {
        ad_name: adName,
        ad_text: this.tiktokCreateAdCaption?.trim() || adName,
        landing_page_url: this.tiktokCreateAdLink?.trim() || '',
        call_to_action: 'LEARN_MORE',
        operation_status: 'ENABLE',
      };
      const manualVideoId = this.tiktokCreateAdVideoId?.trim();
      const imageIdsStr = this.tiktokCreateAdImageIds?.trim();
      // Prefer uploaded video id (material_id from TikTok) if present; otherwise fall back to manual video ID.
      if (opts?.uploadedVideoId) {
        creative['video_id'] = opts.uploadedVideoId;
      } else if (manualVideoId) {
        creative['video_id'] = manualVideoId;
      }
      const manualImageIds = imageIdsStr ? imageIdsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const allImageIds = [...manualImageIds, ...(opts?.uploadedImageIds || [])];
      if (allImageIds.length > 0) creative['image_ids'] = allImageIds;

      const body: TiktokAdCreateRequest = {
        adgroup_id: this.tiktokCreateAdgroupId as string,
        ad_name: adName,
        creatives: [creative],
      };
      this.marketingService.createTiktokAd(body).subscribe({
        next: (res) => {
          this.isTiktokCreateSubmitting = false;
          if (res.success) {
            this.snackBar.open('Ad created successfully', 'Close', { duration: 3000 });
            this.closeTiktokCreateAdModal();
            this.loadTiktokAds();
          } else {
            this.snackBar.open(res.error || 'Failed to create ad', 'Close', { duration: 3000 });
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isTiktokCreateSubmitting = false;
          this.snackBar.open(err.error?.error || 'Failed to create ad', 'Close', { duration: 3000 });
          this.cdr.detectChanges();
        },
      });
    };

    const advertiserId = this.selectedTiktokAdvertiserId || this.tiktokStatus.advertiserId || undefined;

    const generatedVideoUrl = (this.tiktokCreateAdGeneratedVideoUrl || '').trim();

    const afterVideoUploaded = (uploadedId: string) => {
      const handleImageUploadResult = (imgRes: any) => {
        if (!imgRes.success || !imgRes.data?.image_id) {
          this.isTiktokCreateSubmitting = false;
          this.snackBar.open(imgRes.error || 'Failed to upload image to TikTok', 'Close', { duration: 3000 });
          this.cdr.detectChanges();
          return;
        }
        createAd({ uploadedVideoId: uploadedId, uploadedImageIds: [imgRes.data.image_id] });
      };
      const handleImageUploadError = (err: any) => {
        this.isTiktokCreateSubmitting = false;
        this.snackBar.open(err.error?.error || 'Failed to upload image to TikTok', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      };

      if (this.tiktokCreateAdImageFile) {
        this.marketingService
          .uploadTiktokAdImage(
            this.tiktokCreateAdImageFile,
            advertiserId || undefined,
            (this.tiktokCreateAdgroupId as string) || undefined
          )
          .subscribe({ next: handleImageUploadResult, error: handleImageUploadError });
      } else if (this.tiktokCreateAdGeneratedImageUrl) {
        this.marketingService
          .uploadTiktokAdImageByUrl(
            this.tiktokCreateAdGeneratedImageUrl,
            advertiserId || undefined,
            (this.tiktokCreateAdgroupId as string) || undefined
          )
          .subscribe({ next: handleImageUploadResult, error: handleImageUploadError });
      } else {
        createAd({ uploadedVideoId: uploadedId });
      }
    };

    const onVideoUploadResponse = (uploadRes: any) => {
      const data = uploadRes.data;
      const uploadedId = data?.video_id;
      if (!uploadRes.success || !uploadedId) {
        this.isTiktokCreateSubmitting = false;
        this.snackBar.open(uploadRes.error || 'Failed to upload video to TikTok', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
        return;
      }
      afterVideoUploaded(uploadedId);
    };

    const onVideoUploadError = (err: any) => {
      this.isTiktokCreateSubmitting = false;
      this.snackBar.open(err.error?.error || 'Failed to upload video to TikTok', 'Close', { duration: 3000 });
      this.cdr.detectChanges();
    };

    // Video from file or from generated URL: upload to TikTok first for video_id, then image (file or URL) for image_id.
    if (this.tiktokCreateAdVideoFile || generatedVideoUrl) {
      const hasManualImageIds = !!this.tiktokCreateAdImageIds?.trim();
      if (!this.tiktokCreateAdImageFile && !this.tiktokCreateAdGeneratedImageUrl && !hasManualImageIds) {
        this.isTiktokCreateSubmitting = false;
        this.snackBar.open('TikTok requires both a video and an image. Please upload/select an image as well.', 'Close', {
          duration: 4000,
        });
        this.cdr.detectChanges();
        return;
      }

      if (this.tiktokCreateAdVideoFile) {
        this.marketingService
          .uploadTiktokAdVideo(this.tiktokCreateAdVideoFile, advertiserId || undefined)
          .subscribe({ next: onVideoUploadResponse, error: onVideoUploadError });
      } else {
        this.marketingService
          .uploadTiktokAdVideoByUrl(generatedVideoUrl, advertiserId || undefined)
          .subscribe({ next: onVideoUploadResponse, error: onVideoUploadError });
      }
      return;
    }

    const imageUploadNext = (uploadRes: any) => {
      if (!uploadRes.success || !uploadRes.data?.image_id) {
        this.isTiktokCreateSubmitting = false;
        this.snackBar.open(uploadRes.error || 'Failed to upload image to TikTok', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
        return;
      }
      createAd({ uploadedImageIds: [uploadRes.data.image_id] });
    };
    const imageUploadError = (err: any) => {
      this.isTiktokCreateSubmitting = false;
      this.snackBar.open(err.error?.error || 'Failed to upload image to TikTok', 'Close', { duration: 3000 });
      this.cdr.detectChanges();
    };

    if (this.tiktokCreateAdImageFile) {
      this.marketingService.uploadTiktokAdImage(
        this.tiktokCreateAdImageFile,
        advertiserId || undefined,
        (this.tiktokCreateAdgroupId as string) || undefined
      ).subscribe({ next: imageUploadNext, error: imageUploadError });
      return;
    }

    if (this.tiktokCreateAdGeneratedImageUrl) {
      this.marketingService.uploadTiktokAdImageByUrl(
        this.tiktokCreateAdGeneratedImageUrl,
        advertiserId || undefined,
        (this.tiktokCreateAdgroupId as string) || undefined
      ).subscribe({ next: imageUploadNext, error: imageUploadError });
      return;
    }

    createAd();
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
      .pushPriority({
        productId: this.selectedProductId,
        channel: 'meta', // Use 'meta' to add to both facebook and instagram
        position: 'front',
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
      .pushPriority({
        productId: this.selectedProductId,
        channel: 'meta', // Use 'meta' to add to both facebook and instagram
        position: 'back',
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

    this.marketingService.clearPriorityItems({ channel: 'meta' }).subscribe({
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
    if (this.allProducts.length === 0) {
      this.loadProducts();
    }
  }

  closeCreateAdModal() {
    this.isCreateAdModalOpen = false;
    this.resetAdForm();
  }

  onCreateAdProductChange() {
    this.createAdSelectedLandingPageName = '';
    this.createAdLandingPages = [];
    if (!this.createAdSelectedProductId) {
      this.cdr.markForCheck();
      return;
    }
    this.isLoadingProductForAd = true;
    this.productService.fetchProduct(this.createAdSelectedProductId).subscribe({
      next: (response) => {
        if (response.success && response.data?.landingPages?.length) {
          this.createAdLandingPages = response.data.landingPages.map((lp: { name: string }) => ({ name: lp.name }));
        } else {
          this.createAdLandingPages = [];
          this.snackBar.open('No landing pages found for this product', 'Close', { duration: 3000 });
        }
        this.isLoadingProductForAd = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching product for ad:', err);
        this.snackBar.open('Failed to load product landing pages', 'Close', { duration: 3000 });
        this.createAdLandingPages = [];
        this.isLoadingProductForAd = false;
        this.cdr.markForCheck();
      },
    });
  }

  generateAdCopy() {
    if (!this.createAdSelectedProductId) return;
    this.isGenerateAdLoading = true;
    const landingPageName = this.createAdSelectedLandingPageName || undefined;
    this.marketingService.generateAd(this.createAdSelectedProductId, landingPageName).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.applyGeneratedAdData(response.data);
          this.snackBar.open('Ad copy generated. Review and edit as needed, then create campaign.', 'Close', { duration: 5000 });
        }
        this.isGenerateAdLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error generating ad copy:', err);
        this.snackBar.open(err.error?.message || 'Failed to generate ad copy', 'Close', { duration: 5000 });
        this.isGenerateAdLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private applyGeneratedAdData(data: GenerateAdData) {
    this.adForm.campaign.name = data.campaign_name;
    this.adForm.adset.name = data.adset_name;
    this.createAdDailyBudgetShillings = 500;
    if (this.adForm.adset.targeting.geo_locations) {
      this.adForm.adset.targeting.geo_locations.countries = ['KE'];
    } else {
      this.adForm.adset.targeting.geo_locations = { countries: ['KE'] };
    }
    const fallbackImageUrl = typeof data.image === 'string' ? data.image : (Array.isArray(data.image) ? (data.image[0] ?? '') : '');
    this.adForm.ads = data.ads.map((ad, i) => {
      const imageUrl = (data.images && data.images[i]) ? data.images[i] : fallbackImageUrl;
      return {
        name: ad.name,
        status: 'PAUSED' as const,
        creative: {
          link: data.link,
          message: ad.primary_text,
          headline: ad.headline,
          description: ad.description,
          call_to_action: 'SHOP_NOW',
          image_url: imageUrl,
        },
      };
    });
    this.createAdImageFiles = this.adForm.ads.map(() => null);
    this.cdr.markForCheck();
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
    this.marketingService.getOverviewStats({ date_preset: this.selectedOverviewDatePreset }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.overviewStats = {
            totalSpend: response.data.totalSpend || 0,
            activeAds: response.data.activeAds || 0,
            totalAds: response.data.totalAds || 0,
            clicks: response.data.clicks || 0,
            impressions: response.data.impressions || 0,
            reach: response.data.reach || 0,
            ctr: response.data.ctr || 0,
            cpc: response.data.cpc || 0,
          };
        }
        this.isLoadingOverview = false;
        this.updateOverviewCharts();
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

  loadTiktokOverviewStats() {
    this.isLoadingTiktokOverview = true;
    const range = this.datePresetToRange(this.selectedOverviewDatePreset);
    this.marketingService.getTiktokReporting({
      data_level: 'AUCTION_CAMPAIGN',
      page_size: 500,
      start_date: range.start_date,
      end_date: range.end_date,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data?.list) {
          const totals = { spend: 0, impressions: 0, clicks: 0, reach: 0, frequency: 0, ctr: 0, cpc: 0 };
          let countForAvg = 0;
          for (const item of res.data.list) {
            const m = item.metrics;
            totals.spend += parseFloat(m.spend) || 0;
            totals.impressions += parseFloat(m.impressions) || 0;
            totals.clicks += parseFloat(m.clicks) || 0;
            totals.reach += parseFloat(m.reach) || 0;
            countForAvg++;
          }
          totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
          totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
          totals.frequency = totals.reach > 0 ? totals.impressions / totals.reach : 0;
          this.tiktokOverviewStats = totals;
        }
        this.isLoadingTiktokOverview = false;
        this.updateOverviewCharts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingTiktokOverview = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateOverviewCharts() {
    this.spendChartData = {
      ...this.spendChartData,
      datasets: [{
        ...this.spendChartData.datasets[0],
        data: [this.overviewStats.totalSpend, this.tiktokOverviewStats.spend],
      }],
    };
    this.performanceChartData = {
      ...this.performanceChartData,
      datasets: [
        { ...this.performanceChartData.datasets[0], data: [this.overviewStats.impressions, this.overviewStats.clicks, this.overviewStats.reach] },
        { ...this.performanceChartData.datasets[1], data: [this.tiktokOverviewStats.impressions, this.tiktokOverviewStats.clicks, this.tiktokOverviewStats.reach] },
      ],
    };
  }

  datePresetToRange(preset: string): { start_date: string; end_date: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const endDate = fmt(today);

    switch (preset) {
      case 'today':
        return { start_date: endDate, end_date: endDate };
      case 'yesterday': {
        const d = new Date(today);
        d.setDate(d.getDate() - 1);
        return { start_date: fmt(d), end_date: fmt(d) };
      }
      case 'last_3d': {
        const d = new Date(today);
        d.setDate(d.getDate() - 3);
        return { start_date: fmt(d), end_date: endDate };
      }
      case 'last_7d': {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        return { start_date: fmt(d), end_date: endDate };
      }
      case 'last_14d': {
        const d = new Date(today);
        d.setDate(d.getDate() - 14);
        return { start_date: fmt(d), end_date: endDate };
      }
      case 'last_30d': {
        const d = new Date(today);
        d.setDate(d.getDate() - 30);
        return { start_date: fmt(d), end_date: endDate };
      }
      case 'last_90d': {
        const d = new Date(today);
        d.setDate(d.getDate() - 90);
        return { start_date: fmt(d), end_date: endDate };
      }
      case 'this_month':
        return { start_date: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end_date: endDate };
      case 'last_month': {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start_date: fmt(first), end_date: fmt(last) };
      }
      case 'this_quarter': {
        const qMonth = Math.floor(today.getMonth() / 3) * 3;
        return { start_date: fmt(new Date(today.getFullYear(), qMonth, 1)), end_date: endDate };
      }
      case 'maximum':
      default: {
        const d = new Date(today);
        d.setDate(d.getDate() - 364);
        return { start_date: fmt(d), end_date: endDate };
      }
    }
  }

  onOverviewDatePresetChange() {
    this.loadOverviewStats();
    if (this.tiktokStatus.connected) {
      this.loadTiktokOverviewStats();
    }
  }

  getOverviewDatePresetLabel(): string {
    const option = this.datePresetOptions.find(o => o.value === this.selectedOverviewDatePreset);
    return option?.label || this.selectedOverviewDatePreset;
  }

  onMetaSectionChange(section: 'posts' | 'ads') {
    this.selectedMetaSection = section;
    if (section === 'ads') {
      this.loadAds();
    }
  }

  onDatePresetChange() {
    this.loadAds();
  }

  formatCurrency(amount: number): string {
    return 'Ksh. ' + new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
    const ad = this.adForm.ads[index];
    if (ad && ad.creative.image_url && ad.creative.image_url.startsWith('blob:')) {
      URL.revokeObjectURL(ad.creative.image_url);
    }
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.createAdImageFiles[index] = file;
      if (ad) {
        ad.creative.image_url = URL.createObjectURL(file);
      }
    } else {
      this.createAdImageFiles[index] = null;
      if (ad) {
        ad.creative.image_url = '';
      }
    }
    this.cdr.markForCheck();
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
    // Revoke any blob URLs used for preview to avoid memory leaks
    (this.adForm?.ads || []).forEach(ad => {
      if (ad?.creative?.image_url?.startsWith?.('blob:')) {
        URL.revokeObjectURL(ad.creative.image_url);
      }
    });
    this.createAdSelectedProductId = '';
    this.createAdSelectedLandingPageName = '';
    this.createAdLandingPages = [];
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
    this.createAdImageFiles = [null];
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
