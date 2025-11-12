'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OurServicesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to services page
    router.replace('/services')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mx-auto"></div>
        <p className="text-zinc-600">Redirecting to services...</p>
      </div>
    </div>
  )
}
