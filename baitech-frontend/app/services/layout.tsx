import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tech Services',
  description: 'Professional tech services in Kenya. Expert laptop repair, phone repair, software installation, hardware upgrades, and IT support. Quality service guaranteed.',
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
