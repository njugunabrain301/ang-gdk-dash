import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from './dashboard.service';
import { PolicyReturns, PolicyShipping } from '../interfaces/policy.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PoliciesService {
  constructor(private httpClient: HttpClient) {}

  fetchPolicies(): Observable<{
    success: boolean;
    data: {
      returnsPolicy: PolicyReturns;
      shippingPolicy: PolicyShipping;
    };
  }> {
    return this.httpClient.get<
      ApiResponse<{
        returnsPolicy: PolicyReturns;
        shippingPolicy: PolicyShipping;
      }>
    >('/profile/policies');
  }

  updatePolicies(policies: {
    returns: PolicyReturns;
    shipping: PolicyShipping;
  }) {
    return this.httpClient.post<
      ApiResponse<{
        returnsPolicy: PolicyReturns;
        shippingPolicy: PolicyShipping;
      }>
    >('/profile/policies/update', policies);
  }
}
