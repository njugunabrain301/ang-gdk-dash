import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Profile } from '../interfaces/profileInfo.Interface';
import { ApiResponse } from './dashboard.service';

interface FullProfileResponse {
  profile: Profile;
  MPesaTill: any;
  MPesaPaybill: any;
}

interface AccountProfile {
  // Add account profile interface properties as needed
  // This is a placeholder - update with actual properties
  id: string;
  // ... other properties
}

@Injectable({
  providedIn: 'root',
})
export class ProfileInfoService {
  private httpClient = inject(HttpClient);

  getFullProfile() {
    return this.httpClient.get<ApiResponse<FullProfileResponse>>('/profile');
  }

  getAccountProfile() {
    return this.httpClient.get<ApiResponse<AccountProfile>>('/profile/account');
  }

  updateProfile(formData: FormData) {
    return this.httpClient.post<ApiResponse<Profile>>(
      '/profile/update',
      formData
    );
  }

  getPaymentInfo() {
    return this.httpClient.get<
      ApiResponse<{
        mpesaTill: any;
        mpesaPaybill: any;
      }>
    >('/payment-info');
  }
}
