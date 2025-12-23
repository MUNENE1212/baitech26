'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token) {
      // No token found, redirect to login
      const returnUrl = encodeURIComponent('/admin')
      router.push(`/login?redirect=${returnUrl}`)
      return
    }

    if (!userStr) {
      // No user data found, redirect to login
      const returnUrl = encodeURIComponent('/admin')
      router.push(`/login?redirect=${returnUrl}`)
      return
    }

    try {
      const user = JSON.parse(userStr)

      // Check if user is admin
      if (user.role !== 'admin') {
        // User is not admin, redirect to home
        router.push('/')
        return
      }
    } catch (error) {
      // Invalid user data, redirect to login
      const returnUrl = encodeURIComponent('/admin')
      router.push(`/login?redirect=${returnUrl}`)
      return
    }
  }, [router])

  // While checking auth, show loading
  return <>{children}</>
}

/**
 * Higher-order component to protect admin routes
 */
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AdminAuthWrapper>
        <Component {...props} />
      </AdminAuthWrapper>
    )
  }
}
