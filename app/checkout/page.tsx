'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { X, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart, isHydrated } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    shipping_address: {
      address: '',
      city: '',
      postal_code: '',
      country: 'Kenya'
    },
    payment_method: 'mpesa',
    service_note: ''
  })

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Your cart is empty</h2>
          <p className="text-zinc-600 mb-8">Add some products before proceeding to checkout</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof formData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_name || !formData.customer_contact) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const orderData = {
        ...formData,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        total_amount: totalPrice
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Order placed successfully!')
        clearCart()
        router.push(`/order-confirmation?order=${data.data.order_number}`)
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('An error occurred while processing your order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 mt-4">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-zinc-100 pb-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-zinc-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="text-sm font-medium text-zinc-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      Ksh {item.price.toLocaleString()}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-zinc-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-8 w-10 items-center justify-center text-sm font-medium text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <div className="flex justify-between text-sm text-zinc-600 mb-2">
                <span>Subtotal ({totalItems} items)</span>
                <span>Ksh {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-zinc-900">
                <span>Total</span>
                <span>Ksh {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">Customer Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-4">Personal Details</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="customer_contact" className="block text-sm font-medium text-zinc-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="customer_contact"
                      name="customer_contact"
                      value={formData.customer_contact}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      placeholder="+254712345678"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-4">Shipping Address</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-zinc-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="shipping_address.address"
                      value={formData.shipping_address.address}
                      onChange={handleInputChange}
                      className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-zinc-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="shipping_address.city"
                        value={formData.shipping_address.city}
                        onChange={handleInputChange}
                        className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                        placeholder="Nairobi"
                      />
                    </div>

                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-zinc-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        name="shipping_address.postal_code"
                        value={formData.shipping_address.postal_code}
                        onChange={handleInputChange}
                        className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                        placeholder="00100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-4">Payment Method</h3>

                <div>
                  <label htmlFor="payment_method" className="block text-sm font-medium text-zinc-700 mb-1">
                    Preferred Payment Method
                  </label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash on Delivery</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label htmlFor="service_note" className="block text-sm font-medium text-zinc-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="service_note"
                  name="service_note"
                  value={formData.service_note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="Any special instructions or delivery notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Processing...' : `Place Order • Ksh ${totalPrice.toLocaleString()}`}
              </button>

              <p className="text-xs text-zinc-500 text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}