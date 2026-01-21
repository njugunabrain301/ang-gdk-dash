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
import { ChangeDetectorRef } from '@angular/core';
import { MarketingService, PriorityItem, CreateAdRequest } from '../../services/marketing.service';
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
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css'],
})
export class MarketingComponent implements OnInit {
  selectedTabIndex = 0;
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
      objective: 'LINK_CLICKS',
      status: 'PAUSED',
      special_ad_categories: ['NONE'],
      buying_type: 'AUCTION',
      is_adset_budget_sharing_enabled: false,
    },
    adset: {
      name: '',
      daily_budget: 0,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
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
  callToActionOptions = [
    'SHOP_NOW',
    'LEARN_MORE',
    'SIGN_UP',
    'DOWNLOAD',
    'BOOK_TRAVEL',
    'CONTACT_US',
  ];
  objectiveOptions = [
    'OUTCOME_LEADS',
'OUTCOME_SALES',
'OUTCOME_ENGAGEMENT',
'OUTCOME_AWARENESS',
'OUTCOME_TRAFFIC',
'OUTCOME_APP_PROMOTION',
  ];

  constructor(
    private marketingService: MarketingService,
    private productsService: ProductsService,
    private scheduleService: ScheduleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadPriorityItems();
    this.loadSchedule();
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 1 && this.selectedMetaSection === 'posts') {
      // Reload priority items when switching to Meta tab
      this.loadPriorityItems();
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
  }

  removeAdCreative(index: number) {
    if (this.adForm.ads.length > 1) {
      this.adForm.ads.splice(index, 1);
    } else {
      this.snackBar.open('At least one ad creative is required', 'Close', { duration: 3000 });
    }
  }

  createAd() {
    // Validate required fields
    if (!this.adForm.campaign.name) {
      this.snackBar.open('Campaign name is required', 'Close', { duration: 3000 });
      return;
    }
    if (!this.adForm.adset.name) {
      this.snackBar.open('Ad set name is required', 'Close', { duration: 3000 });
      return;
    }
    if (this.adForm.adset.daily_budget <= 0) {
      this.snackBar.open('Daily budget must be greater than 0', 'Close', { duration: 3000 });
      return;
    }
    if (this.adForm.ads.some((ad: any) => !ad.name || !ad.creative.link || !ad.creative.message || !ad.creative.headline || !ad.creative.description || !ad.creative.image_url)) {
      this.snackBar.open('Please fill in all required ad creative fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoadingAd = true;
    this.marketingService.createAd(this.adForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Ad campaign created successfully!', 'Close', { duration: 5000 });
          // Reset form
          this.resetAdForm();
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
  }

  resetAdForm() {
    this.adForm = {
      campaign: {
        name: '',
        objective: 'LINK_CLICKS',
        status: 'PAUSED',
        special_ad_categories: ['NONE'],
        buying_type: 'AUCTION',
        is_adset_budget_sharing_enabled: false,
      },
      adset: {
        name: '',
        daily_budget: 0,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'OFFSITE_CONVERSIONS',
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
