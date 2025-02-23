import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProductService } from '../../services/product.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Affiliate {
  _id: string;
  name: string;
  url: string;
  viewsThisMonth: number;
}

@Component({
  selector: 'app-my-affiliates',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './my-affiliates.component.html',
  styleUrls: ['./my-affiliates.component.css'],
})
export class MyAffiliatesComponent implements OnInit {
  @Input() productId!: string;

  affiliates: Affiliate[] = [];
  fetching: boolean = false;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.productId) {
      this.fetchAffiliates();
    }
  }

  ngOnChanges() {
    console.log('changes productId', this.productId);
    if (this.productId) {
      this.fetchAffiliates();
    }
  }

  async fetchAffiliates() {
    this.fetching = true;
    try {
      const response = await this.productService
        .getProductAffiliates(this.productId)
        .toPromise();
      if (response?.success) {
        this.affiliates = response.data;
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    } finally {
      this.fetching = false;
      this.cdr.detectChanges();
    }
  }

  async revokeAffiliate(affiliateId: string) {
    try {
      const response = await this.productService
        .revokeAffiliate(affiliateId)
        .toPromise();
      if (response?.success) {
        this.affiliates = this.affiliates.filter(
          (aff) => aff._id !== affiliateId
        );
      }
    } catch (error) {
      console.error('Error revoking affiliate:', error);
    }
  }
}
