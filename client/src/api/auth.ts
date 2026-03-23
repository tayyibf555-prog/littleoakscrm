import api from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'PARENT';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface MeResponse extends AuthUser {
  lastLoginAt: string | null;
  createdAt: string;
  staffProfile: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
    jobTitle: string;
  } | null;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post<LoginResponse>('/auth/refresh'),

  me: () => api.get<MeResponse>('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
};
