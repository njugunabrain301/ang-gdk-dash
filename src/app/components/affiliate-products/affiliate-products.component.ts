import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface AffiliateProduct {
  _id: string;
  name: string;
  price: number;
  commission: number;
  img: string;
  affiliateVisibility: string;
  owner: {
    name: string;
    url: string;
    customUrl: string;
  };
}

@Component({
  selector: 'app-affiliate-products',
  templateUrl: './affiliate-products.component.html',
  styleUrls: ['./affiliate-products.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatGridListModule,
    MatSnackBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AffiliateProductsComponent implements OnInit, OnDestroy {
  @Input() storeData: any[] = [];
  @Output() storeDataChange = new EventEmitter<any[]>();
  @ViewChild('productContainer') productContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  products: AffiliateProduct[] = [];
  search = '';
  batchNo = 0;
  hasMore = true;
  fetching = false;
  copying: string[] = [];
  private scrollSubscription?: Subscription;
  private searchSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchNextBatch(0);
    this.setupSearchSubscription();
  }

  ngAfterViewInit() {
    this.setupScrollListener();
  }

  ngOnDestroy() {
    this.scrollSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  private setupSearchSubscription() {
    this.searchSubscription = fromEvent(
      this.searchInput?.nativeElement,
      'keyup'
    )
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.applySearch();
      });
  }

  private setupScrollListener() {
    this.scrollSubscription = fromEvent(
      this.productContainer.nativeElement,
      'scroll'
    )
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.handleScroll();
      });
  }

  async fetchNextBatch(batchNoOverride?: number) {
    if (this.fetching || (!this.hasMore && batchNoOverride === undefined)) {
      return;
    }

    this.fetching = true;
    try {
      const response = await this.productService
        .getAffiliateProducts({
          batchNo:
            batchNoOverride !== undefined ? batchNoOverride : this.batchNo,
          search: this.search,
        })
        .toPromise();

      if (response?.success) {
        if (response.data.length === 0) {
          this.hasMore = false;
        } else {
          this.products =
            batchNoOverride === 0
              ? response.data
              : [...this.products, ...response.data];
          this.batchNo++;
        }
      } else {
        this.showError('Unable to fetch products');
      }
    } catch (error) {
      this.showError('Error fetching products');
      console.error('Error:', error);
    } finally {
      this.fetching = false;
      this.cdr.detectChanges();
    }
  }

  async addToMyList(productId: string) {
    if (this.copying.includes(productId)) {
      return;
    }

    this.copying = [...this.copying, productId];

    try {
      const response = await this.productService
        .copyAffiliateProduct(productId)
        .toPromise();

      if (response?.success) {
        this.storeDataChange.emit([...this.storeData, response.data]);
        this.products = this.products.filter((p) => p._id !== productId);
        this.showSuccess('Product added successfully');
      } else {
        this.showError('Failed to add product');
      }
    } catch (error) {
      this.showError('Error adding product');
      console.error('Error:', error);
    } finally {
      this.copying = this.copying.filter((id) => id !== productId);
    }
  }

  private handleScroll() {
    if (
      !this.productContainer?.nativeElement ||
      this.fetching ||
      !this.hasMore
    ) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } =
      this.productContainer.nativeElement;

    if (scrollHeight - scrollTop <= clientHeight + 100) {
      this.fetchNextBatch();
    }
  }

  applySearch() {
    this.hasMore = true;
    this.batchNo = 0;
    this.products = [];
    this.fetchNextBatch(0);
  }

  resizeCardImage(img: string): string {
    return img.replace(
      'https://storage.googleapis.com/test-bucket001/',
      'https://ik.imagekit.io/d4mmlivtj/goduka/tr:w-900/'
    );
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
