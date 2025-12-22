'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, MapPin, Phone, Mail, Package, Truck, Clock, CheckCircle, XCircle, User, CreditCard } from 'lucide-react'

interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image?: string
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_contact: string
  customer_email?: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  payment_method: string
  payment_status: string
  order_status: string
  tracking_number?: string
  estimated_delivery?: string
  shipping_address: {
    address?: string
    city?: string
    postal_code?: string
    country?: string
  }
  service_note?: string
  status_history?: Array<{
    status: string
    timestamp: string
    note?: string
    updated_by?: string
  }>
  created_at: string
  updated_at: string
}

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: string, trackingNumber?: string, estimatedDelivery?: string) => void
}

export default function OrderDetailsModal({ order, isOpen, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  const [newStatus, setNewStatus] = useState(order?.order_status || '')
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || '')
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order?.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)

  if (!isOpen || !order) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSubmitUpdate = async () => {
    if (newStatus === order.order_status &&
        trackingNumber === order.tracking_number &&
        estimatedDelivery === (order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '')) {
      onClose()
      return
    }

    setLoading(true)
    try {
      await onUpdateStatus(order.id, newStatus, trackingNumber, estimatedDelivery)
      onClose()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">Order #{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.order_status)}
              <div>
                <span className="font-medium">Current Status:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.order_status)}`}>
                  {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Contact</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3" />
                    {order.customer_contact}
                  </div>
                </div>
                {order.customer_email && (
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {order.customer_email}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium">{order.shipping_address?.address || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <p className="font-medium">{order.shipping_address?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Postal Code</label>
                    <p className="font-medium">{order.shipping_address?.postal_code || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover rounded"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.product_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">KES {item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">KES {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>KES {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>KES {order.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (16%)</span>
                <span>KES {order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>KES {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Update Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                >
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Delivery
                    </label>
                    <input
                      type="date"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitUpdate}
                disabled={loading}
                className="flex-1 bg-amber-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Order'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Status History</h3>
              <div className="space-y-2">
                {order.status_history.map((history, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="mt-1">
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{history.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                      )}
                      {history.updated_by && (
                        <p className="text-xs text-gray-500 mt-1">
                          By: {history.updated_by}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}