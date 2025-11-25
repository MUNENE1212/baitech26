/**
 * SEO Configuration for Baitech - Kenya Market
 * Optimized for Kenyan audience and Google Search
 */

export const SITE_CONFIG = {
  name: 'Baitech',
  title: 'Baitech - Premium Electronics & Tech Services in Kenya | Nairobi',
  description: 'Buy the latest electronics, gadgets, laptops, and smartphones in Kenya. Professional tech repair services in Nairobi. Free delivery in Nairobi, Kenya-wide shipping available.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://baitech.co.ke',
  locale: 'en_KE',
  country: 'Kenya',
  region: 'Nairobi',
  currency: 'KES',
  phone: '+254799954672',
  email: 'mnent2025@gmail.com',
  socialMedia: {
    twitter: '@baitech_ke',
    facebook: 'baitech.ke',
    instagram: '@baitech.ke',
  },
}

export const KENYA_KEYWORDS = [
  // Location-based
  'electronics Kenya',
  'tech store Nairobi',
  'buy laptops Kenya',
  'smartphones Nairobi',
  'computer shop Kenya',
  'electronics Nairobi CBD',
  'tech accessories Kenya',

  // Product categories
  'gaming consoles Kenya',
  'PlayStation 5 Kenya',
  'iPhone Kenya',
  'Samsung phones Kenya',
  'laptop repair Nairobi',
  'computer accessories Kenya',
  'Bluetooth speakers Kenya',
  'headphones Kenya',
  'power banks Kenya',

  // Services
  'laptop repair Nairobi',
  'phone repair Kenya',
  'computer repair services',
  'tech support Nairobi',
  'software installation Kenya',
  'data recovery Nairobi',

  // Delivery
  'free delivery Nairobi',
  'Kenya-wide shipping',
  'electronics online Kenya',
  'buy tech online Kenya',

  // Payment
  'M-Pesa electronics',
  'buy now pay later Kenya',
  'affordable electronics Kenya',
]

export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo-lg.png`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
      addressRegion: 'Nairobi',
      addressLocality: 'Nairobi',
    },
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.socialMedia.twitter}`,
      `https://facebook.com/${SITE_CONFIG.socialMedia.facebook}`,
      `https://instagram.com/${SITE_CONFIG.socialMedia.instagram}`,
    ],
  },

  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: SITE_CONFIG.name,
    image: `${SITE_CONFIG.url}/logo-lg.png`,
    '@id': SITE_CONFIG.url,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.phone,
    priceRange: 'KES 500 - KES 150,000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi CBD',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      postalCode: '00100',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2921,
      longitude: 36.8219,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    paymentAccepted: ['Cash', 'M-Pesa', 'Credit Card', 'Bank Transfer'],
    currenciesAccepted: 'KES',
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/catalogue?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
}

export function generateProductStructuredData(product: {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  brand?: string
  category: string
  stock: number
  rating?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Generic',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_CONFIG.url}/products/${product._id}`,
      priceCurrency: 'KES',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      ratingCount: 1,
    } : undefined,
  }
}

export function generateServiceStructuredData(service: {
  _id: string
  name: string
  description: string
  pricing: number
  category: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      telephone: SITE_CONFIG.phone,
    },
    areaServed: {
      '@type': 'City',
      name: 'Nairobi',
      '@id': 'https://www.wikidata.org/wiki/Q3870',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: service.pricing,
    },
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  }
}

export const DEFAULT_METADATA = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name} - Kenya`,
  },
  description: SITE_CONFIG.description,
  keywords: KENYA_KEYWORDS,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Electronics in Kenya`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.socialMedia.twitter,
    creator: SITE_CONFIG.socialMedia.twitter,
    images: [`${SITE_CONFIG.url}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
}
