/**
 * TypeScript types matching backend DTOs
 */

// ========== User & Auth Types ==========

export type UserRole = 'User' | 'Admin' | 'Superuser';

export interface User {
  id: string;
  email: string;
  emailConfirmed: boolean;
  username: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: true;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
}

// ========== Event/Calendar Types ==========

export type EventVisibility = 'Private' | 'Public' | 'Restricted';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  visibility: EventVisibility;
  color: string | null;
  location: string | null;
  createdBy: string;
  creatorUsername: string;
  allowedUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  visibility: EventVisibility;
  color?: string;
  location?: string;
  allowedUserIds?: string[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  visibility?: EventVisibility;
  color?: string;
  location?: string;
  allowedUserIds?: string[];
}

// ========== Message Types ==========

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface SendMessageRequest {
  toUserId: string;
  content: string;
}

// ========== Room Types ==========

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  createdBy: string;
  creatorUsername: string;
  createdAt: string;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

// ========== Page/CMS Types ==========

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdBy: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageRequest {
  title: string;
  content: string;
  isPublished?: boolean;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
  isPublished?: boolean;
}

// ========== API Response Types ==========

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// ========== Query Params ==========

export interface EventsQueryParams {
  startTime?: string;
  endTime?: string;
  visibility?: EventVisibility;
}

export interface UsersQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
