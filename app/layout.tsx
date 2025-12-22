import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { ToasterProvider } from '@/components/providers/ToasterProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DEFAULT_METADATA, STRUCTURED_DATA } from '@/lib/seo'
import { getPromotionStructuredData, getPromotionMetadata, PROMO_KEYWORDS } from '@/lib/promo-seo'
import { StickyPromoBanner } from '@/components/promotions/StickyPromoBanner'
import { PromotionalBanners, ChristmasDecorationsWrapper } from '@/components/promotions/PromotionalBanners'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

// Merge promotional keywords with default keywords
const promoMetadata = getPromotionMetadata()
const mergedKeywords = promoMetadata
  ? [...(DEFAULT_METADATA.keywords || []), ...PROMO_KEYWORDS]
  : DEFAULT_METADATA.keywords

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  ...( promoMetadata ? {
    title: promoMetadata.title,
    description: promoMetadata.description,
    keywords: mergedKeywords,
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      ...promoMetadata.openGraph,
    },
  } : {}),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const promoStructuredData = getPromotionStructuredData()

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} data-scroll-behavior="smooth">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA.organization),
          }}
        />
        {/* Structured Data - Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA.localBusiness),
          }}
        />
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA.website),
          }}
        />
        {/* Promotional Structured Data */}
        {promoStructuredData && promoStructuredData.map((schema, index) => (
          <script
            key={`promo-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema),
            }}
          />
        ))}
      </head>
      <body
        className="flex min-h-screen flex-col antialiased"
        suppressHydrationWarning={true}
      >
        {/* Christmas Decorations - Only during Giftcember */}
        <ChristmasDecorationsWrapper />
        {/* Promotional Banners - Dynamic based on active promotion */}
        <PromotionalBanners />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToasterProvider />
        {/* Sticky Side Banner */}
        <StickyPromoBanner />
      </body>
    </html>
  )
}
