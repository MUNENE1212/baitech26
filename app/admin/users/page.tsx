'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, User, Mail, Phone, Calendar, Search, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'customer' | 'technician'
  created_at?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'customer' | 'technician'>('all')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    getCurrentUserId()
  }, [])

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUserId(payload.user_id)
      } catch (e) {
        console.error('Error decoding token:', e)
      }
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      const response = await fetch(`${apiUrl}/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to delete user')
      }

      toast.success(`User "${userName}" deleted successfully`)
      await fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const handleChangeRole = async (userId: string, userName: string, currentRole: string) => {
    const newRole = prompt(
      `Change role for "${userName}"\nCurrent role: ${currentRole}\n\nEnter new role (admin, customer, or technician):`,
      currentRole
    )

    if (!newRole || newRole === currentRole) return

    if (!['admin', 'customer', 'technician'].includes(newRole.toLowerCase())) {
      toast.error('Invalid role. Must be admin, customer, or technician')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      const formData = new FormData()
      formData.append('role', newRole.toLowerCase())

      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to update role')
      }

      toast.success(`Role updated to ${newRole} for "${userName}"`)
      await fetchUsers()
    } catch (err) {
      console.error('Error updating role:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = filterRole === 'all' || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'customer').length
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage system users and administrators</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Administrators</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'customer' | 'technician')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="customer">Customers Only</option>
            <option value="technician">Technicians Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChangeRole(user._id, user.name, user.role)}
                          disabled={user._id === currentUserId}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={user._id === currentUserId ? "Cannot change your own role" : "Change role"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          disabled={user._id === currentUserId}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title={user._id === currentUserId ? "Cannot delete your own account" : "Delete user"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  )
}
