'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  overview: {
    total_users: number;
    total_products: number;
    total_services: number;
    total_orders: number;
    active_services: number;
    low_stock_products: number;
    featured_products: number;
    hot_deal_products: number;
  }
  recent_orders: Array<{
    order_number: string;
    customer_name: string;
    customer_contact: string;
    customer_email?: string;
    items: Array<{
      product_id: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total_revenue: number;
    order_count: number;
    average_order_value: number;
  }>;
  quick_stats: {
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_revenue_7days: number;
    new_orders_this_week: number;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  // Get user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
    }
  }, [])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data.data)
      setLoading(false)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl font-bold">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zinc-900"></div>
              <p className="mt-4 text-zinc-600">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats ? (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-amber-600">{stats?.overview?.total_users || 0}</p>
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
                  <p className="text-3xl font-bold text-amber-600">{stats?.overview?.total_products || 0}</p>
                </div>
              </div>

              {/* Total Services */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Services</h3>
                  <p className="text-3xl font-bold text-amber-600">{stats?.overview?.total_services || 0}</p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Orders</h3>
                  <p className="text-3xl font-bold text-amber-600">{stats?.overview?.total_orders || 0}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pending Orders */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Orders</h3>
                  <p className="text-3xl font-bold text-red-600">{stats?.quick_stats?.pending_orders || 0}</p>
                </div>
              </div>

              {/* Completed Orders */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Orders</h3>
                  <p className="text-3xl font-bold text-green-600">{stats?.quick_stats?.completed_orders || 0}</p>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue (7 days)</h3>
                <p className="text-3xl font-bold text-amber-600">Ksh {stats?.quick_stats?.total_revenue_7days?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        ) : !loading && !error && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zinc-900 mx-auto mb-4"></div>
            <p className="text-zinc-600">Loading dashboard data...</p>
          </div>
        )}
      </div>
    </div>
  )
}