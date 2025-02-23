import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product } from '../interfaces/Product.interface';
import { Observable } from 'rxjs';
import { ApiResponse } from './dashboard.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private httpClient = inject(HttpClient);
  constructor() {}

  getAllProductsList() {
    return this.httpClient.get<ApiResponse<any[]>>('/product/list/all', {});
  }

  getCategories(): Observable<ApiResponse<any[]>> {
    return this.httpClient.get<ApiResponse<any[]>>('/product/categories/all');
  }

  getGenderizable(): Observable<ApiResponse<any[]>> {
    return this.httpClient.get<ApiResponse<any[]>>('/product/genderizable');
  }

  getWearables(): Observable<ApiResponse<any[]>> {
    return this.httpClient.get<ApiResponse<any[]>>('/product/wearables');
  }

  getAllProducts(): Observable<ApiResponse<any[]>> {
    return this.httpClient.get<ApiResponse<any[]>>('/product/all');
  }
}
