'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, Package, Truck, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface OrderData {
  order_number: string
  status: string
  total_amount: number
  created_at: string
  customer_name: string
  customer_contact: string
  shipping_address?: {
    address: string
    city: string
    postal_code: string
    country: string
  }
  payment_method: string
  items: Array<{
    product_id: string
    quantity: number
    name?: string
    price?: number
  }>
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderNumber = searchParams.get('order')
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderNumber) {
      router.push('/')
      return
    }

    fetchOrderData(orderNumber)
  }, [orderNumber, router])

  const fetchOrderData = async (orderNum: string) => {
    try {
      const response = await fetch(`/api/orders/${orderNum}`)
      const data = await response.json()

      if (response.ok) {
        setOrderData(data.data)
      } else {
        setError(data.error || 'Order not found')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-zinc-600 mb-8">{error || 'Order not found'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            Order Confirmed!
          </h1>

          <p className="text-lg text-zinc-600 mb-2">
            Thank you for your order, {orderData.customer_name}
          </p>

          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 inline-block px-4 py-2">
            <p className="text-sm text-zinc-500">Order Number</p>
            <p className="text-lg font-semibold text-zinc-900">{orderData.order_number}</p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Order Status</h2>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Order Received</p>
                <p className="text-sm text-zinc-500">
                  {new Date(orderData.created_at).toLocaleDateString()} • {
                    new Date(orderData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Processing</p>
                <p className="text-sm text-zinc-500">We're preparing your order</p>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-50">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-500">Shipped</p>
                <p className="text-sm text-zinc-400">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">Order Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-2">Customer Information</h3>
              <p className="text-zinc-900">{orderData.customer_name}</p>
              <p className="text-zinc-900">{orderData.customer_contact}</p>
              {orderData.shipping_address && (
                <p className="text-zinc-900 mt-2">
                  {orderData.shipping_address.address}<br />
                  {orderData.shipping_address.city}, {orderData.shipping_address.postal_code}<br />
                  {orderData.shipping_address.country}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-2">Payment Information</h3>
              <p className="text-zinc-900 capitalize">{orderData.payment_method.replace('_', ' ')}</p>
              <p className="text-zinc-900">
                Total Amount: <span className="font-semibold">Ksh {orderData.total_amount.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">What happens next?</h3>
          <ul className="space-y-3 text-zinc-700">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <p>You'll receive a confirmation SMS/WhatsApp with your order details</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <p>Our team will process your order within 1-2 business days</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <p>You'll receive shipping updates and tracking information once dispatched</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">4</span>
              </div>
              <p>Expected delivery within 2-5 business days (Nairobi) or 3-7 days (other regions)</p>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">Need Help?</h3>
          <p className="text-zinc-600 mb-4">
            Have questions about your order? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+254799954672"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-zinc-900 transition-colors"
            >
              Call Us: +254 799 954 672
            </a>
            <a
              href="https://wa.me/254799954672"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white text-zinc-900 px-6 py-3 rounded-md hover:bg-zinc-50 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white text-zinc-900 px-6 py-3 rounded-md hover:bg-zinc-50 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}