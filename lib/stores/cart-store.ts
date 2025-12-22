/**
 * Zustand store for shopping cart state management
 * Persists to localStorage for cross-session cart retention
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from 'src/types'

interface CartStore {
  items: CartItem[]
  isHydrated: boolean

  // Actions
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number

  // Hydration
  setHydrated: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      addToCart: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product_id === newItem.product_id
          )

          if (existingItemIndex > -1) {
            // Update existing item quantity
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
            }
            return { items: updatedItems }
          }

          // Add new item
          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
          }
        })
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      setHydrated: () => {
        set({ isHydrated: true })
      },
    }),
    {
      name: 'baitech-cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
