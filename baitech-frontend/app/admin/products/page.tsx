'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, Check, Star, Tag, TrendingUp, Sparkles } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Product } from '@/types'
import { toast } from 'sonner'
import { generateCompleteProductData } from '@/lib/utils/productDataGenerator'
import { PRODUCT_CATEGORIES } from '@/lib/categories'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    category: '',
    subcategory: '',
    stock: '',
    rating: '',
    featured: false,
    isHotDeal: false,
    features: [''],
    images: [] as string[]
  })

  // Get subcategories for selected category
  const selectedCategoryData = PRODUCT_CATEGORIES.find(cat => cat.slug === formData.category)
  const availableSubcategories = selectedCategoryData?.subcategories || []

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/products`)

      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      // Handle both response formats: direct array or object with products property
      setProducts(Array.isArray(data) ? data : (data.products || []))
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!formData.category) {
      toast.error('Please select a category')
      return
    }
    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0')
      return
    }
    if (formData.originalPrice && parseFloat(formData.originalPrice) < parseFloat(formData.price)) {
      toast.error('Original price must be greater than current price')
      return
    }
    if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      toast.error('Rating must be between 0 and 5')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Backend expects FormData
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('price', formData.price)
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('category', formData.category)
      if (formData.subcategory) {
        formDataToSend.append('subcategory', formData.subcategory)
      }
      formDataToSend.append('stock', formData.stock)
      formDataToSend.append('featured', formData.featured.toString())
      formDataToSend.append('isHotDeal', formData.isHotDeal.toString())
      formDataToSend.append('features', JSON.stringify(formData.features.filter(f => f.trim())))
      formDataToSend.append('images', JSON.stringify(formData.images))

      const url = editingProduct
        ? `${apiUrl}/api/admin/products/${editingProduct.product_id}`
        : `${apiUrl}/api/admin/products`

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to save product')
      }

      toast.success(
        editingProduct
          ? `Product "${formData.name}" updated successfully!`
          : `Product "${formData.name}" added successfully!`
      )

      await fetchProducts()
      resetForm()
      setShowForm(false)
    } catch (err) {
      console.error('Error saving product:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${apiUrl}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete product')

      toast.success('Product deleted successfully')
      await fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      toast.error('Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description,
      category: product.category,
      subcategory: product.subcategory || '',
      stock: product.stock.toString(),
      rating: product.rating?.toString() || '',
      featured: product.featured,
      isHotDeal: product.isHotDeal || false,
      features: product.features.length > 0 ? product.features : [''],
      images: product.images
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      description: '',
      category: '',
      subcategory: '',
      stock: '',
      rating: '',
      featured: false,
      isHotDeal: false,
      features: [''],
      images: []
    })
    setEditingProduct(null)
  }

  // Reset subcategory when category changes
  const handleCategoryChange = (newCategory: string) => {
    setFormData({
      ...formData,
      category: newCategory,
      subcategory: '' // Reset subcategory when category changes
    })
  }

  const addFeatureField = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  const handleQuickFill = () => {
    if (!editingProduct) return

    // Generate sample data
    const enhancements = generateCompleteProductData(editingProduct)

    // Only fill empty fields
    setFormData({
      ...formData,
      originalPrice: formData.originalPrice || enhancements.originalPrice?.toString() || '',
      rating: formData.rating || enhancements.rating?.toString() || '',
      features: (formData.features.length === 1 && formData.features[0] === '')
        ? enhancements.features || ['']
        : formData.features
    })

    toast.success('Sample data filled! Review and adjust as needed.')
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">{products.length} total products</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-gray-900 hover:bg-amber-500 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Featured</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const hasDiscount = product.originalPrice && product.originalPrice > product.price
                const discountPercent = hasDiscount
                  ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
                  : 0

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.product_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {PRODUCT_CATEGORIES.find(c => c.slug === product.category)?.name || product.category}
                        </span>
                        {product.subcategory && (
                          <span className="text-xs text-gray-500">
                            {PRODUCT_CATEGORIES.find(c => c.slug === product.category)
                              ?.subcategories.find(s => s.slug === product.subcategory)?.name || product.subcategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 line-through">
                              KSh {product.originalPrice!.toLocaleString()}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                              -{discountPercent}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit product"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.product_id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Quick Fill Button - Only show when editing */}
              {editingProduct && (
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-purple-700 font-medium transition-colors"
                >
                  <Sparkles className="h-5 w-5" />
                  Quick Fill Missing Data (Sample)
                  <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">Auto-generate</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dell XPS 13 Laptop"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  >
                    <option value="">Select a category</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Subcategory
                    {formData.category && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({availableSubcategories.length} available)
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    disabled={!formData.category}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.category ? 'Select a subcategory (optional)' : 'Select category first'}
                    </option>
                    {availableSubcategories.map((subcat) => (
                      <option key={subcat.slug} value={subcat.slug}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                  {formData.subcategory && selectedCategoryData && (
                    <p className="mt-1 text-xs text-amber-600">
                      ✓ Will appear in: {selectedCategoryData.name} → {availableSubcategories.find(s => s.slug === formData.subcategory)?.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Tag className="h-4 w-4" />
                    Current Price (KSh) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <TrendingUp className="h-4 w-4" />
                    Original Price (KSh)
                    <span className="text-xs font-normal text-gray-500">(for discounts)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                  {formData.originalPrice && formData.price && (
                    <p className="mt-1 text-xs text-gray-600">
                      Discount: {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}%
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Star className="h-4 w-4" />
                    Product Rating
                    <span className="text-xs font-normal text-gray-500">(0-5)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="0.0"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    />
                    {formData.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(parseFloat(formData.rating))
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              {/* Features */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">Features</label>
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., Fast Charging, Waterproof"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Product Images
                </label>
                <ImageUpload
                  onImagesUploaded={(paths) => setFormData({ ...formData, images: paths })}
                  multiple={true}
                  maxFiles={5}
                  existingImages={formData.images}
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                  Feature this product on homepage
                </label>
              </div>

              {/* Hot Deal Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isHotDeal"
                  checked={formData.isHotDeal}
                  onChange={(e) => setFormData({ ...formData, isHotDeal: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-600/20"
                />
                <label htmlFor="isHotDeal" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  🔥 Mark as Hot Deal
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-gray-900 hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
