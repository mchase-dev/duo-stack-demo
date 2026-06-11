import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type { ApiResponse, Conversation, Message, SendMessageRequest } from './api.types';

@Injectable({ providedIn: 'root' })
export class MessagesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getConversations() {
    return this.http.get<ApiResponse<Conversation[]>>(`${this.baseUrl}/messages/conversations`);
  }

  getConversation(userId: string) {
    return this.http.get<ApiResponse<{ messages: Message[] }>>(
      `${this.baseUrl}/messages/conversations/${userId}`
    );
  }

  sendMessage(data: SendMessageRequest) {
    return this.http.post<ApiResponse<Message>>(`${this.baseUrl}/messages`, data);
  }
}
