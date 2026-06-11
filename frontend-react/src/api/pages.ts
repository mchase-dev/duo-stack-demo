import apiClient from './client';
import type { Page, ApiResponse, CreatePageRequest, UpdatePageRequest } from '../types';

export const pagesApi = {
  /**
   * Get all pages
   */
  getPages: async (): Promise<ApiResponse<Page[]>> => {
    const response = await apiClient.get<ApiResponse<Page[]>>('/pages');
    return response.data;
  },

  /**
   * Get page by slug
   */
  getPageBySlug: async (slug: string): Promise<ApiResponse<Page>> => {
    const response = await apiClient.get<ApiResponse<Page>>(`/pages/${slug}`);
    return response.data;
  },

  /**
   * Create new page (Superuser only)
   */
  createPage: async (data: CreatePageRequest): Promise<ApiResponse<Page>> => {
    const response = await apiClient.post<ApiResponse<Page>>('/pages', data);
    return response.data;
  },

  /**
   * Update page (Superuser only)
   */
  updatePage: async (pageId: string, data: UpdatePageRequest): Promise<ApiResponse<Page>> => {
    const response = await apiClient.put<ApiResponse<Page>>(`/pages/${pageId}`, data);
    return response.data;
  },

  /**
   * Delete page (Superuser only)
   */
  deletePage: async (pageId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/pages/${pageId}`);
    return response.data;
  },
};
