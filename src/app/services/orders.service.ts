import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface OrderProduct {
  _id: string;
  name: string;
  description: string;
  img: string;
  size: string;
  color: string;
  amount: number;
  price: number;
  status: string;
}

interface Order {
  oid: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  total: number;
  paymentMode: string;
  paymentCode: string;
  county: string;
  subcounty: string;
  courier: string;
  pickupDescription: string;
  products: OrderProduct[];
  status: string;
}

interface OrdersResponse {
  newOrders: Order[];
  pending: Order[];
  delivered: Order[];
  refunded: Order[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Get all orders grouped by status
   */
  getOrders(): Observable<ApiResponse<OrdersResponse>> {
    return this.httpClient.get<ApiResponse<OrdersResponse>>('/orders');
  }

  /**
   * Update the status of a specific product in an order
   */
  setStatus(
    oid: string,
    uid: string,
    opid: string,
    status: string
  ): Observable<ApiResponse<Order>> {
    return this.httpClient.post<ApiResponse<Order>>('/order/status', {
      oid,
      uid,
      opid,
      status,
    });
  }

  /**
   * Download receipt for a specific order
   */
  downloadReceipt(oid: string, uid: string): Observable<Blob> {
    return this.httpClient.get(`/receipt/${oid}/${uid}`, {
      responseType: 'blob',
    });
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(oid: string): Observable<ApiResponse<Order>> {
    return this.httpClient.get<ApiResponse<Order>>(`/orders/${oid}`);
  }

  /**
   * Get orders for a specific user
   */
  getUserOrders(uid: string): Observable<ApiResponse<Order[]>> {
    return this.httpClient.get<ApiResponse<Order[]>>(`/orders/user/${uid}`);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: string): Observable<ApiResponse<Order[]>> {
    return this.httpClient.get<ApiResponse<Order[]>>(
      `/orders/status/${status}`
    );
  }

  /**
   * Search orders by various criteria
   */
  searchOrders(query: {
    oid?: string;
    uid?: string;
    email?: string;
    phone?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<ApiResponse<Order[]>> {
    return this.httpClient.post<ApiResponse<Order[]>>('/orders/search', query);
  }

  /**
   * Export orders to CSV/Excel
   */
  exportOrders(
    format: 'csv' | 'excel',
    query?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Observable<Blob> {
    return this.httpClient.post(`/orders/export/${format}`, query, {
      responseType: 'blob',
    });
  }

  /**
   * Get order statistics
   */
  getOrderStats(): Observable<
    ApiResponse<{
      total: number;
      new: number;
      pending: number;
      delivered: number;
      refunded: number;
      revenue: number;
    }>
  > {
    return this.httpClient.get<ApiResponse<any>>('/orders/stats');
  }

  /**
   * Update order details
   */
  updateOrder(
    oid: string,
    updateData: Partial<Order>
  ): Observable<ApiResponse<Order>> {
    return this.httpClient.put<ApiResponse<Order>>(
      `/orders/${oid}`,
      updateData
    );
  }

  /**
   * Delete an order (if allowed)
   */
  deleteOrder(oid: string): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(`/orders/${oid}`);
  }

  /**
   * Get order audit logs
   */
  getOrderLogs(oid: string): Observable<
    ApiResponse<
      {
        timestamp: string;
        action: string;
        user: string;
        details: string;
      }[]
    >
  > {
    return this.httpClient.get<ApiResponse<any[]>>(`/orders/${oid}/logs`);
  }
}
