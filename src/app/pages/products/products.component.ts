import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../services/product.service';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';
import { NewProductComponent } from '../../components/new-product/new-product.component';
import { ProductMgmtComponent } from '../../components/products-mgmt/products-mgmt.component';
import { AffiliateProductsComponent } from '../../components/affiliate-products/affiliate-products.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    NewProductComponent,
    ProductMgmtComponent,
    AffiliateProductsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  genderizable: any[] = [];
  wearables: any[] = [];
  section: number = 1;
  storeData: any[] = [];
  prodCount: number = 0;
  private subscriptions = new Subscription();
  private alive = true;

  constructor(
    private productService: ProductService,
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.init();
    this.productsLoader();
    this.initPolling();
  }

  ngOnDestroy() {
    this.alive = false;
    this.subscriptions.unsubscribe();
  }

  init() {
    this.subscriptions.add(
      this.productsService.getCategories().subscribe({
        next: (res) => {
          if (res.success) {
            this.categories = res.data;
          }
        },
        error: (error) => console.error('Error fetching categories:', error),
      })
    );

    this.subscriptions.add(
      this.productsService.getGenderizable().subscribe({
        next: (res) => {
          if (res.success) {
            this.genderizable = res.data;
          }
        },
        error: (error) => console.error('Error fetching genderizable:', error),
      })
    );

    this.subscriptions.add(
      this.productsService.getWearables().subscribe({
        next: (res) => {
          if (res.success) {
            this.wearables = res.data;
          }
        },
        error: (error) => console.error('Error fetching wearables:', error),
      })
    );
  }

  productsLoader() {
    this.subscriptions.add(
      this.productsService.getAllProductsList().subscribe({
        next: (res) => {
          if (res.success) {
            this.storeData = res.data;
            this.prodCount = this.storeData.length;
            this.cdr.detectChanges();
          }
        },
        error: (error) => console.error('Error fetching products:', error),
      })
    );
  }

  updateStoreData(data: any) {
    this.storeData = data;
    this.prodCount = this.storeData.length;
  }

  initPolling() {
    interval(5000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        const incompleteProducts = this.storeData.filter((p) => p.building);

        if (incompleteProducts.length > 0) {
          incompleteProducts.forEach((product) => {
            this.subscriptions.add(
              this.productService.fetchProduct(product._id).subscribe({
                next: (res) => {
                  if (res.success && !res.data.building) {
                    const index = this.storeData.findIndex(
                      (p) => p._id === product._id
                    );
                    if (index !== -1) {
                      this.storeData[index] = {
                        ...this.storeData[index],
                        ...res.data,
                      };
                      this.prodCount = this.storeData.length;
                    }
                  }
                },
                error: (error) =>
                  console.error('Error fetching product:', error),
              })
            );
          });
        }
      });
  }

  openSection(sec: number) {
    this.section = sec;
  }
}
