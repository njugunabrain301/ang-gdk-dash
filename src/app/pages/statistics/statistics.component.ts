import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  JourneySource,
  StatisticsService,
} from '../../services/statistics.service';
import { ProductsService } from '../../services/products.service';
import { JourneySourceSectionComponent } from './components/journey-source-section/journey-source-section.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    JourneySourceSectionComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  dateFrom = this.dateToString(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  dateTo = this.dateToString(new Date());

  products: { _id: string; name: string }[] = [];
  selectedProductId: string | null = null;

  sources: JourneySource[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private statisticsService: StatisticsService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadJourneys();
  }

  private dateToString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  loadProducts(): void {
    this.productsService.getAllProductsList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data
            .map((product: { _id: string; name?: string }) => ({
              _id: product._id,
              name: (product.name || 'Unnamed product').trim(),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      },
      error: (err) => {
        console.error('Products list error:', err);
      },
    });
  }

  onDateChange(): void {
    if (!this.dateFrom || !this.dateTo) {
      return;
    }
    if (this.dateFrom > this.dateTo) {
      this.snackBar.open(
        'Start date must be before end date',
        'Close',
        { duration: 3000 }
      );
      return;
    }
    this.loadJourneys();
  }

  onProductChange(): void {
    this.loadJourneys();
  }

  get emptyStateMessage(): string {
    if (this.selectedProductId) {
      return 'No journey data for this product in this period.';
    }
    return 'No journey data for this period.';
  }

  loadJourneys(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.statisticsService
      .getCustomerJourneys(this.dateFrom, this.dateTo, this.selectedProductId)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.sources = response.data.sources ?? [];
          } else {
            this.sources = [];
            this.errorMessage = response.message || 'Failed to load journeys';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Customer journeys error:', err);
          this.sources = [];
          this.errorMessage = 'Failed to load customer journeys';
          this.isLoading = false;
          this.snackBar.open(this.errorMessage, 'Close', { duration: 4000 });
        },
      });
  }
}
