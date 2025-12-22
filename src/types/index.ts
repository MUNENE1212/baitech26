import { Document, ObjectId } from 'mongodb';

// Base types
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  TECHNICIAN = 'technician'
}

export enum OrderStatus {
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  REFUNDED = 'Refunded'
}

export enum ServiceStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export type UserRoleType = 'admin' | 'customer' | 'technician';
export type OrderStatusType = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatusType = 'Pending' | 'Paid' | 'Unpaid' | 'Refunded';
export type ServiceStatusType = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

// MongoDB Document types
export interface UserDocument extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  hashed_password: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface ProductDocument extends Document {
  _id: ObjectId;
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
  created_at?: Date;
  updated_at?: Date;
  is_active: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ServiceOfferedDocument extends Document {
  _id: ObjectId;
  service_id: string;
  name: string;
  description: string;
  price_range: {
    min: number;
    max: number;
  };
  image: string;
  is_active: boolean;
  order: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ServiceRequestDocument extends Document {
  _id: ObjectId;
  service_id: string;
  customer_name: string;
  contact: string;
  service_type: string;
  item?: string;
  description: string;
  assigned_technician?: string;
  scheduled_date?: Date;
  status: ServiceStatus;
  payment_status: PaymentStatus;
  request_date: Date;
  completion_date?: Date;
  location?: {
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  notes?: string;
}

export interface TechnicianDocument extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  experience: string;
  location: string;
  availability: boolean;
  jobs_completed: number;
  average_rating: number;
  total_ratings: number;
  bio?: string;
  certifications?: string[];
  created_at?: Date;
  updated_at?: Date;
  is_active: boolean;
}

export interface TechnicianApplicationDocument extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  experience: string;
  location: string;
  bio?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_at: Date;
  reviewed_at?: Date;
  reviewed_by?: ObjectId;
  notes?: string;
}

export interface OrderItemDocument {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderDocument extends Document {
  _id: ObjectId;
  order_number: string;
  customer_name: string;
  customer_contact: string;
  customer_email?: string;
  items: OrderItemDocument[];
  subtotal: number;
  shipping_cost: number;
  total_price: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  service_note?: string;
  order_date: Date;
  shipping_address?: {
    street: string;
    city: string;
    postal_code?: string;
    country?: string;
  };
  tracking_number?: string;
  estimated_delivery?: Date;
  delivered_date?: Date;
}

export interface ReviewDocument extends Document {
  _id: ObjectId;
  customer_name: string;
  product_id?: string;
  service_id?: string;
  technician_id?: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
  verified: boolean;
  helpful?: number;
}

export interface TechnicianRatingDocument extends Document {
  _id: ObjectId;
  technician_id: ObjectId;
  customer_id: ObjectId;
  service_id: ObjectId;
  rating: number; // 1-5
  feedback: string;
  professionalism_rating?: number;
  quality_rating?: number;
  timeliness_rating?: number;
  created_at: Date;
}

// Frontend-facing types
export interface Product {
  _id?: string; // MongoDB _id field for internal use
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
  isHotDeal?: boolean;
  is_hot_deal?: boolean;
  is_on_sale?: boolean;
  discount_percentage?: number;
  originalPrice?: number;
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

export interface Service {
  _id?: string; // MongoDB _id field for internal use
  id: string;
  service_id: string;
  name: string;
  description: string;
  price_range: {
    min: number;
    max: number;
  };
  pricing?: {
    type: string;
    base_price: number;
    unit: string;
  };
  image: string;
  images?: string[];
  category?: string;
  subcategory?: string;
  estimated_duration?: string;
  features?: string[];
  is_active: boolean;
  order: number;
  is_popular?: boolean;
  rating?: number;
  num_reviews?: number;
  technicians_available?: number;
  faq?: {
    question: string;
    answer: string;
  }[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Review {
  _id?: string; // MongoDB _id field for internal use
  id: string;
  customer_name: string;
  product_id?: string;
  service_id?: string;
  technician_id?: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
  helpful?: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  total: number;
}

export interface HomePageData {
  featured_products: Product[];
  featured_services: Service[];
  recent_reviews: Review[];
  stats: {
    total_products: number;
    total_services: number;
    total_reviews: number;
  };
}

// API Request/Response types
export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface ProductCreateRequest {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  subcategory?: string;
  features?: string[];
  images?: string[];
  featured?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  subcategory?: string;
  features?: string[];
  images?: string[];
  featured?: boolean;
  is_active?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ServiceRequestCreateRequest {
  customer_name: string;
  contact: string;
  service_type: string;
  item?: string;
  description: string;
  location?: {
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  scheduled_date?: Date;
}

export interface OrderCreateRequest {
  customer_name: string;
  customer_contact: string;
  customer_email?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
  service_note?: string;
  shipping_address?: {
    street: string;
    city: string;
    postal_code?: string;
    country?: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// JWT Payload
export interface JwtPayload {
  user_id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product:${id}`,
  SERVICES_OFFERED: 'services_offered',
  SERVICE_OFFERED: (id: string) => `service_offered:${id}`,
  FEATURED_PRODUCTS: 'featured_products',
  HOMEPAGE_DATA: 'homepage_data',
  USER: (id: string) => `user:${id}`,
  REVIEWS: 'reviews',
  PRODUCT_REVIEWS: (productId: string) => `reviews:product:${productId}`,
  TECHNICIANS: 'technicians',
  TECHNICIAN: (id: string) => `technician:${id}`,
} as const;

// Error types
export class AppError extends Error {
  public details?: any;

  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.details = details;
  }
}

export class ValidationError extends AppError {
  public details?: any;

  constructor(message: string, public field?: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}