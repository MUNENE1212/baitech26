'use client'

import { useEffect, useState } from 'react'
import { Package, Wrench, ShoppingCart, Users, AlertTriangle, TrendingUp } from 'lucide-react'

interface Stats {
  total_products: number
  total_services: number
  total_orders: number
  total_users: number
  total_reviews: number
  low_stock_count: number
}

interface RecentProduct {
  product_id: string
  name: string
  price: number
  stock: number
  created_at: string
}

interface LowStockItem {
  product_id: string
  name: string
  stock: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${apiUrl}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data.stats)
      setRecentProducts(data.recent_products || [])
      setLowStockItems(data.low_stock_items || [])
      setError(null)
    } catch (err) {
      setError('Unable to load dashboard data')
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    {
      title: 'Total Products',
      value: stats.total_products,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Services',
      value: stats.total_services,
      icon: Wrench,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: ShoppingCart,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Reviews',
      value: stats.total_reviews,
      icon: TrendingUp,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Low Stock Items',
      value: stats.low_stock_count,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome to Baitech Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Products</h2>
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.product_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Ksh {product.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent products</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Low Stock Alert</h2>
          </div>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.product_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-red-600 py-8">No low stock items</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/products"
            className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900">Add Product</p>
          </a>
          <a
            href="/admin/services"
            className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
          >
            <Wrench className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900">Add Service</p>
          </a>
          <a
            href="/admin/images"
            className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900">Upload Images</p>
          </a>
          <a
            href="/admin/users"
            className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900">Manage Users</p>
          </a>
        </div>
      </div>
    </div>
  )
}
