'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { Service } from 'src/types'
import { useServiceFormValidation } from '@/hooks/useFormValidation'
import { ValidatedInput, ValidationSummary, CharacterCounter } from '@/components/ui/ValidationFeedback'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Initial form values
  const getInitialFormValues = () => ({
    service_id: '',
    name: '',
    description: '',
    category: '',
    pricing: '',
    estimated_duration: '1-2 hours',
    features: ['']
  })

  // Use validation hook
  const formValidation = useServiceFormValidation(
    getInitialFormValues(),
    (isValid, errors) => {
      // Handle validation state changes if needed
      console.log('Service form validation state:', { isValid, errors })
    }
  )

  useEffect(() => {
    // Check if user is authenticated on page load
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    console.log('🔐 Page load - Token:', token ? 'Found' : 'NOT FOUND')
    console.log('👤 Page load - User:', user ? JSON.parse(user) : 'NOT FOUND')

    if (!token) {
      console.warn('⚠️ No authentication token found. User may not be logged in.')
      alert('Please log in to access the admin panel')
      window.location.href = '/login'
      return
    }

    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      console.log('📡 Fetching services...')
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const token = localStorage.getItem('token')

      console.log('🔐 Fetching services with token:', token ? 'Found' : 'NOT FOUND')

      const response = await fetch(`${apiUrl}/api/services`)

      console.log('📡 Services response status:', response.status)

      if (!response.ok) {
        console.error('❌ Failed to fetch services:', response.statusText)
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      console.log('📦 Services data received:', Array.isArray(data) ? `${data.length} services` : 'Invalid format')

      // Handle both response formats: direct array or object with services property
      const servicesArray = Array.isArray(data) ? data : (data.services || [])
      setServices(servicesArray)
    } catch (err) {
      console.error('❌ Error fetching services:', err)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Form submission started')

    // Validate entire form first
    const isFormValid = formValidation.validateForm()
    if (!isFormValid) {
      console.error('❌ Form validation failed:', formValidation.errors)
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

      console.log('🔑 Token:', token ? 'Found' : 'NOT FOUND')
      console.log('🌐 API URL:', apiUrl)
      console.log('✏️ Editing service:', editingService ? editingService.name : 'Creating new')
      console.log('📝 Form data:', JSON.stringify(formValidation.values, null, 2))

      if (!token) {
        console.error('❌ No authentication token found')
        alert('Please log in first to edit services')
        return
      }

      // Create JSON payload instead of FormData
      const payload = {
        name: formValidation.values.name,
        description: formValidation.values.description,
        category: formValidation.values.category,
        pricing: parseFloat(formValidation.values.pricing) || 0,
        base_price: parseFloat(formValidation.values.pricing) || 0,
        estimated_duration: formValidation.values.estimated_duration,
        features: formValidation.values.features.filter(f => f.trim()),
        service_id: editingService?.service_id || formValidation.values.service_id || formValidation.values.name.toLowerCase().replace(/\s+/g, '_')
      }

      console.log('📦 Payload to send:', JSON.stringify(payload, null, 2))

      const url = editingService
        ? `${apiUrl}/api/services/${editingService.service_id || editingService.id}`
        : `${apiUrl}/api/services`

      console.log('🎯 Request URL:', url)

      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response OK:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to save service')
      }

      const responseData = await response.json()
      console.log('✅ Success response:', responseData)

      await fetchServices()
      resetForm()
      setShowForm(false)
      alert('Service saved successfully!')
    } catch (err) {
      console.error('❌ Error saving service:', err)
      alert(`Failed to save service: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (service: Service) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const serviceId = service.service_id || service.id

      const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete service')
      }

      await fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
      alert(`Failed to delete service: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (service: Service) => {
    console.log('✏️ Editing service:', service)
    console.log('🆔 Service ID:', service.service_id)
    console.log('🆔 Service MongoDB ID:', service.id)

    setEditingService(service)
    formValidation.resetForm({
      service_id: service.service_id || '',
      name: service.name,
      description: service.description,
      category: service.category || '',
      pricing: service.pricing?.base_price?.toString() || '0',
      estimated_duration: service.estimated_duration || '1-2 hours',
      features: service.features && service.features.length > 0 ? service.features : ['']
    })
    setShowForm(true)
  }

  const resetForm = () => {
    formValidation.resetForm()
    setEditingService(null)
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

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-gray-600">{services.length} total services</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Category Badge */}
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 mb-3">
                {service.category}
              </span>

              {/* Service Name */}
              <h3 className="mb-2 text-lg font-bold text-gray-900">{service.name}</h3>

              {/* Description */}
              <p className="mb-4 text-sm text-gray-600 line-clamp-3">{service.description}</p>

              {/* Pricing */}
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  Ksh {service.pricing?.base_price ? service.pricing.base_price.toLocaleString() : 'N/A'}
                </span>
                <span className="text-sm text-gray-500">
                  {service.pricing?.type === 'per_month' ? '/month' : 'starting'}
                </span>
              </div>

              {/* Duration */}
              <p className="mb-4 text-sm text-gray-600">
                Duration: {service.estimated_duration || '1-2 hours'}
              </p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <div className="mb-4 space-y-1">
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <p key={idx} className="text-xs text-gray-600 truncate">
                      • {feature}
                    </p>
                  ))}
                  {service.features.length > 3 && (
                    <p className="text-xs text-gray-500">+{service.features.length - 3} more</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Edit className="inline h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="inline h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredServices.length === 0 && !loading && (
        <div className="py-12 text-center text-gray-500">
          No services found
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Summary */}
              <ValidationSummary
                errors={formValidation.errors as Record<string, string>}
                title="Please fix the following errors before submitting:"
              />

              {/* Service Name */}
              <ValidatedInput
                label="Service Name"
                required
                error={formValidation.errors.name}
              >
                <input
                  type="text"
                  value={formValidation.values.name}
                  onChange={(e) => formValidation.setFieldValue('name', e.target.value)}
                  onBlur={() => formValidation.setTouched('name', true)}
                  placeholder="e.g., Laptop Repair Service"
                />
                <CharacterCounter
                  current={formValidation.values.name.length}
                  min={2}
                  max={200}
                  showRemaining={false}
                  className="mt-1"
                />
              </ValidatedInput>

              {/* Service ID and Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Service ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formValidation.values.service_id}
                    onChange={(e) => formValidation.setFieldValue('service_id', e.target.value)}
                    placeholder="e.g., laptop_repair"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="mt-1 text-xs text-gray-500">Unique identifier for the service (lowercase, no spaces)</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formValidation.values.category}
                    onChange={(e) => formValidation.setFieldValue('category', e.target.value)}
                    placeholder="e.g., Hardware Repair"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Starting Price (Ksh) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formValidation.values.pricing}
                  onChange={(e) => formValidation.setFieldValue('pricing', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={formValidation.values.estimated_duration}
                  onChange={(e) => formValidation.setFieldValue('estimated_duration', e.target.value)}
                  placeholder="e.g., 1-2 hours, 3-5 days"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Features */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">What&apos;s Included</label>
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
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
                        placeholder="e.g., Free diagnostics, 30-day warranty"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
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
