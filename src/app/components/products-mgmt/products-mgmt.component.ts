import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  DoCheck,
  ViewChild,
  TemplateRef,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../interfaces/Product.interface';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { MatListItem } from '@angular/material/list';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { AIGenerationService } from '../../services/aigeneration.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MyAffiliatesComponent } from '../my-affiliates/my-affiliates.component';
import { SegmentComponent } from '../segment/segment.component';
import { LandingPagesComponent } from './landing-pages/landing-pages.component';
import { AiDescriptionModalComponent } from './ai-description-modal/ai-description-modal.component';
import { from, mergeMap, switchMap, tap, toArray } from 'rxjs';
import { ProfileInfoService } from '../../services/profile-info.service';

interface ArticleBase {
  _id?: string;
  order: number;
  visibility?: boolean;
}

interface TextArticle extends ArticleBase {
  type: 'article';
  content: {
    title?: string;
    text?: string;
    image?: string;
  };
}

interface CounterArticle extends ArticleBase {
  type: 'counter';
  content: {
    values: Array<{
      title: string;
      prefix?: string;
      value: number;
      suffix?: string;
    }>;
  };
}

interface ListArticle extends ArticleBase {
  type: 'list';
  content: {
    title?: string;
    intro?: string;
    items: string[];
  };
}

interface CarouselArticle extends ArticleBase {
  type: 'carousel';
  content: {
    title?: string;
    values: Array<{
      image: string;
      title?: string;
      description?: string;
    }>;
  };
}

interface VideoArticle extends ArticleBase {
  type: 'video';
  content: {
    title?: string;
    caption?: string;
    videoId: string;
  };
}

interface VideoBannerArticle extends ArticleBase {
  type: 'banner-video';
  content: {
    headline?: string;
    tagline?: string;
    manualLink?: string;
    videoId: string;
  };
}

type Article =
  | TextArticle
  | CounterArticle
  | ListArticle
  | CarouselArticle
  | VideoArticle
  | VideoBannerArticle;

interface LandingPage {
  name: string;
  articles: Article[];
  miniHeader?: boolean;
  default?: boolean;
}

interface Specification {
  name: string;
  detail: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface USP {
  title: string;
}

interface PriceOption {
  option: string;
  price: number;
  default: boolean;
}

interface LandingPage {
  name: string;
  articles: Article[];
  miniHeader?: boolean;
  default?: boolean;
}

interface Coupon {
  name: string;
  discount: number;
  default: boolean;
}

interface Category {
  name: string;
  subcategories: string[];
}

interface TextArticleContent {
  title?: string;
  text?: string;
  image?: string;
}

interface CounterArticleContent {
  values: Array<{
    title: string;
    prefix?: string;
    value: number;
    suffix?: string;
  }>;
}

interface ListArticleContent {
  title?: string;
  intro?: string;
  items: string[];
}

interface CarouselArticleContent {
  title?: string;
  values: Array<{
    image: string;
    title?: string;
    description?: string;
  }>;
}

interface VideoArticleContent {
  title?: string;
  caption?: string;
  videoId: string;
}

interface VideoBannerArticleContent {
  headline?: string;
  tagline?: string;
  manualLink?: string;
  videoId: string;
}

@Component({
  selector: 'app-product-mgmt',
  templateUrl: './products-mgmt.component.html',
  styleUrls: ['./products-mgmt.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatListItem,
    MatCheckbox,
    MatProgressSpinnerModule,
    DragDropModule,
    MatTabsModule,
    MatRadioModule,
    MatProgressBarModule,
    MyAffiliatesComponent,
    SegmentComponent,
    LandingPagesComponent,
  ],
})
export class ProductMgmtComponent implements OnInit, DoCheck {
  @Input() storeData: Product[] = [];
  @Output() storeDataChange = new EventEmitter<any[]>();
  @Input() fullCategories: Category[] = [];
  @ViewChild('unsavedChangesDialog') unsavedChangesDialog!: TemplateRef<any>;
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;
  @ViewChild('imageDeleteDialog') imageDeleteDialog!: TemplateRef<any>;
  @ViewChild('errorSnackbarTemplate') errorSnackbarTemplate!: TemplateRef<any>;

  tempData: Product[] = [];
  data: Product[] = [];
  isUpdating = false;
  successSB = false;
  errorSB = false;
  warningSB = false;
  activity = '';
  error = '';
  warning = '';
  profile: any;
  currentImage: any = '';

