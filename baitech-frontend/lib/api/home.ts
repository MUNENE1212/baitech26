/**
 * API functions for homepage data
 */

import { api } from './client'
import type { HomePageData } from '@/types'

/**
 * Fetch homepage data including featured products, services, and reviews
 * Uses Next.js ISR (Incremental Static Regeneration) for optimal performance
 */
export async function getHomeData(): Promise<HomePageData> {
  return api.get<HomePageData>('/api/v1/home', {
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['homepage'],
    },
  })
}
