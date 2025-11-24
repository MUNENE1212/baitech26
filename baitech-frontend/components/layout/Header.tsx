'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, MessageCircle, LogOut, Shield, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils/cn'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Logo } from '@/components/ui/Logo'
import { MegaMenu } from '@/components/navigation/MegaMenu'
import { toast } from 'sonner'

const navigation = [
  { name: 'Home', href: '/', hasMegaMenu: false },
  { name: 'Products', href: '/catalogue', hasMegaMenu: true, megaMenuType: 'products' as const },
  { name: 'Services', href: '/services', hasMegaMenu: true, megaMenuType: 'services' as const },
  { name: 'About', href: '/about', hasMegaMenu: false },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeMegaMenu, setActiveMegaMenu] = useState<'products' | 'services' | null>(null)
  const { totalItems, isHydrated } = useCart()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

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
      setIsScrolled(window.scrollY > 20)
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
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-zinc-200/50'
            : 'bg-white border-b border-zinc-200'
        )}
      >
        {/* Main Header */}
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Logo variant="light" size="sm" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const isMegaMenuOpen = item.hasMegaMenu && activeMegaMenu === item.megaMenuType

                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => item.hasMegaMenu && setActiveMegaMenu(item.megaMenuType!)}
                    onMouseLeave={() => item.hasMegaMenu && setActiveMegaMenu(null)}
                  >
                    <Link
                      href={item.href}
                      className="relative px-4 py-2 group block"
                    >
                      <motion.span
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isActive || isMegaMenuOpen ? 'text-amber-600' : 'text-zinc-700 group-hover:text-amber-600'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.name}
                      </motion.span>

                      {/* Active indicator */}
                      {(isActive || isMegaMenuOpen) && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-amber-50 -z-10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </div>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Auth Links - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    {userRole === 'admin' && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <Shield className="w-4 h-4" />
                          Admin
                          <Sparkles className="w-3 h-3" />
                        </Link>
                      </motion.div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-amber-600 transition-colors"
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/signup"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Cart Button with Animation */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 rounded-lg text-zinc-700 hover:text-amber-600 hover:bg-amber-50 transition-all"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {isHydrated && totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-white shadow-lg"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-700 hover:text-amber-600 hover:bg-amber-50 md:hidden transition-all"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mega Menus */}
        <MegaMenu
          isOpen={activeMegaMenu === 'products'}
          type="products"
          onClose={() => setActiveMegaMenu(null)}
        />
        <MegaMenu
          isOpen={activeMegaMenu === 'services'}
          type="services"
          onClose={() => setActiveMegaMenu(null)}
        />

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-zinc-200 bg-white/95 backdrop-blur-lg shadow-lg md:hidden"
            >
              <nav className="container mx-auto px-6 py-6">
                <div className="space-y-1">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'block px-4 py-3 rounded-lg text-base font-medium transition-all',
                            isActive
                              ? 'bg-amber-50 text-amber-600'
                              : 'text-zinc-700 hover:bg-amber-50 hover:text-amber-600'
                          )}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    )
                  })}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="my-4 border-t border-zinc-200"
                  />

                  {isLoggedIn ? (
                    <>
                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
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
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
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
                        className="block px-4 py-3 rounded-lg text-base font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  )
}
