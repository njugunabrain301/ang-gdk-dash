import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  constructor(private http: HttpClient) {}

  resetPassword(data: { password: string; token: string }): Observable<any> {
    return this.http.post(`/reset-password`, data);
  }
}
