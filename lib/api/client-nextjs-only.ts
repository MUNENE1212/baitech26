/**
 * Next.js-only API client
 * This client exclusively uses Next.js API routes and removes all Python backend dependencies
 * Use this after completing the full migration to Next.js
 */

import { ApiResponse, Product, HomePageData } from 'src/types';

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: any;
}

interface FetchOptionsType extends RequestInit {
  token?: string;
  headers?: Record<string, string> | HeadersInit;
  body?: any;
  method?: string;
  signal?: AbortSignal | null;
}

/**
 * Next.js-only API client
 */
export class NextJsApiClient {
  private token: string | null = null;
  private baseUrl: string;

  constructor() {
    // Exclusively use Next.js API routes
    // Use relative path for production (works with reverse proxy)
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

    // Ensure baseUrl ends with /api for Next.js API routes
    if (!baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.replace(/\/$/, '') + '/api';
    }

    this.baseUrl = baseUrl;

    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = window.localStorage.getItem('token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('token', token);
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('token');
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('userRole');
    }
  }

  /**
   * Get appropriate headers for request
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Always get fresh token from localStorage
    const currentToken = this.getToken();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    return headers;
  }

  /**
   * Core request method
   */
  protected async request<T>(
    endpoint: string,
    options: FetchOptionsType = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = this.getHeaders();
    const headers: Record<string, string> = {
      ...defaultHeaders,
    };

    // Add additional headers if provided
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Log request for debugging
    console.log(`[Next.js API] ${options.method || 'GET'} ${url}`, {
      method: options.method || 'GET',
      url,
      headers,
      body: options.body && !headers['Content-Type'] ? JSON.parse(options.body) : options.body,
      bodyType: headers['Content-Type'],
      tokenPresent: !!headers['Authorization']
    });

    console.log(`[Next.js API] Base URL: ${this.baseUrl}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body && !headers['Content-Type']
          ? JSON.stringify(options.body)
          : options.body,
      });

      // Handle different response types
      const contentType = response.headers.get('content-type');
      const isJsonResponse = contentType?.includes('application/json');

      let data: any;
      if (isJsonResponse) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Log response
      console.log(`[Next.js API] Response ${response.status}:`, data);

      return {
        success: response.ok,
        data,
        message: data?.message || response.statusText,
        error: response.ok ? undefined : this.extractErrorMessage(data),
      };
    } catch (error: any) {
      console.error(`[Next.js API Error] ${options.method || 'GET'} ${url}:`, error);

      return {
        success: false,
        error: error.message || 'Request failed',
        message: this.extractErrorMessage(error),
      };
    }
  }

  /**
   * Extract error message from response
   */
  private extractErrorMessage(error: any): string {
    if (error && typeof error === 'object') {
      if (error.message) return error.message;
      if (error.error) return error.error;
      if (error.detail) return error.detail;
    }
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.request<any>('/auth/logout', {
      method: 'POST',
    });

    this.clearToken();
    return response;
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/auth/me');
  }

  // ========================================
  // PRODUCT METHODS
  // ========================================

  async getProducts(options: {
    search?: string;
    category?: string;
    subcategory?: string;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<any>(`/products${query ? '?' + query : ''}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(productData: FormData | any): Promise<ApiResponse<Product>> {
    const isFormData = productData instanceof FormData;

    return this.request<Product>('/products', {
      method: 'POST',
      body: isFormData ? productData : JSON.stringify(productData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  async updateProduct(id: string, productData: FormData | any): Promise<ApiResponse<Product>> {
    const isFormData = productData instanceof FormData;

    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: isFormData ? productData : JSON.stringify(productData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getProductCategories(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/products/categories');
  }

  async getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    return this.request<Product[]>(`/products/featured${params.toString() ? '?' + params.toString() : ''}`);
  }

  // ========================================
  // SERVICE METHODS
  // ========================================

  async getServices(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/services');
  }

  async getService(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/services/${id}`);
  }

  async createService(serviceData: FormData | any): Promise<ApiResponse<any>> {
    const isFormData = serviceData instanceof FormData;

    return this.request<any>('/services', {
      method: 'POST',
      body: isFormData ? serviceData : JSON.stringify(serviceData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  async updateService(id: string, serviceData: FormData | any): Promise<ApiResponse<any>> {
    const isFormData = serviceData instanceof FormData;

    return this.request<any>(`/services/${id}`, {
      method: 'PUT',
      body: isFormData ? serviceData : JSON.stringify(serviceData),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  }

  async deleteService(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // ORDER METHODS
  // ========================================

  async getOrders(options: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<any[]>(`/orders${query ? '?' + query : ''}`);
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  // ========================================
  // USER MANAGEMENT (ADMIN)
  // ========================================

  async getUsers(options: {
    role?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<any[]>(`/users${query ? '?' + query : ''}`);
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`);
  }

  async createUser(userData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // ADMIN DASHBOARD
  // ========================================

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/dashboard');
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }

  async getRecentActivity(limit?: number): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    return this.request<any[]>(`/admin/activity${params.toString() ? '?' + params.toString() : ''}`);
  }

  // ========================================
  // IMAGE MANAGEMENT
  // ========================================

  async uploadImage(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<any>('/admin/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async uploadMultipleImages(files: File[]): Promise<ApiResponse<any[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.request<any[]>('/admin/upload/images', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getImages(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<any[]>(`/admin/images${query ? '?' + query : ''}`);
  }

  async deleteImage(publicId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/images/${publicId}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // REVIEW MANAGEMENT
  // ========================================

  async getReviews(options: {
    product_id?: string;
    service_id?: string;
    rating?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    return this.request<any[]>(`/reviews${query ? '?' + query : ''}`);
  }

  async createReview(reviewData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id: string, reviewData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================
  // SETTINGS MANAGEMENT
  // ========================================

  async getSettings(): Promise<ApiResponse<any>> {
    return this.request<any>('/settings');
  }

  async updateSettings(settingsData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // ========================================
  // HOMEPAGE DATA
  // ========================================

  async getHomepageData(): Promise<ApiResponse<HomePageData>> {
    return this.request<HomePageData>('/home');
  }

  // ========================================
  // HEALTH CHECK
  // ========================================

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }

  // ========================================
  // SIMPLE HTTP METHODS
  // ========================================

  async get<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, { method: 'GET', ...options });
    return response;
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, { method: 'POST', body: data, ...options });
    return response;
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, { method: 'PUT', body: data, ...options });
    return response;
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.request<T>(endpoint, { method: 'DELETE', ...options });
    return response;
  }
}

/**
 * Export singleton instance for use throughout the application
 */
export const apiClient = new NextJsApiClient();

/**
 * Export for backward compatibility
 */
export const api = apiClient;

/**
 * Default export
 */
export default NextJsApiClient;

/**
 * Simple API object with method aliases for compatibility
 */
export const simpleApi = {
  get: <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient.get<T>(endpoint, options).then(response => {
      if (response.success && response.data !== undefined) {
        return response.data;
      }
      return Promise.reject(response.error || 'Request failed');
    });
  },

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiClient.post<T>(endpoint, data, options).then(response => {
      if (response.success && response.data !== undefined) {
        return response.data;
      }
      return Promise.reject(response.error || 'Request failed');
    });
  },

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    return apiClient.put<T>(endpoint, data, options).then(response => {
      if (response.success && response.data !== undefined) {
        return response.data;
      }
      return Promise.reject(response.error || 'Request failed');
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient.delete<T>(endpoint, options).then(response => {
      if (response.success && response.data !== undefined) {
        return response.data;
      }
      return Promise.reject(response.error || 'Request failed');
    });
  },
};