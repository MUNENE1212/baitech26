'use client'

import { useCart } from '@/hooks/useCart'
import { X, Minus, Plus, Trash2, ShoppingCart, CreditCard } from 'lucide-react'
import { WhatsAppCheckout } from './WhatsAppCheckout'
import Image from 'next/image'
import Link from 'next/link'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, isHydrated } = useCart()

  if (!isHydrated) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">Shopping Cart</h2>
              <p className="text-sm text-zinc-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-zinc-500">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="mt-4 border border-zinc-900 bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-900"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-4 border-b border-zinc-100 pb-4"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-zinc-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 20vw, 15vw"
                          unoptimized={item.image?.includes('cloudinary')}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col">
                      <h3 className="text-sm font-medium text-zinc-900 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-zinc-900">
                        Ksh {item.price.toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center border border-zinc-200">
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, Math.max(1, item.quantity - 1))
                            }
                            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-10 items-center justify-center text-sm font-medium text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-auto text-zinc-400 transition-colors hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-zinc-200 bg-zinc-50 p-6">
              {/* Total */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600">Subtotal</span>
                <span className="text-2xl font-semibold text-zinc-900">
                  Ksh {totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="group flex w-full items-center justify-center gap-2 border border-zinc-900 bg-black px-6 py-4 font-medium text-white transition-all hover:bg-zinc-900"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Checkout</span>
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-zinc-50 px-2 text-zinc-500">OR</span>
                  </div>
                </div>

                <WhatsAppCheckout />

                <p className="mt-3 text-center text-xs text-zinc-500">
                  Choose your preferred checkout method
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
