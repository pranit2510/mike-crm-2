export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
} 