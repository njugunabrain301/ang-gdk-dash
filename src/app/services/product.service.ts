import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { Article } from '../interfaces/Product.interface';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AffiliateProductsParams {
  batchNo: number;
  search: string;
}

export interface ProductAPIResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  fetchProduct(id: string): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(`/product/${id}`);
  }

  addProduct(formData: FormData): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/product', formData);
  }

  getAffiliateProducts(payload: AffiliateProductsParams): Observable<any> {
    return this.httpClient.post('/product/affiliate', payload);
  }

  copyAffiliateProduct(productId: string): Observable<any> {
    return this.httpClient.post('/product/copy', {
      origId: productId,
    });
  }

  updateProduct(formData: FormData): Observable<any> {
    return this.httpClient.post(`/product/update`, formData).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  deleteProduct(productId: string): Observable<any> {
    return this.httpClient.post(`/product/delete`, { _id: productId }).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('img', file);
    return this.httpClient.post(`/image/upload/single`, formData).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  generateAIContent(params: any): Observable<any> {
    return this.httpClient.post(`/product/ai/info`, params).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  generateDescription(params: any): Observable<any> {
    return this.httpClient.post(`/product/ai/info`, params).pipe(
      map((response) => response),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }

  // updateProduct(formData: FormData): Observable<ProductAPIResponse<any>> {
  //   return this.httpClient.post<ProductAPIResponse<any>>('/product/update', formData);
  // }

  // deleteProduct(data: { _id: string }): Observable<ProductAPIResponse<any>> {
  //   return this.httpClient.post<ProductAPIResponse<any>>('/product/delete', data);
  // }

  addImage(formData: FormData): Observable<ProductAPIResponse<any>> {
    return this.httpClient.post<ProductAPIResponse<any>>(
      '/product/image/add',
      formData
    );
  }

  removeImage(data: {
    pid: string;
    iid: string;
  }): Observable<ProductAPIResponse<any>> {
    return this.httpClient.post<ProductAPIResponse<any>>(
      '/product/image/remove',
      data
    );
  }

  // AI-related endpoints
  generateAIInfo(data: {
    pid: string;
    message: string;
    description: string;
  }): Observable<ProductAPIResponse<any>> {
    return this.httpClient.post<ProductAPIResponse<any>>(
      '/product/ai/info',
      data
    );
  }

  generateAISpecs(data: {
    pid: string;
    specs: string;
    num: number;
  }): Observable<ProductAPIResponse<any>> {
    return this.httpClient.post<ProductAPIResponse<any>>(
      '/product/ai/specs',
      data
    );
  }

  generateAIFaqs(data: {
    pid: string;
    faqs: string;
    num: number;
  }): Observable<ProductAPIResponse<any>> {
    return this.httpClient.post<ProductAPIResponse<any>>(
      '/product/ai/faqs',
      data
    );
  }

  generateAIUsps(data: {
    pid: string;
    usps: string;
    num: number;
  }): Observable<ProductAPIResponse<any>> {
    return this.httpClient.post<ProductAPIResponse<any>>(
      '/product/ai/usps',
      data
    );
  }

  deleteProductImage(productId: string, imageId: string) {
    return this.httpClient.delete<any>(
      `/product/${productId}/images/${imageId}`
    );
  }

  // Add these methods to your ProductService
  getProductAffiliates(productId: string) {
    return this.httpClient.get<any>(`/product/affiliates/${productId}`);
  }

  revokeAffiliate(affiliateId: string) {
    return this.httpClient.delete<any>(`/affiliates/${affiliateId}`);
  }

  updateArticleVisibility(
    articleId: string,
    visibility: boolean
  ): Observable<any> {
    return this.httpClient.put(`/api/articles/${articleId}/visibility`, {
      visibility,
    });
  }

  deleteArticle(articleId: string): Observable<any> {
    return this.httpClient.delete(`/api/articles/${articleId}`);
  }

  updateArticle(article: Article): Observable<any> {
    return this.httpClient.put(`/api/articles/${article._id}`, article);
  }
}
