import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Products',
  description: 'Browse our complete collection of premium tech products including smart watches, microphones, accessories, and more. Shop quality gadgets with expert support.',
}

export default function CatalogueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
