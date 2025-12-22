'use client'

import { useEffect, useState } from 'react'
import { Eye, Edit2, Package, Truck, CheckCircle, XCircle, Clock, Search, Filter, Download } from 'lucide-react'
import OrderDetailsModal from '@/components/admin/OrderDetailsModal'

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

interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image?: string
}

interface OrderStats {
  total_orders: number
  total_revenue: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [stats, setStats] = useState<OrderStats>({
    total_orders: 0,
    total_revenue: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const ordersPerPage = 20
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  // Fetch orders and stats
  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [currentPage, statusFilter])

  // Filter orders based on search term
  useEffect(() => {
    const filtered = orders.filter(order => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_contact.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter

      return matchesSearch && matchesStatus
    })

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ordersPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.data || [])
      setTotalOrders(data.pagination?.total_orders || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch all orders for stats calculation
      const response = await fetch('/api/orders?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      const allOrders = data.data || []

      const stats: OrderStats = {
        total_orders: allOrders.length,
        total_revenue: allOrders.reduce((sum: number, order: Order) => sum + order.total, 0),
        processing_orders: allOrders.filter((order: Order) => order.order_status === 'processing').length,
        shipped_orders: allOrders.filter((order: Order) => order.order_status === 'shipped').length,
        delivered_orders: allOrders.filter((order: Order) => order.order_status === 'delivered').length
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string, estimatedDelivery?: string) => {
    try {
      const requestBody: any = {
        order_status: newStatus,
        note: `Status updated to ${newStatus}`
      }

      if (trackingNumber) {
        requestBody.tracking_number = trackingNumber
      }

      if (estimatedDelivery) {
        requestBody.estimated_delivery = estimatedDelivery
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Refresh orders and stats
      await fetchOrders()
      await fetchStats()

      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeOrderDetails = () => {
    setSelectedOrder(null)
    setIsModalOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const totalPages = Math.ceil(totalOrders / ordersPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors">
          <Download className="h-4 w-4" />
          Export Orders
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
            </div>
            <Package className="h-8 w-8 text-amber-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">KES {stats.total_revenue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">
              KES
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.processing_orders}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-blue-600">{stats.shipped_orders}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered_orders}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Loading orders...' : 'No orders found'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_contact}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        KES {order.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {order.payment_method}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        <span className="capitalize">{order.order_status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="text-amber-600 hover:text-amber-900"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <select
                          value={order.order_status}
                          onChange={(e) => {
                            updateOrderStatus(order.id, e.target.value)
                              .then(() => {
                                // Show success feedback
                              })
                              .catch(() => {
                                // Error is already handled in the function
                              })
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-amber-400"
                          title="Update status"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ordersPerPage, totalOrders)}
                    </span>{' '}
                    of <span className="font-medium">{totalOrders}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="bg-white border-gray-300 text-gray-500 px-4 py-2 text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeOrderDetails}
        onUpdateStatus={updateOrderStatus}
      />
    </div>
  )
}