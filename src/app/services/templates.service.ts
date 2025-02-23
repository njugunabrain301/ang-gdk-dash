import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Template {
  name: string;
  themes: string[];
  // Add other template properties as needed
}

export interface TemplatesResponse {
  templates: Template[];
  selectedTemplate: string;
  selectedTheme: string;
  holidayTheme: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class TemplatesService {
  private httpClient = inject(HttpClient);

  getTemplates(): Observable<ApiResponse<TemplatesResponse>> {
    return this.httpClient.get<ApiResponse<TemplatesResponse>>('/templates');
  }

  setHolidayTheme(
    holidayTheme: boolean
  ): Observable<ApiResponse<{ holidayTheme: boolean }>> {
    return this.httpClient.post<ApiResponse<{ holidayTheme: boolean }>>(
      '/holidayTheme',
      { holidayTheme }
    );
  }

  updateSelectedTemplate(
    payload: any
  ): Observable<ApiResponse<TemplatesResponse>> {
    return this.httpClient.post<ApiResponse<TemplatesResponse>>(
      '/template',
      payload
    );
  }
}
