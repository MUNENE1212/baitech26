/**
 * Core TypeScript type definitions for Baitech application
 */

export interface Product {
  _id: string
  product_id: string
  name: string
  price: number
  originalPrice?: number // For showing discounts
  description: string
  category: string
  images: string[]
  features: string[]
  stock: number
  featured: boolean
  isHotDeal?: boolean // Mark product as hot deal
  rating?: number // Product rating (0-5)
  created_at: string
}

export interface Service {
  _id: string
  service_id?: string
  name: string
  description: string
  category: string
  pricing: string
  estimated_duration?: string
  features?: string[]
  is_active?: boolean
  created_at?: string
}

export interface Review {
  _id: string
  customer_name: string
  comment: string
  rating?: number
  date: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
  category?: string
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'technician' | 'admin'
  created_at: string
}

export interface Order {
  _id: string
  order_id: string
  customer_name: string
  email: string
  phone: string
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  total_amount: number
  shipping_address: string
  payment_method: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  order_date: string
}

export interface HomePageData {
  featured_products: Product[]
  featured_services: Service[]
  reviews: Review[]
}
