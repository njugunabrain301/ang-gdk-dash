import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  token: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(url: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`/login`, {
      url,
      password,
    });
  }

  logout(): void {
    // Remove the token from storage
    localStorage.removeItem('token');
    localStorage.clear();
    sessionStorage.clear();
  }

  isLoggedIn(): boolean {
    // Check if the token exists in storage
    return !!localStorage.getItem('token');
  }
}
