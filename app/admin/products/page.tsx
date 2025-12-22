'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search, X, Check, Star, Tag, TrendingUp, Sparkles } from 'lucide-react'
import { SimpleImageUpload } from '@/components/admin/SimpleImageUpload'
import { ImageTest } from '@/components/admin/ImageTest'
import { Product } from 'src/types'
import { toast } from 'sonner'
import { generateCompleteProductData } from '@/lib/utils/productDataGenerator'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import { apiClient } from '@/lib/api/client-nextjs-only'
import { useProductFormValidation } from '@/hooks/useFormValidation'
import { ValidatedInput, ValidationFeedback, ValidationSummary, CharacterCounter } from '@/components/ui/ValidationFeedback'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([]) // Workaround for form validation issue
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Initial form values
  const getInitialFormValues = () => ({
    product_id: '',
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

  // Use validation hook
  const formValidation = useProductFormValidation(
    getInitialFormValues(),
    (isValid, errors) => {
      // Handle validation state changes if needed
      console.log('Form validation state:', { isValid, errors })
    }
  )

  // Get subcategories for selected category
  const selectedCategoryData = PRODUCT_CATEGORIES.find(cat => cat.slug === formValidation.values.category)
  const availableSubcategories = selectedCategoryData?.subcategories || []

  useEffect(() => {
    // Only fetch if authenticated
    if (isAuthenticated()) {
      fetchProducts()
    } else {
      console.warn('User not authenticated, redirecting to login...')
      // Redirect to login or handle accordingly
      window.location.href = '/login'
    }
  }, [])

  // Check if user is authenticated
const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return !!token && token.length > 0
  }
  return false
}

