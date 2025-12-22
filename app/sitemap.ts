import { MetadataRoute } from 'next'
import { PRODUCT_CATEGORIES } from '@/lib/categories'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://baitech.co.ke'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/catalogue`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/shipping-info`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
  ]

  // Category pages
  const categoryPages = PRODUCT_CATEGORIES.flatMap((category) => {
    const categoryPage = {
      url: `${BASE_URL}/catalogue?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }

    const subcategoryPages = category.subcategories.map((subcategory) => ({
      url: `${BASE_URL}/catalogue?category=${category.slug}&subcategory=${subcategory.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [categoryPage, ...subcategoryPages]
  })

  // Fetch products (limited for sitemap) - only if not in build time
  let productPages: MetadataRoute.Sitemap = []
  try {
    // Skip fetching during build time to avoid external API calls
    if (process.env.NODE_ENV === 'production') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || BASE_URL
      const response = await fetch(`${apiUrl}/api/products`, {
        next: { revalidate: 86400 }, // Revalidate daily
      })

      if (response.ok) {
        const data = await response.json()
        const products = data.products || []

        productPages = products.slice(0, 100).map((product: any) => ({
          url: `${BASE_URL}/products/${product._id}`,
          lastModified: new Date(product.updated_at || product.created_at),
          changeFrequency: 'weekly' as const,
          priority: product.featured ? 0.9 : 0.6,
        }))
      }
    } else {
      // During build, log message but don't fail
      console.log('Skipping product sitemap generation during build time')
    }
  } catch (error) {
    console.warn('Could not fetch products for sitemap (continuing without product pages):', error instanceof Error ? error.message : 'Unknown error')
  }

  return [...staticPages, ...categoryPages, ...productPages]
}
