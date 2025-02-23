import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProductsService } from '../../services/products.service';
import { PosInvoiceService } from '../../services/pos-invoice.service';
import { MatIcon } from '@angular/material/icon';
import { PosProductComponent } from '../pos-product/pos-product.component';
import { Product } from '../../interfaces/Product.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PosInvoiceComponent } from '../pos-invoice/pos-invoice.component';

@Component({
  selector: 'app-pos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatIcon,
    PosProductComponent,
    MatFormFieldModule,
    PosInvoiceComponent,
  ],
  templateUrl: './pos-dialog.component.html',
  styleUrls: ['./pos-dialog.component.css'],
})
export class PosDialogComponent implements OnInit {
  active: string = 'new';
  posInvoices: any[] = [];
  products: any[] = [];
  selected: any[] = [];
  totalPrice: number = 0;
  deliveryLoc: any = {
    county: '',
    subcounty: '',
    courier: '',
    endpoint: '',
    price: 0,
    loc: {},
    specification: '',
  };
  delivered: boolean = false;
  checkoutInfo: any = { deliveryLocations: [] };
  client: any = {
    name: '',
    email: '',
    phone: '',
    send: true,
  };
  sendingInvoice: boolean = false;
  sentInvoice: boolean = false;
  posError: string = '';

  constructor(
    public dialogRef: MatDialogRef<PosDialogComponent>,
    private productsService: ProductsService,
    private posService: PosInvoiceService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCheckoutInfo();
    this.loadPosInvoices();
  }

  loadProducts() {
    this.productsService.getAllProductsList().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.success) {
          this.products = res.data;
        }
      },
      error: (error) => console.error('Error fetching products:', error),
    });
  }

  loadCheckoutInfo() {
    this.posService.getCheckoutInfo().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.success) {
          this.checkoutInfo = res.data;
        }
      },
      error: (error) => console.error('Error fetching checkout info:', error),
    });
  }

  loadPosInvoices() {
    this.posService.getPOSInvoices().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.posInvoices = res.data;
        }
      },
      error: (error) => console.error('Error fetching POS invoices:', error),
    });
  }

  setActive(tab: string) {
    this.active = tab;
  }

  addSelected(product: Product) {
    // This method remains the same as before
    let exists = false;
    this.selected = this.selected.map((p) => {
      if (
        p._id === product._id &&
        product.color === p.color &&
        p.size === product.size &&
        p.option === product.option &&
        p.price === product.price
      ) {
        p.amount++;
        exists = true;
      }
      return p;
    });

    if (!exists) {
      product.amount = 1;
      this.selected.push(product);
    }
    this.updateTotalPrice();
  }

  removeSelected(idx: number) {
    if (this.selected.length > idx) {
      if (this.selected[idx].amount > 1) {
        this.selected[idx].amount--;
      } else {
        this.selected.splice(idx, 1);
      }
    }
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    this.totalPrice = this.selected.reduce(
      (total, p) => total + p.price * p.amount,
      0
    );
  }

  getPrice(prd: any): number {
    console.log(prd);
    return 150; // This seems to be a placeholder in the original code
  }

  sendInvoice() {
    this.posError = '';
    if (this.selected.length === 0) {
      this.posError = 'No items have been selected';
      return;
    }
    if (this.sendingInvoice) return;
    if (!this.client.phone) {
      this.posError = 'Provide the client phone number';
      return;
    }
    if (this.deliveryLoc.price < 0) {
      this.posError = 'Delivery fee cannot be negative';
      return;
    }
    this.sendingInvoice = true;
    const payload = {
      client: this.client,
      selected: this.selected,
      deliveryLoc: this.deliveryLoc,
      totalPrice: Number(this.totalPrice) + Number(this.deliveryLoc.price),
      delivered: this.delivered,
      requestReview: false, // You might want to add this as a property if needed
    };
    this.posService.sendPOSInvoice(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.sentInvoice = true;
          this.selected = [];
          this.deliveryLoc = {
            county: '',
            subcounty: '',
            courier: '',
            endpoint: '',
            price: 0,
            loc: {},
            specification: '',
          };
          this.client = {
            name: '',
            email: '',
            phone: '',
            send: true,
          };
          this.posInvoices = [...this.posInvoices, res.data];
          setTimeout(() => {
            this.sentInvoice = false;
          }, 2000);
        } else {
          this.posError =
            'Unable to send invoice. Kindly refresh the page and try again';
        }
        this.sendingInvoice = false;
      },
      error: (error) => {
        console.error('Error sending POS invoice:', error);
        this.posError =
          'Unable to send invoice. Kindly refresh the page and try again';
        this.sendingInvoice = false;
      },
    });
  }

  getUniqueCounties(): string[] {
    return this.checkoutInfo.deliveryLocations
      .map((dl: { county: any }) => dl.county)
      .filter(
        (item: any, index: any, arr: string | any[]) =>
          arr.indexOf(item) === index
      );
  }

  getUniqueSubcounties(): string[] {
    return this.checkoutInfo.deliveryLocations
      .filter((dl: { county: any }) => dl.county === this.deliveryLoc.county)
      .map((dl: { subcounty: any }) => dl.subcounty)
      .filter(
        (item: any, index: any, arr: string | any[]) =>
          arr.indexOf(item) === index
      );
  }

  getCourierLocations(): any[] {
    return this.checkoutInfo.deliveryLocations.filter(
      (dl: { county: any; subcounty: any }) =>
        dl.county === this.deliveryLoc.county &&
        dl.subcounty === this.deliveryLoc.subcounty
    );
  }

  onCourierChange(location: any): void {
    this.deliveryLoc = {
      ...this.deliveryLoc,
      courier: location.courier,
      loc: location,
      price: location.price,
    };
  }

  onCountyChange(county: string): void {
    this.deliveryLoc = {
      ...this.deliveryLoc,
      county,
      subcounty: '',
      courier: '',
      price: 0,
    };
  }

  onSubcountyChange(subcounty: string): void {
    this.deliveryLoc = {
      ...this.deliveryLoc,
      subcounty,
      courier: '',
      price: 0,
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getPendingInvoices() {
    return this.posInvoices.filter((inv) => inv.status === 'INVOICED');
  }

  setInvoices(newInvoices: any[]) {
    this.posInvoices = [...newInvoices];
  }
}