  // State Management
  prod: Product = {
    _id: '',
    gender: '',
    colors: [],
    sizes: [],
    amount: 0,
    name: '',
    color: '',
    size: '',
    option: '',
    categories: [],
    extras: [],
    brand: '',
    affiliateVisibility: '',
    commission: 0,
    videoLink: '',
    proSellers: [],
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    img: '',
    images: [],
    inStock: true,
    hide: false,
    showGoogle: false,
    showRelated: false,
    specs: [],
    faqs: [],
    USPs: [],
    priceOptions: [],
    landingPages: [],
    coupons: [],
    features: [],
    condition: 'New',
    handlingTime: {
      amount: 1,
      unit: 'days',
    },
    originalId: null,
  };
  tempProd!: Product;
  hasUnsavedChanges = false;
  selectedTab = 0;
  landingPageIndex = 0;
  isBusinessAccount = false;
  errorMessage = '';
  imageToDelete: string = '';

  currentLP = 'default';
  otherSubCat = '';
  openModal = false;
  openUpdateModal = false;
  selectedColor = '';
  asyncProcess = '';

  // Filters
  searchTerm = '';
  sCat = '';
  sSub = '';
  listFilters: string[] = [];
  categories: string[] = [];
  mySubs: string[] = [];

  newSpec: Specification = { name: '', detail: '' };
  newFaq: FAQ = {
    question: '',
    answer: '',
  };
  newUsp: string = '';
  newPriceOption: PriceOption = { option: '', price: 0, default: false };
  newLandingPage: LandingPage = {
    name: '',
    articles: [],
    miniHeader: false,
    default: false,
  };
  newCoupon: Coupon = {
    name: '',
    discount: 0,
    default: false,
  };

  previousSCat: string = '';
  previousSSub: string = '';

  articleTypes = [
    'article',
    'counter',
    'list',
    'title',
    'link',
    'carousel',
    'video',
    'banner-video',
  ] as const;

  selectedArticleType: string = 'article';
  newLandingPageName: string = '';
  currentLandingPage: string = '';

  newArticle: any;

  // For temporary storage of list/counter/carousel items
  tempItem: any = {};

  // Add this property
  selectedImageId: string = '';

  // Size management
  newSize: string = '';
  sizesArray: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  shoeSizes: string[] = [
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
  ];

  // Add these new properties
  isPrimaryProduct: boolean = false;
  isSecondaryProduct: boolean = false;
  uploadProgress: number = 0;

  newSeller = {
    name: '',
    price: 0,
    default: false,
  };

  defaultLandingPage: LandingPage = {
    name: 'default',
    articles: [],
    miniHeader: false,
    default: true,
  };

  // Add this property to your component
  isSaving: boolean = false;
  isProgress: string = '';

  // Add originalProd to store initial state
  originalProd: Product | null = null;

  isAffiliateProduct: boolean = false;

  constructor(
    private productService: ProductService,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private aiService: AIGenerationService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileInfoService
  ) {}

  ngOnInit() {
    this.tempData = this.storeData;
    this.data = this.storeData;
    this.profile = JSON.parse(localStorage.getItem('profile') || '{}');

    // Set initial image
    if (this.prod?.img) {
      // this.currentImage = this.prod.images[0].img;
      this.currentImage = this.prod.img;
    }

    // Initialize filters
    if (this.prod?.category) {
      this.sCat = this.prod.category;
    }
    if (this.prod?.subcategory) {
      this.sSub = this.prod.subcategory;
    }

    this.initializeComponent();
    this.loadUserProfile();
  }

  private async initializeComponent() {
    if (this.storeData.length > 0) {
      this.tempData = [...this.storeData];
      this.setNextItem(this.storeData[0]._id);
      await this.loadCategories();
    }
  }

  private async loadUserProfile() {
    try {
      const profile = await this.profileService.getAccountProfile().toPromise();
      console.log(profile);
      if (profile && profile.success) {
        this.isBusinessAccount =
          profile.data.package.toLowerCase() === 'business';
      }
    } catch (error) {
      this.showError('Error loading user profile');
    }
  }

  private async loadCategories() {
    try {
      // const categories = await this.productService.getCategories().toPromise();
      this.categories = this.fullCategories.map((cat) => cat.name);
      this.updateSubcategories();
    } catch (error) {
      this.showError('Error loading categories');
    }
  }

  private updateSubcategories() {
    this.mySubs =
      this.fullCategories.find((cat) => cat.name === this.prod.category)
        ?.subcategories || [];
  }

  // Product Navigation and Changes
  handleTabChange(index: number) {
    if (this.hasUnsavedChanges) {
      this.dialog
        .open(this.unsavedChangesDialog)
        .afterClosed()
        .subscribe((result) => {
          if (result === 'save') {
            this.saveChanges();
            this.selectedTab = index;
          } else if (result === 'discard') {
            this.discardChanges();
            this.selectedTab = index;
          }
        });
    } else {
      this.selectedTab = index;
    }
  }

