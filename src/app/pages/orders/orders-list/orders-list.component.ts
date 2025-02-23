import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrdersService } from '../../../services/orders.service';
import { OrderComponent } from '../order/order.component';
// import { OrderComponent } from './order/order.component'; // To be implemented later

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    OrderComponent,
    // OrderComponent // To be implemented later
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent {
  @Input() orders: any[] = [];
  @Input() modifiable: boolean = false;
  @Output() ordersUpdate = new EventEmitter<any>();

  constructor(private ordersService: OrdersService) {}
}
