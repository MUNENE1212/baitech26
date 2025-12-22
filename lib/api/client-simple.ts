/**
 * Simplified API client for Next.js full-stack application
 * Addresses TypeScript compilation issues
 * Provides automatic migration detection with fallback support
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Enhanced API client for unified Next.js application
 */
export class ApiClient {
  private token: string | null = null;
  private baseUrl: string;
  private useNextJs: boolean = true;

  constructor() {
    // Determine which backend to use
    const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const LEGACY_API_URL = process.env.NEXT_PUBLIC_LEGACY_API_URL || 'http://localhost:8000';

    // Default to Next.js, check asynchronously
    this.useNextJs = true;
    this.baseUrl = NEXT_API_URL;

    // Check availability asynchronously
    this.checkNextJsRoutesAvailable().then((available) => {
      if (!available) {
        this.useNextJs = false;
        this.baseUrl = LEGACY_API_URL;
      }
    });
  }

  /**
   * Check if Next.js API routes are available
   */
  private async checkNextJsRoutesAvailable(): Promise<boolean> {
    try {
      // Simple health check - no complex response parsing needed
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/home`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      return response.ok;
    } catch (error) {
      // If Next.js API fails, we can still fall back to FastAPI
      return false;
    }
  }

  /**
   * Get appropriate headers for requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Enhanced fetch with error handling
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body && !headers['Content-Type'] ? JSON.stringify(options.body) : undefined,
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

      return {
        success: response.ok,
        data,
        message: response.statusText,
        error: response.ok ? undefined : this.extractErrorMessage(response, data),
      };
    } catch (error: any) {
      console.error(`[API] ${options.method || 'GET'} ${url}:`, error);

      return {
        success: false,
        error: error?.message || 'Request failed',
        message: this.extractErrorMessage(error, null),
      };
    }
  }

  /**
   * Extract error message from response
   */
  private extractErrorMessage(response: Response | Error, data: any): string {
    if (data && typeof data === 'object' && data.message) {
      return data.message;
    }
    if (response instanceof Response) {
      return response.statusText || 'Request failed';
    }
    return 'An unexpected error occurred';
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
    }
  }

  /**
   * Authentication methods
   */
  async login(email: string, password: string) {
    return this.request<ApiResponse<any>>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(userData: any) {
    return this.request<ApiResponse<any>>('/auth', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    return this.request<ApiResponse<any>>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request<ApiResponse<any>>('/auth', {
      method: 'PUT',
    });
  }

  /**
   * Product methods
   */
  async getProducts(options: any = {}) {
    const params = new URLSearchParams();

    if (options.search) params.append('search', options.search);
    if (options.category) params.append('category', options.category);
    if (options.subcategory) params.append('subcategory', options.subcategory);
    if (options.min_price) params.append('min_price', options.min_price.toString());
    if (options.max_price) params.append('max_price', options.max_price.toString());
    if (options.featured !== undefined) params.append('featured', options.featured.toString());
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const query = params.toString();
    return this.request<any>(`/products${query ? '?' + query : ''}`);
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/products/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Export for backward compatibility
 */
export const apiClient = new ApiClient();