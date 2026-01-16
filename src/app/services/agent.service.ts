import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface AgentQueryRequest {
  query: string;
  openaiApiKey?: string;
}

export interface AgentQueryResponse {
  success: boolean;
  data: {
    response: string;
    query: string;
  };
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private httpClient = inject(HttpClient);

  /**
   * Send a query to the AI agent
   * @param query - Natural language query
   * @param openaiApiKey - Optional OpenAI API key (if not set in env)
   * @returns Observable with agent response
   */
  queryAgent(query: string, openaiApiKey?: string) {
    const payload: AgentQueryRequest = {
      query,
    };

    if (openaiApiKey) {
      payload.openaiApiKey = openaiApiKey;
    }

    return this.httpClient.post<AgentQueryResponse>('/agent/query', payload);
  }
}
