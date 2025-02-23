import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './dashboard.service';

@Injectable({
  providedIn: 'root',
})
export class PromotionsService {
  private httpClient = inject(HttpClient);

  constructor() {}

  getPromotions(): Observable<ApiResponse<any[]>> {
    return this.httpClient.get<ApiResponse<any[]>>('/promotions');
  }

  addPromotion(data: {
    type: string;
    content: string;
  }): Observable<ApiResponse<any[]>> {
    return this.httpClient.post<ApiResponse<any[]>>('/promotions/add', data);
  }

  deletePromotion(id: string): Observable<ApiResponse<any[]>> {
    return this.httpClient.post<ApiResponse<any[]>>(`/promotions/delete`, {
      id,
    });
  }
}
