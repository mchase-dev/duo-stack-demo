import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../http/api-base-url.token';
import type { ApiResponse, CreatePageRequest, Page, UpdatePageRequest } from './api.types';

@Injectable({ providedIn: 'root' })
export class PagesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getPages() {
    return this.http.get<ApiResponse<Page[]>>(`${this.baseUrl}/pages`);
  }

  getPageBySlug(slug: string) {
    return this.http.get<ApiResponse<Page>>(`${this.baseUrl}/pages/${slug}`);
  }

  createPage(data: CreatePageRequest) {
    return this.http.post<ApiResponse<Page>>(`${this.baseUrl}/pages`, data);
  }

  updatePage(pageId: string, data: UpdatePageRequest) {
    return this.http.put<ApiResponse<Page>>(`${this.baseUrl}/pages/${pageId}`, data);
  }

  deletePage(pageId: string) {
    return this.http.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/pages/${pageId}`
    );
  }
}
