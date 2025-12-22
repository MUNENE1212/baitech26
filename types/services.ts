// Service interface for services page
export interface ServiceService {
  id: string
  service_id: string
  name: string
  description: string
  category: string
  subcategory: string
  price_range: {
    min: number
    max: number
  }
  pricing: {
    type: string
    base_price: number
    unit: string
  }
  duration_estimate: string
  duration_hours: number
  image?: string
  is_active: boolean
  order: number
  featured: boolean
  service_type: string
  features: string[]
  requirements: string[]
  estimated_duration: string
  image_url?: string
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  created_at: string
  updated_at: string
}