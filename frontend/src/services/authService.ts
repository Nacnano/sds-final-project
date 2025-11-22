import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/users/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Backend expects email, password, and role (defaulting to 'user')
      const response = await api.post<AuthResponse>('/users', {
        email: data.email,
        password: data.password,
        role: 'user', // Default role for new users
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Google OAuth login
  initiateGoogleLogin() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  // Handle OAuth callback (called from callback page)
  async handleOAuthCallback(token: string): Promise<void> {
    // Store the token received from OAuth callback
    localStorage.setItem('token', token);
    
    // Optionally fetch user data with the token
    // You might want to add a /auth/me endpoint to get current user info
    try {
      const response = await api.get('/users/test'); // Using test endpoint to verify token
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Failed to fetch user data after OAuth:', error);
      throw error;
    }
  },
};
