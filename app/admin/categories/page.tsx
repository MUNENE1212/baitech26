'use client'

import { useState } from 'react'
import { PRODUCT_CATEGORIES, type Category, type SubCategory } from '@/lib/categories'
import { Search, Save, X, FolderTree, Package } from 'lucide-react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Filter categories based on search
  const filteredCategories = PRODUCT_CATEGORIES.filter(category => {
    const query = searchQuery.toLowerCase()
    const categoryMatch = category.name.toLowerCase().includes(query)
    const subcategoryMatch = category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(query)
    )
    return categoryMatch || subcategoryMatch
  })

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug)
  }

  const getTotalSubcategories = () => {
    return PRODUCT_CATEGORIES.reduce((total, cat) => total + cat.subcategories.length, 0)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
        <p className="text-gray-600">
          Manage product categories and subcategories for better organization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FolderTree className="h-8 w-8 opacity-80" />
            <span className="text-3xl font-bold">{PRODUCT_CATEGORIES.length}</span>
          </div>
          <p className="text-amber-50 text-sm font-medium">Total Categories</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="h-8 w-8 opacity-80" />
            <span className="text-3xl font-bold">{getTotalSubcategories()}</span>
          </div>
          <p className="text-blue-50 text-sm font-medium">Total Subcategories</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Search className="h-8 w-8 opacity-80" />
            <span className="text-3xl font-bold">{filteredCategories.length}</span>
          </div>
          <p className="text-green-50 text-sm font-medium">Search Results</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search categories or subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No categories found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.slug} className="hover:bg-gray-50 transition-colors">
                {/* Category Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => toggleCategory(category.slug)}
                      className="flex items-center gap-3 flex-1 text-left group"
                    >
                      <div className={`p-2 rounded-lg transition-colors ${
                        expandedCategory === category.slug
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-amber-50 group-hover:text-amber-600'
                      }`}>
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.subcategories.length} subcategories
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        {category.slug}
                      </span>
                    </div>
                  </div>

                  {/* Subcategories Grid */}
                  {expandedCategory === category.slug && (
                    <div className="mt-6 pl-14">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.slug}
                            className="group flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
                          >
                            <Package className="h-4 w-4 text-gray-400 group-hover:text-amber-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-amber-600 truncate">
                                {subcategory.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {subcategory.slug}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Category Structure Information
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Categories are defined in <code className="bg-blue-100 px-2 py-0.5 rounded text-xs">/lib/categories.ts</code></li>
              <li>• Each category contains multiple subcategories for better product organization</li>
              <li>• Categories are used throughout the site: navigation, filters, and product pages</li>
              <li>• The mega menu automatically displays all categories and subcategories</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Largest Categories
          </h3>
          <div className="space-y-3">
            {PRODUCT_CATEGORIES
              .sort((a, b) => b.subcategories.length - a.subcategories.length)
              .slice(0, 5)
              .map((category) => (
                <div key={category.slug} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{category.name}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {category.subcategories.length} subs
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(PRODUCT_CATEGORIES, null, 2))
                toast.success('Categories JSON copied to clipboard!')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Save className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Export Categories</p>
                <p className="text-xs text-gray-500">Copy JSON to clipboard</p>
              </div>
            </button>

            <button
              onClick={() => {
                window.open('/catalogue', '_blank')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Package className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">View Catalogue</p>
                <p className="text-xs text-gray-500">See categories in action</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