const fetchProducts = async () => {
    try {
      setLoading(true)

      // Direct fetch to bypass complex API client and ensure we get the right data
      const response = await fetch('/api/products')
      const responseData = await response.json()

      console.log('Products API response:', responseData)

      // Handle the actual response structure: { success: true, data: { products: [...], pagination: {...} } }
      if (responseData.success && responseData.data) {
        setProducts(responseData.data.products || [])
      } else {
        // Fallback for different response structures
        const productsData = responseData.data || responseData
        setProducts(Array.isArray(productsData) ? productsData : (productsData.products || []))
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent saving while images are still uploading
    if (isUploadingImages) {
      toast.error('Please wait for image uploads to complete before saving the product.')
      return
    }

    // Check if authenticated before proceeding
    if (!isAuthenticated()) {
      toast.error('Please log in to update products')
      return
    }

    // Validate entire form first
    const isFormValid = formValidation.validateForm()
    if (!isFormValid) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setSubmitting(true)

    try {
      // Generate product ID for new products
      const productId = editingProduct?.product_id || generateProductId(formValidation.values.name.trim())

      // Get images from workaround state (form validation is not working for images)
      const productImages = currentImages.length > 0 ? currentImages : formValidation.values.images || []
      console.log('=== PRODUCT SAVE DEBUG ===')
      console.log('isUploadingImages state:', isUploadingImages)
      console.log('Workaround images:', productImages)
      console.log('Form validation images:', formValidation.values.images)
      console.log('CurrentImages state:', currentImages)
      console.log('productImages length:', productImages.length)

      // Prepare product data - include all fields expected by validation schema
      const productData = {
        product_id: productId,
        name: formValidation.values.name.trim(),
        price: parseFloat(formValidation.values.price),
        description: formValidation.values.description.trim(),
        category: formValidation.values.category,
        subcategory: formValidation.values.subcategory || undefined,
        stock: parseInt(formValidation.values.stock),
        featured: formValidation.values.featured,
        isHotDeal: formValidation.values.isHotDeal,
        is_hot_deal: formValidation.values.isHotDeal, // Add for backend compatibility
        features: formValidation.values.features.filter(f => f.trim()),
        images: productImages,
        originalPrice: formValidation.values.originalPrice ? parseFloat(formValidation.values.originalPrice) : undefined,
        original_price: formValidation.values.originalPrice ? parseFloat(formValidation.values.originalPrice) : undefined,
        rating: formValidation.values.rating ? parseFloat(formValidation.values.rating) : undefined,
        // Optional fields that might be expected by validation
        is_active: true, // Products should be active by default
        seo: {
          title: formValidation.values.name.trim(), // Use product name as title if not provided
          description: formValidation.values.description.trim(),
          keywords: [formValidation.values.category, 'electronics', 'gadgets'], // Generate basic keywords
        }
      }

      console.log('Submitting product data:', {
        ...productData,
        images: productData.images,
        productImagesLength: productImages.length,
        currentImagesLength: currentImages.length
      })

      let response
      if (editingProduct) {
        console.log('Updating product:', editingProduct.product_id)
        response = await apiClient.updateProduct(editingProduct.product_id, productData)
      } else {
        console.log('Creating new product')
        response = await apiClient.createProduct(productData)
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to save product')
      }

      toast.success(
        editingProduct
          ? `Product "${formValidation.values.name}" updated successfully!`
          : `Product "${formValidation.values.name}" added successfully!`
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
      const response = await apiClient.deleteProduct(productId)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete product')
      }

      toast.success('Product deleted successfully')
      await fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    formValidation.resetForm({
      product_id: product.product_id || '',
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description || '',
      category: product.category || '',
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
    formValidation.resetForm()
    setEditingProduct(null)
    setCurrentImages([]) // Reset workaround state
  }

  // Reset subcategory when category changes
  const handleCategoryChange = (newCategory: string) => {
    formValidation.setFieldValue('category', newCategory)
    formValidation.setFieldValue('subcategory', '') // Reset subcategory when category changes
  }

  const addFeatureField = () => {
    formValidation.setFieldValue('features', [...formValidation.values.features, ''])
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formValidation.values.features]
    newFeatures[index] = value
    formValidation.setFieldValue('features', newFeatures)
  }

  const removeFeature = (index: number) => {
    const newFeatures = formValidation.values.features.filter((_, i) => i !== index)
    formValidation.setFieldValue('features', newFeatures)
  }

  // Generate automatic product ID
  const generateProductId = (name: string): string => {
    // Take first few letters and make uppercase, add random suffix
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .substring(0, 6) // Take first 6 characters
      .toUpperCase()

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}${randomSuffix}`
  }

  const handleQuickFill = () => {
    if (!editingProduct) return

    // Generate sample data
    const enhancements = generateCompleteProductData(editingProduct)

    // Only fill empty fields
    formValidation.setFieldValue('originalPrice',
      formValidation.values.originalPrice || enhancements.originalPrice?.toString() || ''
    )
    formValidation.setFieldValue('rating',
      formValidation.values.rating || enhancements.rating?.toString() || ''
    )
    formValidation.setFieldValue('features',
      (formValidation.values.features.length === 1 && formValidation.values.features[0] === '')
        ? enhancements.features || ['']
        : formValidation.values.features
    )

    toast.success('Sample data filled! Review and adjust as needed.')
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.product_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Test Component */}
      <ImageTest />

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
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                            unoptimized={product.images[0]?.includes('cloudinary')}
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
              {/* Validation Summary */}
              <ValidationSummary
                errors={formValidation.errors as Record<string, string>}
                title="Please fix the following errors before submitting:"
              />

              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <ValidatedInput
                  label="Product Name"
                  required
                  error={formValidation.errors.name}
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={formValidation.values.name}
                    onChange={(e) => formValidation.setFieldValue('name', e.target.value)}
                    onBlur={() => formValidation.setTouched('name', true)}
                    placeholder="e.g., Dell XPS 13 Laptop"
                  />
                  <CharacterCounter
                    current={formValidation.values.name.length}
                    min={2}
                    max={200}
                    showRemaining={false}
                    className="mt-1"
                  />
                </ValidatedInput>

                <ValidatedInput
                  label="Category"
                  required
                  error={formValidation.errors.category}
                >
                  <select
                    value={formValidation.values.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    onBlur={() => formValidation.setTouched('category', true)}
                  >
                    <option value="">Select a category</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </ValidatedInput>

                <ValidatedInput
                  label="Subcategory"
                  error={formValidation.errors.subcategory}
                  info={formValidation.values.category && `(${availableSubcategories.length} available)`}
                >
                  <select
                    value={formValidation.values.subcategory}
                    onChange={(e) => formValidation.setFieldValue('subcategory', e.target.value)}
                    onBlur={() => formValidation.setTouched('subcategory', true)}
                    disabled={!formValidation.values.category}
                  >
                    <option value="">
                      {formValidation.values.category ? 'Select a subcategory (optional)' : 'Select category first'}
                    </option>
                    {availableSubcategories.map((subcat) => (
                      <option key={subcat.slug} value={subcat.slug}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                  {formValidation.values.subcategory && selectedCategoryData && (
                    <p className="mt-1 text-xs text-amber-600">
                      ✓ Will appear in: {selectedCategoryData.name} → {availableSubcategories.find(s => s.slug === formValidation.values.subcategory)?.name}
                    </p>
                  )}
                </ValidatedInput>

                <ValidatedInput
                label="Stock Quantity"
                required
                error={formValidation.errors.stock}
              >
                <input
                  type="number"
                  min="0"
                  value={formValidation.values.stock}
                  onChange={(e) => formValidation.setFieldValue('stock', e.target.value)}
                  onBlur={() => formValidation.setTouched('stock', true)}
                  placeholder="0"
                />
              </ValidatedInput>

                <ValidatedInput
                  label="Current Price (KSh)"
                  required
                  error={formValidation.errors.price}
                >
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValidation.values.price}
                    onChange={(e) => formValidation.setFieldValue('price', e.target.value)}
                    onBlur={() => formValidation.setTouched('price', true)}
                    placeholder="0.00"
                  />
                </ValidatedInput>

                <ValidatedInput
                  label="Original Price (KSh)"
                  info="for discounts"
                  error={formValidation.errors.originalPrice}
                >
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValidation.values.originalPrice}
                    onChange={(e) => formValidation.setFieldValue('originalPrice', e.target.value)}
                    onBlur={() => formValidation.setTouched('originalPrice', true)}
                    placeholder="0.00"
                  />
                  {formValidation.values.originalPrice && formValidation.values.price && (
                    <p className="mt-1 text-xs text-gray-600">
                      Discount: {Math.round(((parseFloat(formValidation.values.originalPrice) - parseFloat(formValidation.values.price)) / parseFloat(formValidation.values.originalPrice)) * 100)}%
                    </p>
                  )}
                </ValidatedInput>

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
                      value={formValidation.values.rating}
                      onChange={(e) => formValidation.setFieldValue('rating', e.target.value)}
                      placeholder="0.0"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    />
                    {formValidation.values.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(parseFloat(formValidation.values.rating))
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
                  value={formValidation.values.description}
                  onChange={(e) => formValidation.setFieldValue('description', e.target.value)}
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
                  {formValidation.values.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., Fast Charging, Waterproof"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                      />
                      {formValidation.values.features.length > 1 && (
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
                <SimpleImageUpload
                  onImagesUploaded={(paths) => {
                    console.log('SimpleImageUpload onImagesUploaded called with:', paths)
                    // Store in workaround state
                    setCurrentImages(paths)
                    // Also try to update form validation (for debugging)
                    formValidation.setFieldValue('images', paths)
                    console.log('Workaround images state set to:', paths)
                    console.log('CurrentImages state updated:', paths)
                  }}
                  onUploadingChange={(isUploading) => {
                    console.log('SimpleImageUpload uploading state changed:', isUploading)
                    setIsUploadingImages(isUploading)
                  }}
                  multiple={true}
                  maxFiles={5}
                  existingImages={currentImages.length > 0 ? currentImages : formValidation.values.images}
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formValidation.values.featured}
                  onChange={(e) => formValidation.setFieldValue('featured', e.target.checked)}
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
                  checked={formValidation.values.isHotDeal}
                  onChange={(e) => formValidation.setFieldValue('isHotDeal', e.target.checked)}
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
                  disabled={submitting || isUploadingImages}
                  className="flex-1 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-gray-900 hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : isUploadingImages ? 'Uploading Images...' : editingProduct ? 'Update Product' : 'Add Product'}
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
