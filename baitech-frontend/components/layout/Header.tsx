'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ShoppingCart, MessageCircle, LogOut, Shield } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils/cn'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'
import { toast } from 'sonner'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/catalogue' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
]

export function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const { totalItems, isHydrated } = useCart()

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    // Decode token to get role (simple check - in production use proper JWT decode)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserRole(payload.role)
      } catch (e) {
        console.error('Error decoding token:', e)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUserRole(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-zinc-200 bg-white transition-all duration-300',
        isScrolled ? 'shadow-md' : ''
      )}
    >
      {/* Main Header */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group relative flex items-center gap-3 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center">
              <img src="/favicon-32x32.png" alt="Baitech" className="h-10 w-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-zinc-900" style={{ color: '#FBB03B' }}>
                BAITECH
              </span>
              <span className="text-xs font-medium tracking-wider text-zinc-600">
                SOLUTIONS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-amber-600"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Auth Links - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-amber-600 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-amber-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-zinc-700 hover:text-amber-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 text-zinc-700 transition-colors hover:text-amber-600"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {isHydrated && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-amber-600 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-zinc-200 bg-white shadow-lg md:hidden">
          <nav className="container mx-auto px-6 py-6">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-600"
                >
                  {item.name}
                </Link>
              ))}
              <div className="my-4 border-t border-zinc-200" />
              {isLoggedIn ? (
                <>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-base font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </header>
  )
}
