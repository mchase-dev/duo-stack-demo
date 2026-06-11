import apiClient from './client';
import type { Message, Conversation, ApiResponse, SendMessageRequest } from '../types';

export const messagesApi = {
  /**
   * Get all conversations for current user
   */
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    const response = await apiClient.get<ApiResponse<Conversation[]>>('/messages/conversations');
    return response.data;
  },

  /**
   * Get conversation with specific user
   */
  getConversation: async (userId: string): Promise<ApiResponse<{ messages: Message[] }>> => {
    const response = await apiClient.get<ApiResponse<{ messages: Message[] }>>(`/messages/conversations/${userId}`);
    return response.data;
  },

  /**
   * Send a message
   */
  sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post<ApiResponse<Message>>('/messages', data);
    return response.data;
  },
};
