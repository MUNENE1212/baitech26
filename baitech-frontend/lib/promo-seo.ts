/**
 * Promotional SEO Configuration
 * Black Friday & GIFTCEMBER Campaign Optimization
 */

export const PROMO_KEYWORDS = [
  // Black Friday Kenya
  'Black Friday Kenya 2024',
  'Black Friday deals Nairobi',
  'Black Friday electronics Kenya',
  'Black Friday laptops Kenya',
  'Black Friday phones Nairobi',
  'Black Friday tech deals Kenya',
  'Cyber Monday Kenya',
  'Black Friday discounts Nairobi',
  'electronics sale Kenya',
  'tech sale Nairobi',

  // GIFTCEMBER Campaign
  'December gifts Kenya',
  'Christmas shopping Kenya',
  'free gifts with purchase Kenya',
  'Christmas tech deals Nairobi',
  'December promotions Kenya',
  'holiday shopping Nairobi',
  'festive deals Kenya',
  'Christmas electronics Kenya',
  'December offers Nairobi',
  'end of year sale Kenya',

  // Gift-specific
  'free gift electronics Kenya',
  'buy and get gift Kenya',
  'promotional gifts Nairobi',
  'tech gifts Kenya',
  'Christmas presents Kenya',
  'holiday gifts Nairobi',
]

export const PROMO_STRUCTURED_DATA = {
  blackFriday: {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: 'Black Friday Sale 2024 - Baitech Kenya',
    description: 'Massive Black Friday discounts up to 70% OFF on electronics, laptops, smartphones and tech accessories in Kenya. Plus free gift with every purchase!',
    category: 'https://www.wikidata.org/wiki/Q422462', // Black Friday
    datePosted: '2024-11-20',
    expires: '2024-12-01',
    announcementLocation: {
      '@type': 'Country',
      name: 'Kenya',
    },
  },

  giftcember: {
    '@context': 'https://schema.org',
    '@type': 'PromotionCatalog',
    name: 'GIFTCEMBER - December Gift Campaign',
    description: 'Shop throughout December and receive FREE gifts with every purchase! Premium, Deluxe, and Mega gifts based on purchase amount. Available at Baitech Kenya.',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    potentialAction: {
      '@type': 'BuyAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://baitech.co.ke/catalogue',
      },
    },
  },

  offerCatalog: {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Black Friday & GIFTCEMBER Deals - Baitech Kenya',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Black Friday Electronics Sale',
        description: 'Up to 70% OFF on all electronics',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          priceCurrency: 'KES',
          price: 'Up to 70% discount',
        },
        availability: 'https://schema.org/InStock',
        validFrom: '2024-11-25',
        validThrough: '2024-12-01',
      },
      {
        '@type': 'Offer',
        name: 'Free Gift with Purchase - Basic',
        description: 'Free gift with any purchase',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 0,
          priceCurrency: 'KES',
        },
        availability: 'https://schema.org/InStock',
        validFrom: '2024-12-01',
        validThrough: '2024-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Free Premium Gift - Tier 1',
        description: 'Free premium gift with purchases over KES 5,000',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 5000,
          priceCurrency: 'KES',
        },
        availability: 'https://schema.org/InStock',
        validFrom: '2024-12-01',
        validThrough: '2024-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Free Deluxe Gift - Tier 2',
        description: 'Free deluxe gift with purchases over KES 10,000',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 10000,
          priceCurrency: 'KES',
        },
        availability: 'https://schema.org/InStock',
        validFrom: '2024-12-01',
        validThrough: '2024-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Free MEGA Gift - Tier 3',
        description: 'Free mega gift with purchases over KES 20,000',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 20000,
          priceCurrency: 'KES',
        },
        availability: 'https://schema.org/InStock',
        validFrom: '2024-12-01',
        validThrough: '2024-12-31',
      },
    ],
  },
}

export const PROMO_META_TAGS = {
  blackFriday: {
    title: 'Black Friday 2024 Kenya - Up to 70% OFF Electronics | Free Gifts | Baitech',
    description: 'Massive Black Friday Sale in Kenya! Get up to 70% OFF on laptops, smartphones, gaming consoles & electronics. Plus FREE gift with every purchase. Shop now at Baitech Nairobi!',
    keywords: [
      ...PROMO_KEYWORDS,
      'up to 70% off Kenya',
      'biggest sale Kenya',
      'tech deals Black Friday',
    ],
    openGraph: {
      title: 'Black Friday 2024 - Up to 70% OFF + Free Gifts | Baitech Kenya',
      description: 'The BIGGEST tech sale in Kenya! Black Friday deals up to 70% OFF on all electronics. Free gift with every purchase. Limited time only!',
      images: [
        {
          url: 'https://baitech.co.ke/black-friday-2024.jpg',
          width: 1200,
          height: 630,
          alt: 'Black Friday 2024 Sale - Baitech Kenya',
        },
      ],
      type: 'website',
    },
  },

  giftcember: {
    title: 'GIFTCEMBER 2024 - Free Gifts with Every Purchase | Baitech Kenya',
    description: 'Celebrate December with GIFTCEMBER! Shop electronics and get FREE gifts - Premium, Deluxe, or MEGA gifts based on your purchase. Valid all December in Kenya!',
    keywords: [
      ...PROMO_KEYWORDS,
      'free gifts December',
      'Christmas promotions Kenya',
      'festive offers Nairobi',
    ],
    openGraph: {
      title: 'GIFTCEMBER - Free Gifts All December | Baitech Kenya',
      description: 'Shop & Win! Get FREE gifts with every purchase throughout December. Higher spend = Better gifts! Christmas shopping made rewarding in Kenya.',
      images: [
        {
          url: 'https://baitech.co.ke/giftcember-2024.jpg',
          width: 1200,
          height: 630,
          alt: 'GIFTCEMBER 2024 - Free Gifts Campaign - Baitech Kenya',
        },
      ],
      type: 'website',
    },
  },
}

export function getActivePromotion(): 'blackFriday' | 'giftcember' | null {
  const now = new Date()
  const blackFridayStart = new Date('2025-11-25')
  const blackFridayEnd = new Date('2026-01-10')
  const giftcemberStart = new Date('2025-12-01')
  const giftcemberEnd = new Date('2026-01-10')

  if (now >= blackFridayStart && now <= blackFridayEnd) {
    return 'blackFriday'
  } else if (now >= giftcemberStart && now <= giftcemberEnd) {
    return 'giftcember'
  }

  return null
}

export function getPromotionMetadata() {
  const activePromo = getActivePromotion()

  if (!activePromo) return null

  return PROMO_META_TAGS[activePromo]
}

export function getPromotionStructuredData() {
  const activePromo = getActivePromotion()

  if (!activePromo) return null

  return activePromo === 'blackFriday'
    ? [PROMO_STRUCTURED_DATA.blackFriday, PROMO_STRUCTURED_DATA.offerCatalog]
    : [PROMO_STRUCTURED_DATA.giftcember, PROMO_STRUCTURED_DATA.offerCatalog]
}
