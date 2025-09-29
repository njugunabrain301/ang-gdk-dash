import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { DeliveryService } from '../../services/deliveries.service';
import { DeliveryLocation } from '../../interfaces/delivery.interface';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIcon,
    CommonModule,
  ],
  providers: [MatSnackBarConfig],
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.css'],
})
export class DeliveriesComponent implements OnInit {
  counties = ['County1', 'County2', 'County3']; // Replace with actual counties
  subcounties: string[] = [];
  values = {
    county: '',
    subcounty: '',
    courier: '',
    price: 0,
    description: '',
    time: 0,
    payOnDelivery: false,
  };
  apiLocations: any;
  locations: DeliveryLocation[] = [];

  constructor(
    private deliveryService: DeliveryService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  onCountyChange() {
    // Logic to get subcounties based on selected county
    this.subcounties = this.getSubCounties(this.values.county);
  }

  getSubCounties(county: string): string[] {
    // Replace with actual logic to get subcounties
    let subcounties: string[] = [];
    this.apiLocations.forEach((location: any) => {
      let cty = location.split('/')[0].trim();
      if (cty === county) {
        let subcounty = location.split('/')[1].trim();
        if (!subcounties.includes(subcounty)) {
          subcounties.push(subcounty);
        }
      }
    });
    return subcounties;
  }

  handleAddLocation() {
    this.deliveryService.addDelivery(this.values).subscribe({
      next: (res) => {
        if (res.success) {
          this.locations = res.data; // Update locations
          this.resetValues();
          this.showSnackbar('Delivery added successfully', 'success');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error adding delivery:', error);
        this.showSnackbar('Error adding delivery', 'error');
      },
    });
  }

  handleDeleteLocation(id: string) {
    this.deliveryService.deleteDelivery({ id }).subscribe({
      next: (res) => {
        if (res.success) {
          this.locations = res.data; // Update locations
          this.showSnackbar(
            'Delivery location deleted successfully',
            'success'
          );
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error deleting delivery:', error);
        this.showSnackbar('Error deleting delivery', 'error');
      },
    });
  }

  resetValues() {
    this.values = {
      county: '',
      subcounty: '',
      courier: '',
      price: 0,
      description: '',
      time: 0,
      payOnDelivery: false,
    };
  }

  loadLocations() {
    this.deliveryService.getLocations().subscribe({
      next: (res) => {
        if (res.success) {
          this.apiLocations = res.data;
          // Extract unique counties from locations data
          this.counties = [];
          this.apiLocations.forEach((location: any) => {
            let county = location.split('/')[0].trim();
            if (!this.counties.includes(county)) {
              this.counties.push(county);
            }
          });
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        // console.error('Error loading locations:', error);
        this.showSnackbar('Error loading locations', 'error');
      },
    });

    this.deliveryService.getDeliveries().subscribe({
      next: (res) => {
        if (res.success) {
          this.locations = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading deliveries:', error);
        this.showSnackbar('Error loading deliveries', 'error');
      },
    });
  }

  showSnackbar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'bg-green-500' : 'bg-red-500',
    });
  }
}
