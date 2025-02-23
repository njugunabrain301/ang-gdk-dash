import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { OrdersService } from '../../services/orders.service';
import { OrdersListComponent } from './orders-list/orders-list.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    OrdersListComponent,
    // OrdersListComponent, // To be implemented later
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  newOrders: any[] = [];
  pending: any[] = [];
  delivered: any[] = [];
  refunded: any[] = [];

  activeSection: number = 1;

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.getOrders().subscribe({
      next: (response) => {
        if (response.success) {
          this.newOrders = response.data.newOrders;
          this.pending = response.data.pending;
          this.delivered = response.data.delivered;
          this.refunded = response.data.refunded;
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      },
    });
  }

  openSection(section: number) {
    this.activeSection = section;
  }

  updateOrders(order: any) {
    const updateOrderList = (orders: any[]) => {
      return orders.map((o) => {
        if (o.oid === order.oid) {
          return {
            ...o,
            products: o.products.map((item: any) => {
              if (item._id.toString() === order.opid) {
                return { ...item, status: order.status };
              }
              return item;
            }),
          };
        }
        return o;
      });
    };

    this.newOrders = updateOrderList(this.newOrders);
    this.pending = updateOrderList(this.pending);
    this.delivered = updateOrderList(this.delivered);
  }
}
