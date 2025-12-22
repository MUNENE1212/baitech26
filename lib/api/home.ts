/**
 * API functions for homepage data
 */

import { simpleApi as api } from './client-nextjs-only'
import type { HomePageData } from 'src/types'

/**
 * Fetch homepage data including featured products, services, and reviews
 * Uses Next.js ISR (Incremental Static Regeneration) for optimal performance
 */
export async function getHomeData(): Promise<HomePageData> {
  return api.get<HomePageData>('/home', {
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ['homepage'],
    },
  })
}
