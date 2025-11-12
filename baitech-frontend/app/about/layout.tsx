import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Baitech - your trusted partner for premium technology products and professional tech services in Kenya. Our mission, vision, and commitment to excellence.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