  // AI Generation Methods
  generateSpecs() {
    if (this.prod.specs.length >= 10) {
      this.showError(
        'Cannot generate more specs - maximum of 10 specs allowed'
      );
      return;
    }

    this.isProgress = 'generateSpecs';

    this.aiService
      .generateSpecs({
        pid: this.prod._id,
        specs: this.prod.specs,
        num: 10 - this.prod.specs.length,
      })
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            let addedSpecs = JSON.parse(response.data);
            this.prod.specs = [...this.prod.specs, ...addedSpecs];
            this.updateProductHandler();
            this.showSuccess('Specifications generated successfully');
          } else {
            this.showError('Failed to generate specifications');
          }
        },
        error: (error) => {
          this.showError('Error generating specifications');
          console.error(error);
        },
        complete: () => {
          this.isProgress = '';
        },
      });
  }

  async generateDescription() {
    const dialogRef = this.dialog.open(AiDescriptionModalComponent, {
      data: {
        description: this.prod.description,
        productId: this.prod._id,
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.prod.description = result;
        this.hasUnsavedChanges = true;
      }
    });
  }

  parseImageUrl(image: File | string): string {
    if (this.isFile(image)) {
      return URL.createObjectURL(image);
    }
    return image;
  }

  // Image Handling
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      // Reset progress
      this.uploadProgress = 0;

      reader.onloadstart = () => {
        this.uploadProgress = 0;
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          this.uploadProgress = Math.round((e.loaded / e.total) * 100);
        } else {
        }
      };

      reader.onload = (e: any) => {
        this.uploadProgress = 100;
        this.currentImage = e.target.result;

        // Ensure prod.images is initialized if undefined
        if (!this.prod.images) {
          this.prod.images = [];
        }

        // Create new image object
        const newImage = {
          img: file,
          _id: Date.now().toString(),
        };

        // Create new array reference with the new image
        this.prod.images = [...this.prod.images, newImage];
        this.toggleImage(newImage.img);

        this.hasUnsavedChanges = true;

        // Reset progress after a short delay
        setTimeout(() => {
          this.uploadProgress = 0;
        }, 500);
      };

      reader.onerror = () => {
        this.uploadProgress = 0;
        this.showError('Error uploading image');
      };

      reader.readAsDataURL(file);
    }
  }

  // Save and Discard Changes
  saveChanges() {
    if (this.isProgress !== 'Saving') {
      if (
        this.isAffiliateProduct &&
        this.prod.price < this.prod.originalId.price
      ) {
        this.showError('Product price cannot be less than supplier price');
        return;
      }

      this.isProgress = 'Saving';
      this.cdr.detectChanges();
      this.updateProductHandler();
      this.isProgress = '';
      this.cdr.detectChanges();
      this.hasUnsavedChanges = false;
    }
  }

  clearChanges() {
    if (this.originalProd) {
      // Deep clone the original product to avoid reference issues
      // this.prod = JSON.parse(JSON.stringify(this.originalProd));
      // Reset current image to original main image
      this.currentImage = this.prod.img;
      // Update subcategories based on restored category
      this.updateSubcategories();
      this.hasUnsavedChanges = false;
      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  discardChanges() {
    if (this.originalProd) {
      // Deep clone the original product to avoid reference issues
      this.prod = JSON.parse(JSON.stringify(this.originalProd));

      // Reset current image to original main image
      this.currentImage = this.prod.img;

      // Update subcategories based on restored category
      this.updateSubcategories();

      this.hasUnsavedChanges = false;

      // Trigger change detection
      this.cdr.detectChanges();

      // Show confirmation message
      this.showSuccess('Changes discarded');
    }
  }

  // Utility Methods
  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  // private showError(message: string) {
  //   this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  // }

  private updateStoreData() {
    this.storeData = this.storeData.map((p) =>
      p._id === this.prod._id ? { ...this.prod } : p
    );
    this.storeDataChange.emit(this.storeData);
  }

  ngDoCheck() {
    if (this.previousSCat !== this.sCat || this.previousSSub !== this.sSub) {
      this.filterProducts();
      this.previousSCat = this.sCat;
      this.previousSSub = this.sSub;
    }
  }

  // First batch of methods - core functionality
  updateProductHandler() {
    let success = false;
    if (!this.isUpdating) {
      const fd = new FormData();

      // Validation checks
      if (this.prod.img === null) {
        this.showError('Please provide an image');
        return;
      }

      if (
        this.isFile(this.prod.img) &&
        (this.prod.img as File).size / (1024 * 1024) > 10
      ) {
        this.showError('The image is too large. Maximum 10 Mb');
        return;
      }

      if (
        this.prod.images.some(
          (image) =>
            this.isFile(image.img) &&
            (image.img as File).size / (1024 * 1024) > 10
        )
      ) {
        this.showError('One or more images are too large. Maximum 10 Mb');
        return;
      }

      if (
        this.prod.description === '' ||
        (this.prod.name === '' && this.prod.subcategory !== 'Vehicles') ||
        this.prod.category === '' ||
        (this.prod.subcategory === '' && this.prod.category !== 'Other') ||
        (this.prod.subcategory === 'Vehicles' &&
          (!this.prod.extras ||
            !this.prod.extras.make ||
            !this.prod.extras.model))
      ) {
        this.showError('Fill in all required fields');
        return;
      }

      if (this.prod.price < 0) {
        this.showError('The price cannot be less than 0');
        return;
      }

      if (this.containsUnwantedHtmlTags(this.prod.description)) {
        this.showError(
          'Invalid description. Only p, ul, ol, li, strong, b, br, em & i tags are allowed here'
        );
        return;
      }

      this.isUpdating = true;

      const imagesToUpload = this.prod.images.filter((image) =>
        this.isFile(image.img)
      );

      if (imagesToUpload.length === 0) {
        // If no images to upload, proceed directly with form submission
        this.appendFormData(fd, this.prod);
        this.productService.updateProduct(fd).subscribe(
          (res) => {
            this.prod = JSON.parse(JSON.stringify(res.data));
            this.originalProd = JSON.parse(JSON.stringify(res.data));
            this.isUpdating = false;
            this.updateProducts();
            this.tempProd = { ...this.prod };
            this.showSuccess('Updated');
            success = true;
            this.hasUnsavedChanges = false;
            this.isProgress = '';
            this.cdr.detectChanges();
          },
          (error) => {
            this.showError('Error updating product');
          },
          () => {
            this.ngZone.run(() => {
              this.isUpdating = false;
            });
          }
        );
      } else {
        // If there are images to upload, handle them first
        from(imagesToUpload)
          .pipe(
            mergeMap((image) =>
              this.productService.uploadImage(image.img as File).pipe(
                tap((response) => {
                  image.img = response.data;
                  delete image._id;
                })
              )
            ),
            toArray(),
            tap(() => {
              this.appendFormData(fd, this.prod);
            }),
            switchMap(() => this.productService.updateProduct(fd))
          )
          .subscribe(
            (res) => {
              this.prod = JSON.parse(JSON.stringify(res.data));
              this.originalProd = JSON.parse(JSON.stringify(res.data));
              this.updateProducts();
              this.tempProd = { ...this.prod };
              this.showSuccess('Updated');
              success = true;
              this.hasUnsavedChanges = false;
            },
            (error) => {
              this.showError('Error updating product');
            },
            () => {
              this.ngZone.run(() => {
                this.isUpdating = false;
              });
            }
          );
      }
    }

    return success;
  }

  private appendFormData(fd: FormData, prod: Product) {
    fd.append('img', prod.img);
    fd.append('description', prod.description);
    fd.append('name', prod.name);
    fd.append('price', prod.price.toString());
    fd.append('gender', prod.gender);
    fd.append('category', prod.category);
    fd.append(
      'subcategory',
      prod.subcategory === 'Other' || prod.category === 'Other'
        ? this.otherSubCat
        : prod.subcategory
    );

    // Arrays and objects need to be stringified
    fd.append('colors', JSON.stringify(prod.colors || []));
    fd.append('images', JSON.stringify(prod.images || []));
    fd.append('sizes', JSON.stringify(prod.sizes || []));
    fd.append('categories', JSON.stringify(prod.categories || []));
    fd.append('features', JSON.stringify(prod.features || []));
    fd.append('extras', JSON.stringify(prod.extras || {}));
    fd.append('handlingTime', JSON.stringify(prod.handlingTime));
    fd.append('_id', prod._id);
    fd.append('brand', prod.brand);
    fd.append('condition', prod.condition);
    fd.append('inStock', prod.inStock.toString());
    fd.append('affiliateVisibility', prod.affiliateVisibility.toString());
    fd.append('commission', prod.commission.toString());
    fd.append('showRelated', prod.showRelated.toString());
    fd.append('showGoogle', prod.showGoogle.toString());
    fd.append('hide', prod.hide.toString());
    fd.append('specs', JSON.stringify(prod.specs));
    fd.append('faqs', JSON.stringify(prod.faqs));
    fd.append('USPs', JSON.stringify(prod.USPs));
    fd.append('videoLink', prod.videoLink);
    fd.append('priceOptions', JSON.stringify(prod.priceOptions));
    fd.append('coupons', JSON.stringify(prod.coupons));
    fd.append('landingPages', JSON.stringify(prod.landingPages));
    fd.append('proSellers', JSON.stringify(prod.proSellers || []));
  }

  updateProducts() {
    this.tempData = this.tempData.map((item) =>
      item._id === this.prod._id ? { ...this.prod } : { ...item }
    );
  }

  async deleteAccepted() {
    try {
      const res = await this.productService
        .deleteProduct(this.prod._id)
        .toPromise();

      if (res?.success) {
        this.showSuccess('Deleted');
        // this.setProdCount(this.tempData.length - 1);
        this.tempData = this.tempData.filter((p) => p._id !== this.prod._id);
        this.data = this.data.filter((p) => p._id !== this.prod._id);
        this.storeDataChange.emit(this.data);
      } else {
        this.showError('Error deleting Product');
      }
    } catch (error) {
      this.showError('Error deleting Product');
    }
  }

  deleteItemHandler() {
    this.openModal = true;
  }

  discardUpdates() {
    this.prod = {
      ...this.tempProd,
      images: this.prod.images,
    };
  }

  // Utility methods
  private isFile(input: any): input is File {
    return 'File' in window && input instanceof File;
  }

  private containsUnwantedHtmlTags(inputString: string): boolean {
    const htmlTagPattern = /<[^>]+>/g;
    const allowedTags = [
      '<p>',
      '<ul>',
      '<strong>',
      '<b>',
      '<br>',
      '<ol>',
      '<li>',
      '<em>',
      '<i>',
      '</p>',
      '</ul>',
      '</strong>',
      '</b>',
      '</br>',
      '</ol>',
      '</li>',
      '</em>',
      '</i>',
      '<br/>',
      '</h2>',
      '</h3>',
      '<h2>',
      '<h3>',
    ];

    const foundTags = inputString.match(htmlTagPattern);
    if (!foundTags) return false;

    return foundTags.some(
      (tag) => !allowedTags.some((allowedTag) => tag.startsWith(allowedTag))
    );
  }

  // Notification methods
  private showError(message: string) {
    this.snackBar.openFromTemplate(this.errorSnackbarTemplate, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
      data: { message },
    });
  }

  private showWarning(message: string) {
    this.warning = message;
    this.warningSB = true;
  }

  addSpec() {
    if (this.newSpec.name && this.newSpec.detail) {
      this.prod.specs = [...(this.prod.specs || []), { ...this.newSpec }];
      this.newSpec = { name: '', detail: '' };
      this.isProgress = 'specs';
      this.updateProductHandler();
      setTimeout(() => {
        this.isProgress = '';
      }, 2000);
    }
  }

  removeSpec(index: number) {
    this.prod.specs = this.prod.specs.filter((_, i) => i !== index);
    this.updateProductHandler();
  }

  addFaq() {
    if (this.newFaq.question && this.newFaq.answer) {
      this.isProgress = 'faqs';
      this.prod.faqs = [...(this.prod.faqs || []), { ...this.newFaq }];
      this.updateProductHandler();
      this.newFaq = { question: '', answer: '' };
      this.hasUnsavedChanges = true;
      setTimeout(() => {
        this.isProgress = '';
      }, 2000);
    }
  }

  removeFaq(index: number) {
    this.prod.faqs = this.prod.faqs.filter((_, i) => i !== index);
    this.updateProductHandler();
  }

  generateFaq() {
    if (this.prod.faqs.length >= 10) {
      this.showError('Maximum 10 FAQs allowed');
      return;
    }
    this.isProgress = 'generateFaq';
    this.aiService
      .generateFaqs({
        pid: this.prod._id,
        faqs: this.prod.faqs,
        num: 10 - this.prod.faqs.length,
      })
      .subscribe({
        next: (response) => {
          let faqs = JSON.parse(response.data);
          this.prod.faqs = [...this.prod.faqs, ...faqs];
          this.updateProductHandler();
        },
        complete: () => {
          this.isProgress = '';
        },
      });
  }

  addUsp() {
    if (this.newUsp && this.prod.USPs.length < 3) {
      this.isProgress = 'USPs';
      this.prod.USPs = [...(this.prod.USPs || []), this.newUsp];
      this.updateProductHandler();
      this.newUsp = '';
      setTimeout(() => {
        this.isProgress = '';
      }, 2000);
      this.showSuccess('Added');
    } else if (this.prod.USPs.length >= 3) {
      this.showError('Maximum 3 USPs allowed');
    } else {
      this.showError('Please enter a USP');
    }
  }

  removeUsp(index: number) {
    this.prod.USPs = this.prod.USPs.filter((_, i) => i !== index);
    this.updateProductHandler();
  }

  generateUsp() {
    if (this.prod.USPs.length >= 3) {
      this.showError('Maximum 3 USPs allowed');
      return;
    }
    this.isProgress = 'generateUsp';
    this.aiService
      .generateUsp({
        pid: this.prod._id,
        usps: this.prod.USPs,
        num: 3 - this.prod.USPs.length,
      })
      .subscribe({
        next: (response) => {
          let usps = JSON.parse(response.data);
          this.prod.USPs = [...this.prod.USPs, ...usps];
          this.updateProductHandler();
        },
      });
    setTimeout(() => {
      this.isProgress = '';
    }, 2000);
  }

  addPriceOption() {
    if (this.newPriceOption.option && this.newPriceOption.price >= 0) {
      this.isProgress = 'priceOptions';
      this.prod.priceOptions = [
        ...(this.prod.priceOptions || []),
        { ...this.newPriceOption },
      ];
      this.updateProductHandler();
      this.newPriceOption = { option: '', price: 0, default: false };
      setTimeout(() => {
        this.isProgress = '';
      }, 2000);
    }
  }

  removePriceOption(index: number) {
    this.prod.priceOptions = this.prod.priceOptions.filter(
      (_, i) => i !== index
    );
    this.updateProductHandler();
  }

  setDefaultPriceOption(index: number) {
    this.prod.priceOptions = this.prod.priceOptions.map((option, i) => ({
      ...option,
      default: i === index,
    }));

    this.updateProductHandler();
  }

  // Add these methods
  addCoupon() {
    if (this.newCoupon.name && this.newCoupon.discount > 0) {
      this.isProgress = 'coupons';
      this.prod.coupons = [...(this.prod.coupons || []), { ...this.newCoupon }];
      this.updateProductHandler();
      this.newCoupon = {
        name: '',
        discount: 0,
        default: false,
      };
      setTimeout(() => {
        this.isProgress = '';
      }, 2000);
    }
  }

  removeCoupon(index: number) {
    this.prod.coupons = this.prod.coupons.filter((_, i) => i !== index);
    this.updateProductHandler();
  }

  setDefaultCoupon(index: number) {
    this.prod.coupons = this.prod.coupons.map((coupon, i) => ({
      ...coupon,
      default: i === index,
    }));
    this.updateProductHandler();
  }

  // Add this getter method to the ProductMgmtComponent class
  get mySubsFunc(): string[] {
    const categoryObj = this.fullCategories.find(
      (cat) => cat.name === this.prod.category
    );
    return categoryObj ? [...categoryObj.subcategories, 'Other'] : [];
  }

  // Add this method to the ProductMgmtComponent class
  async deleteImage(imageId: string | undefined) {
    if (!imageId) return;
    this.hasUnsavedChanges = true;

    // Remove the provided image link from the current prod.images array
    this.prod.images = this.prod.images.filter((img) => img._id !== imageId);
    this.cdr.detectChanges();
  }

  // Add this method to the ProductMgmtComponent class
  toggleImage(imageUrl: string | File) {
    if (!imageUrl) return;

    // If imageUrl is a File object, create a temporary URL
    if (this.isFile(imageUrl)) {
      this.currentImage = URL.createObjectURL(imageUrl);
    } else {
      // If imageUrl is a string, use it directly
      this.currentImage = imageUrl;
    }
  }

  // Add this method to the ProductMgmtComponent class
  setNextItem(id: string) {
    if (this.hasProductChanges()) {
      this.dialog
        .open(this.unsavedChangesDialog)
        .afterClosed()
        .subscribe((result) => {
          if (result === 'save') {
            this.saveChanges();
            this.loadProduct(id);
          } else if (result === 'discard') {
            this.discardChanges();
            this.loadProduct(id);
          }
        });
      return;
    }
    this.loadProduct(id);
  }

  private loadProduct(id: string) {
    this.isProgress = 'Loading';
    this.productService.fetchProduct(id).subscribe({
      next: (response) => {
        this.prod = response.data;
        // Store original state
        this.originalProd = JSON.parse(JSON.stringify(response.data));
        this.updateSubcategories();

        this.isAffiliateProduct =
          this.prod.originalId && this.prod.originalId._id !== this.prod._id
            ? true
            : false;
        this.isProgress = 'Idle';
        this.currentImage = this.prod.img;
        this.isPrimaryProduct = this.prod.features.includes('Slider');
        this.isSecondaryProduct = this.prod.features.includes('Home Page');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.showError('Error loading product');
        this.isProgress = 'Idle';
      },
    });
  }

  private switchToProduct(item: Product) {
    this.prod = { ...item };
    this.tempProd = { ...item };

    // Set initial image if available
    if (this.prod.images?.length > 0) {
      this.currentImage = this.prod.img;
    } else if (this.prod.img) {
      this.currentImage = this.isFile(this.prod.img)
        ? URL.createObjectURL(this.prod.img as File)
        : (this.prod.img as string);
    }

    // // Reset states
    this.successSB = false;
    this.errorSB = false;
    this.warningSB = false;

    // // Set initial landing page if available
    if (this.prod.landingPages?.length > 0) {
      this.currentLP = this.prod.landingPages[0].name;
    }

    this.updateSubcategories();

    this.currentImage = item.img || '';
    this.hasUnsavedChanges = false;
  }

  // Add this method to handle filter toggling
  toggleFilter(filter: string) {
    const index = this.listFilters.indexOf(filter);
    if (index > -1) {
      this.listFilters.splice(index, 1);
    } else {
      this.listFilters.push(filter);
    }
    this.filterProducts();
  }

  // Add this method to filter products
  filterProducts() {
    let filtered = [...this.storeData];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      );
    }

    filtered.map((p) => {});

    if (this.sCat) {
      filtered = filtered.filter((p) => p.category === this.sCat);
    }

    if (this.sSub) {
      filtered = filtered.filter((p) => p.subcategory === this.sSub);
    }

    if (this.listFilters.length > 0) {
      filtered = filtered.filter((p) =>
        this.listFilters.every((filter) => p.features?.includes(filter))
      );
    }

    this.tempData = filtered;
  }

  // Method to clear all filters
  clearFilters() {
    this.searchTerm = '';
    this.sCat = '';
    this.sSub = '';
    this.listFilters = [];
    this.tempData = [...this.storeData];
  }

  // Add this method to open the delete image dialog
  openImageDeleteDialog(imageId: string | undefined) {
    this.selectedImageId = imageId || '';
    this.dialog.open(this.imageDeleteDialog);
  }

  // Method to handle product deletion confirmation
  confirmDelete() {
    this.dialog.closeAll(); // Close the confirmation dialog
    this.deleteAccepted(); // Call the existing deleteAccepted method
  }

  // Method to handle image deletion confirmation
  confirmDeleteImage(imageId: string | undefined) {
    this.dialog.closeAll(); // Close the confirmation dialog
    this.deleteImage(imageId); // Call the existing deleteImage method
  }

  // Method to retry loading products
  retryLoading() {
    this.loadProducts(); // Assuming loadProducts is the method to fetch products
  }

  // Method to cancel navigation
  cancelNavigation() {
    this.dialog.closeAll(); // Close any open dialogs
    // Additional logic to handle navigation cancellation if needed
  }

  // Ensure you have a method to load products
  private loadProducts() {
    // Logic to fetch products from the service
    // this.productService.().subscribe(
    //   (products) => {
    //     this.storeData = products;
    //     this.tempData = [...products];
    //   },
    //   (error) => {
    //     this.showError('Error loading products');
    //   }
    // );
  }

  // Method to generate article content using AI
  async generateArticle() {
    try {
      // const response = await this.aiService
      //   .generateContent('article', this.prod.name)
      //   .toPromise();
      // if (response?.content) {
      //   this.newArticle.content = response.content;
      // }
    } catch (error) {
      this.showError('Error generating article content');
    }
  }

  // Add these methods where other similar methods are defined
  addSize(size: string) {
    if (size && !this.prod.sizes?.includes(size)) {
      this.prod.sizes = [...(this.prod.sizes || []), size];
      this.newSize = ''; // Reset the input after adding
      this.hasUnsavedChanges = true;
    }
  }

  removeSize(size: string) {
    this.prod.sizes = this.prod.sizes.filter((s) => s !== size);
    this.hasUnsavedChanges = true;
  }

  // Color management methods (if not already present)
  addColor(color: string) {
    if (this.prod.colors?.length >= 6) {
      this.showError('Maximum 6 colors allowed per product');
      return;
    }

    if (color && !this.prod.colors?.includes(color)) {
      this.prod.colors = [...(this.prod.colors || []), color];
      this.selectedColor = ''; // Reset the input after adding
      this.hasUnsavedChanges = true;
    }
  }

  removeColor(color: string) {
    this.prod.colors = this.prod.colors.filter((c) => c !== color);
    this.hasUnsavedChanges = true;
  }

  // Add this method to get total images
  getTotalImages(): number {
    return (this.prod.images?.length || 0) + 1; // +1 for main image
  }

  // Add the toggleFeature method
  toggleFeature(feature: 'Slider' | 'Home Page') {
    const features = this.prod.features || [];
    const hasFeature = features.includes(feature);

    if (hasFeature) {
      this.prod.features = features.filter((f) => f !== feature);
    } else {
      // Check limits
      if (feature === 'Slider' && this.getTotalPrimaryProducts() >= 12) {
        this.showError('Maximum 12 primary products allowed');
        this.isPrimaryProduct = false;
        return;
      }
      if (feature === 'Home Page' && this.getTotalSecondaryProducts() >= 48) {
        this.showError('Maximum 48 secondary products allowed');
        this.isSecondaryProduct = false;
        return;
      }
      this.prod.features = [...features, feature];
    }
    this.hasUnsavedChanges = true;
  }

  // Helper methods for counting products
  private getTotalPrimaryProducts(): number {
    return this.storeData.filter((p) => p.features?.includes('Slider')).length;
  }

  private getTotalSecondaryProducts(): number {
    return this.storeData.filter((p) => p.features?.includes('Home Page'))
      .length;
  }

  addSeller() {
    if (this.newSeller.name && this.newSeller.price >= 0) {
      this.prod.proSellers = [
        ...(this.prod.proSellers || []),
        { ...this.newSeller },
      ];
      this.newSeller = { name: '', price: 0, default: false };
      this.hasUnsavedChanges = true;
    }
  }

  removeSeller(index: number) {
    this.prod.proSellers = this.prod.proSellers.filter((_, i) => i !== index);
    this.hasUnsavedChanges = true;
  }

  setDefaultSeller(index: number) {
    this.prod.proSellers = this.prod.proSellers.map((seller, i) => ({
      ...seller,
      default: i === index,
    }));
    this.hasUnsavedChanges = true;
  }

  handleLandingPagesChange(landingPages: any[]) {
    this.prod.landingPages = landingPages;
    this.updateProductHandler();
  }

  onCategoryChange(category: string) {
    // Update subcategories based on selected category
    this.mySubs =
      this.fullCategories.find((cat) => cat.name === category)?.subcategories ||
      [];

    // Clear the current subcategory
    this.prod.subcategory = '';

    // Mark that changes have been made
    this.hasUnsavedChanges = true;
  }

  // Add this method to your component class
  trackByImageId(index: number, image: any): string {
    return image._id || index.toString();
  }

  // Add a getter for remaining images count
  get remainingImagesCount(): number {
    return 4 - (this.prod?.images?.length || 0);
  }

  hasProductChanges(): boolean {
    if (!this.originalProd) return false;

    // Check basic product properties
    const basicPropsChanged =
      this.prod.name !== this.originalProd.name ||
      this.prod.price !== this.originalProd.price ||
      this.prod.category !== this.originalProd.category ||
      this.prod.subcategory !== this.originalProd.subcategory ||
      this.prod.description !== this.originalProd.description ||
      this.prod.condition !== this.originalProd.condition;

    // Check arrays
    const colorsChanged = !this.areArraysEqual(
      this.prod.colors,
      this.originalProd.colors
    );
    const sizesChanged = !this.areArraysEqual(
      this.prod.sizes,
      this.originalProd.sizes
    );
    const imagesChanged = !this.areArraysEqual(
      this.prod.images.map((img) => (typeof img === 'string' ? img : img.img)),
      this.originalProd.images.map((img) =>
        typeof img === 'string' ? img : img.img
      )
    );

    // Check nested objects
    // const specsChanged = !this.areArraysEqual(this.prod.specs, this.originalProd.specs);
    // const faqsChanged = !this.areArraysEqual(this.prod.faqs, this.originalProd.faqs);
    // const uspsChanged = !this.areArraysEqual(this.prod.USPs, this.originalProd.USPs);
    // const priceOptionsChanged = !this.areArraysEqual(this.prod.priceOptions, this.originalProd.priceOptions);
    // const landingPagesChanged = !this.areArraysEqual(this.prod.landingPages, this.originalProd.landingPages);
    // const couponsChanged = !this.areArraysEqual(this.prod.coupons, this.originalProd.coupons);
    // const featuresChanged = !this.areArraysEqual(this.prod.features, this.originalProd.features);

    // Check other boolean properties
    const booleanPropsChanged =
      this.prod.inStock !== this.originalProd.inStock ||
      this.prod.hide !== this.originalProd.hide ||
      this.prod.showGoogle !== this.originalProd.showGoogle ||
      this.prod.showRelated !== this.originalProd.showRelated;
    // this.prod.affiliateVisibility !== this.originalProd.affiliateVisibility;

    // Check handling time
    const handlingTimeChanged =
      this.prod.handlingTime.amount !== this.originalProd.handlingTime.amount ||
      this.prod.handlingTime.unit !== this.originalProd.handlingTime.unit;

    const featuresChanged = !this.areArraysEqual(
      this.prod.features,
      this.originalProd.features
    );

    return (
      basicPropsChanged ||
      colorsChanged ||
      sizesChanged ||
      imagesChanged ||
      // specsChanged ||
      // faqsChanged ||
      // uspsChanged ||
      // priceOptionsChanged ||
      // landingPagesChanged ||
      // couponsChanged ||
      featuresChanged ||
      booleanPropsChanged ||
      handlingTimeChanged
    );
  }

  private areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }
}
