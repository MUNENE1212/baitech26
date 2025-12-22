'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ProductImageGallery } from '@/components/products/ProductImageGallery'
import { ProductDetailsSection } from '@/components/products/ProductDetailsSection'
import { RelatedProducts } from '@/components/products/RelatedProducts'
import { getProductById, getRelatedProducts } from '@/lib/api/products'
import type { Product } from 'src/types'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      console.log('ProductDetailPage useEffect triggered')
      console.log('params:', params)
      console.log('productId from params:', productId)

      if (!productId) {
        console.error('No productId provided')
        return
      }

      console.log(`Loading product with ID: ${productId}`)

      try {
        setLoading(true)
        setError(null)

        // Fetch product details
        console.log('Calling getProductById...')
        const productData = await getProductById(productId)
        console.log('Product data received:', productData)

        // Check if product exists
        if (!productData) {
          console.error('Product data is null/undefined')
          setError('Product not found')
          setLoading(false)
          return
        }

        console.log('Setting product data:', productData.name)
        setProduct(productData)

        // Fetch related products (only if we have valid product data)
        try {
          const related = await getRelatedProducts(
            productData.id,
            productData.category || '',
            8
          )
          setRelatedProducts(related)
        } catch (relatedErr) {
          // If related products fail, just log it but don't fail the whole page
          console.warn('Failed to load related products:', relatedErr)
          setRelatedProducts([])
        }
      } catch (err) {
        console.error('Failed to load product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  // Loading State
  if (loading) {
    return <LoadingSkeleton />
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The product you are looking for does not exist or has been removed.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Go Back
            </button>
            <Link
              href="/catalogue"
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb & Back Button */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mt-3 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-amber-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/catalogue"
              className="text-gray-600 hover:text-amber-600 transition-colors"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/catalogue?category=${product.category}`}
              className="text-gray-600 hover:text-amber-600 transition-colors"
            >
              {product.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ProductDetailsSection product={product} />
          </motion.div>
        </div>
      </section>

      {/* Product Specifications */}
      {product.features && product.features.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Technical Specifications
              </h2>
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Additional Product Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Product Details
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Category
                  </h3>
                  <p className="text-lg text-gray-900">{product.category}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Availability
                  </h3>
                  <p className="text-lg text-gray-900">
                    {(product.stock || 0) > 0 ? `${product.stock || 0} in stock` : 'Out of stock'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Product ID
                  </h3>
                  <p className="text-lg text-gray-900 font-mono">
                    {product.product_id || product._id}
                  </p>
                </div>

                {product.rating && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Customer Rating
                    </h3>
                    <p className="text-lg text-gray-900">
                      {product.rating.toFixed(1)} / 5.0
                    </p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Full Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products - "You May Also Like" */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="h-6 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-80 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Skeleton */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded-full" />
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-12 w-64 bg-gray-200 rounded" />
            <div className="h-32 w-full bg-gray-200 rounded" />
            <div className="h-14 w-full bg-gray-200 rounded-lg" />
            <div className="h-14 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
