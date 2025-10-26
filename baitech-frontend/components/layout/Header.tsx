'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, MessageCircle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils/cn'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/catalogue' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
]

const authNavigation = [
  { name: 'Login', href: '/login' },
  { name: 'Sign Up', href: '/signup' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { totalItems, isHydrated } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            className="group relative flex items-center gap-2 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <span className="text-xl font-bold text-white">E</span>
            </div>
            <span className="text-2xl font-light tracking-tight text-zinc-900">
              Emen<span className="font-semibold">Tech</span>
            </span>
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
              {authNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-all",
                    item.name === 'Sign Up'
                      ? "bg-amber-600 text-white px-4 py-2 hover:bg-amber-700"
                      : "text-zinc-700 hover:text-amber-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
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
              {authNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 text-base font-medium transition-colors",
                    item.name === 'Sign Up'
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "text-zinc-700 hover:bg-amber-50 hover:text-amber-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </header>
  )
}
