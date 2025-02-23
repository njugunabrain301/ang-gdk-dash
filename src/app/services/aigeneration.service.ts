import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AIGenerationService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  generateSpecs(payload: any) {
    return this.http.post<any>(`/product/ai/specs`, payload);
  }

  generateDescription(name: string, category: string): Promise<string> {
    return this.http
      .post<{ description: string }>(`${this.apiUrl}/generate-description`, {
        name,
        category,
      })
      .toPromise()
      .then((response) => response?.description || '');
  }

  generateFaqs(payload: any) {
    return this.http.post<any>(`/product/ai/faqs`, payload);
  }

  generateUsp(payload: any) {
    return this.http.post<any>(`/product/ai/usps`, payload);
  }

  generateArticle(type: string, context: string): Promise<string> {
    return this.http
      .post<{ content: string }>(`${this.apiUrl}/generate-article`, {
        type,
        context,
      })
      .toPromise()
      .then((response) => response?.content || '');
  }
}
