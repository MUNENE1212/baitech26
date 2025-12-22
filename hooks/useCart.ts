/**
 * Custom hook for cart operations
 * Provides a clean interface to the cart store
 */

'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect, useState } from 'react'

export function useCart() {
  const store = useCartStore()
  const [isClient, setIsClient] = useState(false)

  // Ensure hydration on client side only
  useEffect(() => {
    setIsClient(true)
  }, [])

  return {
    items: store.items,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    totalItems: store.getTotalItems(),
    totalPrice: store.getTotalPrice(),
    isHydrated: isClient && store.isHydrated,
  }
}
