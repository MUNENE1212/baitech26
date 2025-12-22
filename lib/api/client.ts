/**
 * Enhanced API client for unified Next.js application
 * Supports both legacy FastAPI backend (port 8000) and new Next.js API (port 3000)
 * Includes automatic migration detection and fallback support
 * Enhanced error handling and TypeScript support
 */

import { ApiResponse } from 'src/types';

// API Configuration
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const LEGACY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Migration State
type MigrationState = 'NEXTJS' | 'FASTAPI' | 'HYBRID';

/**
 * Get current migration state
 */
async function getMigrationState(): Promise<MigrationState> {
  // Check if we have Next.js API routes available
  const hasNextJsRoutes = await checkNextJsRoutesAvailable();

  // Check if FastAPI backend is still running
  const hasFastApiBackend = await checkFastApiBackend();

  // Default to Next.js for new setup
  if (hasNextJsRoutes && !hasFastApiBackend) {
    return 'NEXTJS';
  }

  // If FastAPI is still running but Next.js is available, use hybrid
  if (hasFastApiBackend && hasNextJsRoutes) {
    return 'HYBRID';
  }

  // If only FastAPI is available, use FastAPI
  if (hasFastApiBackend) {
    return 'FASTAPI';
  }

  // Default to Next.js if neither backend is available
  return 'NEXTJS';
}

/**
 * Check if Next.js API routes are available
 */
async function checkNextJsRoutesAvailable(): Promise<boolean> {
  try {
    // Try to connect to Next.js API health endpoint
    const response = await fetch(`${NEXT_API_URL}/home`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return response.ok;
  } catch (error) {
    // If Next.js API is not available, return false
    return false;
  }
}

/**
 * Check if FastAPI backend is available
 */
async function checkFastApiBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${LEGACY_API_URL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Enhanced API request/response interfaces
 */
interface ApiResponseType<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface FetchOptionsType extends RequestInit {
  token?: string;
  headers?: Record<string, string>;
  body?: any;
  method?: string;
  signal?: AbortSignal;
}

/**
 * Migration configuration based on environment
 */
const USE_NEXTJS = process.env.NEXT_PUBLIC_FORCE_NEXTJS === 'true';

/**
 * Enhanced API client with automatic routing
 */
export class ApiClient {
  private token: string | null = null;
  private baseUrl: string;
  private migrationState: MigrationState = 'NEXTJS';

  constructor() {
    this.baseUrl = USE_NEXTJS ? NEXT_API_URL : LEGACY_API_URL;
    this.initializeMigrationState();
  }

  /**
   * Initialize migration state asynchronously
   */
  private async initializeMigrationState() {
    this.migrationState = await getMigrationState();
    this.baseUrl = this.migrationState === 'FASTAPI' ? LEGACY_API_URL : NEXT_API_URL;
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
   * Get appropriate headers for request
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
   * Enhanced fetch with error handling and fallback
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptionsType = {}
  ): Promise<ApiResponseType<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };

    // Add request/Response logging for debugging
    console.log(`[API] ${options.method || 'GET'} ${url}`, {
      headers,
      body: options.body ? JSON.parse(options.body) : undefined,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Ensure proper content-type for POST/PUT requests
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

      return {
        success: response.ok,
        data,
        message: response.statusText,
        error: response.ok ? undefined : this.extractErrorMessage(response, data),
      };
    } catch (error: any) {
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);

      return {
        success: false,
        error: error.message || 'Request failed',
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
   * Authentication methods
   */
  async login(email: string, password: string) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(userData: any) {
    return this.request<AuthResponse>('/auth', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    return this.request<ApiResponseType>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request<AuthResponse>('/auth', {
      method: 'PUT',
    });
  }

  /**
   * Product methods
   */
  async getProducts(options: {
    search?: string;
    category?: string;
    subcategory?: string;
    min_price?: number;
    max_price?: number;
    featured?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
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
    return this.request<ProductsResponse>(`/products${query ? '?' + query : ''}`);
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(id: string) {
    return this.request<ApiResponseType>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Service methods
   */
  async getServices() {
    return this.request<any>('/services');
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  /**
   * Order methods
   */
  async getOrders() {
    return this.request<any>('/orders');
  }

  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: orderData,
    });
  }

  /**
   * Admin methods
   */
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getUsers() {
    return this.request<any>('/users');
  }

  /**
   * Homepage data
   */
  async getHomepageData() {
    return this.request<HomepageData>('/home');
  }

  /**
   * Utility methods
   */
  async healthCheck() {
    try {
      const nextHealth = await fetch(`${NEXT_API_URL}/health`, {
        method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      });

      const legacyHealth = await fetch(`${LEGACY_API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      return {
        nextjs_available: nextHealth.ok,
        fastapi_available: legacyHealth.ok,
        migration_state: this.migrationState,
        recommended_backend: nextHealth.ok ? 'Next.js' : 'FastAPI',
      };
    } catch (error: any) {
      return {
        nextjs_available: false,
        fastapi_available: false,
        migration_state: this.migrationState,
        recommended_backend: 'Unknown',
        error: error.message,
      };
    }
  }
}

/**
 * Response types for better TypeScript support
 */
interface AuthResponse {
  success: boolean;
  data?: {
    access_token?: string;
    refresh_token?: string;
    user?: any;
    token_type?: string;
  };
  message?: string;
  error?: string;
}

interface Product {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  subcategory?: string;
  features: string[];
  images: string[];
  featured: boolean;
  is_on_sale?: boolean;
  is_hot_deal?: boolean;
  discount_percentage?: number;
  original_price?: number;
  rating?: number;
  num_reviews?: number;
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  created_at?: Date;
  updated_at?: Date;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface ProductsResponse {
  success: boolean;
  data?: Product[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_products: number;
    products_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
  message?: string;
  error?: string;
}

interface HomepageData {
  featured_products?: Product[];
  featured_services?: any[];
  recent_reviews?: any[];
  stats?: {
    total_products: number;
    total_services: number;
    total_reviews: number;
  };
  message?: string;
  error?: string;
}

/**
 * API client singleton for global use
 */
export const apiClient = new ApiClient();

// Export the api as named export for compatibility
export const api = apiClient;

/**
 * Export for backward compatibility - only one default export allowed
 */
export default ApiClient;

// Create a simple API object with .get() method for backward compatibility
export const simpleApi = {
  get: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = endpoint.startsWith('/api/') ? `http://localhost:3000${endpoint}` : `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API] GET ${url}:`, error);
      throw error;
    }
  },

  post: async <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = endpoint.startsWith('/api/') ? `http://localhost:3000${endpoint}` : `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`[API] POST ${url}:`, error);
      throw error;
    }
  },

  put: async <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = endpoint.startsWith('/api/') ? `http://localhost:3000${endpoint}` : `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(`[API] PUT ${url}:`, error);
      throw error;
    }
  },

  delete: async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const url = endpoint.startsWith('/api/') ? `http://localhost:3000${endpoint}` : `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API] DELETE ${url}:`, error);
      throw error;
    }
  }
};

// Export already defined above - remove duplicate default export