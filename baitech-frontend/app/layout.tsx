import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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

export const metadata: Metadata = {
  title: {
    default: 'EmenTech | Premium Tech Products & Expert Services',
    template: '%s | EmenTech'
  },
  description: 'Discover premium technology products and professional tech services in Kenya. Where innovation meets craftsmanship. Shop gadgets, accessories, and get expert tech support.',
  keywords: [
    'EmenTech',
    'tech shop Kenya',
    'premium gadgets',
    'tech accessories',
    'tech services',
    'laptop repair',
    'phone repair',
    'smart watches',
    'microphones',
    'Nairobi tech',
    'online tech store Kenya'
  ],
  authors: [{ name: 'EmenTech', url: 'https://ementech.co.ke' }],
  creator: 'EmenTech',
  publisher: 'EmenTech',
  metadataBase: new URL('https://ementech.co.ke'),
  openGraph: {
    title: 'EmenTech - Premium Tech Products & Services',
    description: 'Premium technology products and professional tech services in Kenya. Where innovation meets craftsmanship.',
    type: 'website',
    locale: 'en_KE',
    siteName: 'EmenTech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EmenTech - Premium Tech Products & Services',
    description: 'Premium technology products and professional tech services in Kenya',
    creator: '@ementech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
