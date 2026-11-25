/** Shapes of the backend responses: { success: true, data } or { success: false, message, errors }. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: { field?: string; message: string }[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
