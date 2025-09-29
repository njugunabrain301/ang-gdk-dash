import { Component, OnInit } from '@angular/core';
import {
  CheckoutInfo,
  DashboardService,
  POSInvoice,
  Statistics,
} from '../../services/dashboard.service';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../interfaces/Product.interface';
import { ActiveProduct } from '../../interfaces/ActiveProduct';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PosDialogComponent } from '../../components/pos-dialog/pos-dialog.component';

//
import { ChangeDetectionStrategy, inject } from '@angular/core';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    // BrowserModule,
    // BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective,
    MatDialogModule,
  ],

  // selector: 'dialog-content-example',
  // templateUrl: 'dialog-content-example.html',
  // standalone: true,
  // imports: [MatButtonModule, MatDialogModule],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  growth: ChartConfiguration['data'] = {
    labels: ['Loading'],
    datasets: [
      {
        label: 'Users',
        data: [0],
        tension: 0.5,
      },
    ],
  };
  visits: ChartConfiguration['data'] = {
    labels: ['Loading'],
    datasets: [
      {
        label: 'Website Visits',
        data: [0],
        tension: 0.5,
      },
    ],
  };
  revenueData: ChartConfiguration['data'] = {
    labels: ['Loading'],
    datasets: [
      {
        label: 'Revenue',
        data: [0],
        tension: 0.5,
      },
    ],
  };
  orders = 0;
  invoices = 0;
  statistics: Statistics = {} as Statistics;

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  readonly dialog = inject(MatDialog);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.init();
  }

  init() {
    this.dashboardService.getStatistics().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.statistics = res.data;
          this.growth = {
            labels: res.data.growth.labels,
            datasets: [
              {
                label: 'Users',
                data: res.data.growth.datasets.data,
                tension: 0.5,
              },
            ],
          };
          this.visits = {
            labels: res.data.visits_data.labels,
            datasets: [
              {
                label: 'Website Visits',
                data: res.data.visits_data.datasets.data,
                tension: 0.5,
              },
            ],
          };
          this.revenueData = {
            labels: res.data.revenue_data.labels,
            datasets: [
              {
                label: 'Revenue',
                data: res.data.revenue_data.datasets.data,
                tension: 0.5,
              },
            ],
          };
        }
      },
      error: (error) => console.error('Error fetching statistics:', error),
    });

    // this.dashboardService.getEssentialInfo().subscribe({
    //   next: (res: any) => {
    //     if (res.success) {
    //       this.orders = res.data.orders;
    //       this.invoices = res.data.invoices;
    //     }
    //   },
    //   error: (error) => console.error('Error fetching essential info:', error),
    // });

    // this.productsService.getAllProductsList().subscribe({
    //   next: (res: any) => {
    //     if (res.success) {
    //       this.products = res.data;
    //     }
    //   },
    //   error: (error) => console.error('Error fetching products:', error),
    // });

    // this.dashboardService.getCheckoutInfo().subscribe({
    //   next: (res: any) => {
    //     if (res.success) {
    //       this.checkoutInfo = res.data;
    //     }
    //   },
    //   error: (error) => console.error('Error fetching checkout info:', error),
    // });

    // this.dashboardService.getPOSInvoices().subscribe({
    //   next: (res: any) => {
    //     if (res.success) {
    //       this.posInvoices = res.data;
    //     }
    //   },
    //   error: (error) => console.error('Error fetching POS invoices:', error),
    // });
  }

  openPosDialog() {
    const dialogRef = this.dialog.open(PosDialogComponent, {
      width: '80%',
      maxWidth: '1200px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'pos-dialog-container',
      hasBackdrop: true,
      disableClose: false,
      autoFocus: true,
      position: {
        top: '50px',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Handle any actions after dialog is closed
    });
  }
}
