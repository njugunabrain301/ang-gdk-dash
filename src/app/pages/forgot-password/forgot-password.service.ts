import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

interface RequestPasswordResetResponse {
  token: string;
  // Add any other properties that your API returns
}

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordService {
  private httpClient = inject(HttpClient);
  constructor() {}

  requestPasswordReset(payload: { url: string }) {
    return this.httpClient.post<RequestPasswordResetResponse>(
      '/request-reset-password',
      payload
    );
  }
}
