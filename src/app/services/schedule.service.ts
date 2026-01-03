import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from './dashboard.service';

export interface ScheduleData {
  timezone: string;
  facebookPostTimes: string[];
  facebookPostsMadeToday: number;
  facebookNextRunAt: string | null;
  instagramPostTimes: string[];
  instagramPostsMadeToday: number;
  instagramNextRunAt: string | null;
  lastRunAt: string | null;
  status: 'active' | 'paused';
  facebookPageId?: string | null;
  facebookAccessToken?: string | null;
  instagramAccountId?: string | null;
}

export interface ScheduleUpdateRequest {
  timezone?: string;
  facebookPostTimes?: string[];
  instagramPostTimes?: string[];
  facebookPageId?: string | null;
  facebookAccessToken?: string | null;
  instagramAccountId?: string | null;
  status?: 'active' | 'paused';
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private httpClient = inject(HttpClient);

  getSchedule() {
    return this.httpClient.get<ApiResponse<ScheduleData>>('/schedule');
  }

  updateSchedule(data: ScheduleUpdateRequest) {
    return this.httpClient.post<ApiResponse<ScheduleData>>('/schedule', data);
  }
}
