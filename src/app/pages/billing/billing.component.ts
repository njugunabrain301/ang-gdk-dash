import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import {
  BillingService,
  LastPayment,
  Status,
} from '../../services/billing.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { InvoicesComponent } from './invoices/invoices.component';
import { PackagesComponent } from './packages/packages.component';
import { MarketingComponent } from './marketing/marketing.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    InvoicesComponent,
    PackagesComponent,
    MarketingComponent,
    // PackagesComponent, // To be added later
    // MarketingComponent, // To be added later
    // InvoicesComponent, // To be added later
  ],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit {
  lastPayment: any = { year: 0, month: 0, day: 0 };
  subscription: string = '';
  currentPackage: string = '';
  invoices: any = [];
  status: Status = { subscription: '' };
  validUntil: string = '';
  daysRemaining: number = 10;
  activeTab: number = 1;
  profile: any;

  constructor(
    private billingService: BillingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(map((params) => params['section']))
      .subscribe((section) => {
        this.activeTab = section === 'invoices' ? 3 : 1;
      });

    this.loadInvoices();
  }

  loadInvoices(): void {
    this.billingService.getInvoices().subscribe({
      next: (response) => {
        if (response.success) {
          this.lastPayment = response.data.lastPayment;
          this.subscription = response.data.subscription;
          this.invoices = response.data.invoices.reverse();
          this.currentPackage = response.data.package;
          this.status = response.data.status;
          this.calculateValidUntil();
        }
      },
      error: (error) => console.error('Error loading invoices:', error),
    });
  }

  calculateValidUntil(): void {
    if (this.lastPayment.year === 0) {
      this.validUntil = '';
      return;
    }

    if (this.subscription === 'one-off') {
      this.validUntil = 'Infinity';
      this.daysRemaining = -1;
      return;
    }

    const validDate = new Date(
      this.lastPayment.year,
      this.lastPayment.month - 1,
      this.lastPayment.day
    );
    validDate.setDate(validDate.getDate() + 31);
    this.validUntil = validDate.toDateString();

    const today = new Date();
    const diffTime = validDate.getTime() - today.getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.daysRemaining = diffDays < 0 ? 0 : diffDays;
  }

  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }

  lastPaymentChange(event: LastPayment): void {
    this.lastPayment = event;
    this.calculateValidUntil();
  }
}
