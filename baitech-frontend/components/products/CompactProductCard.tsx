'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Eye, Heart, Flame } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'

interface CompactProductCardProps {
  product: Product
  index?: number
  showBadges?: boolean
}

export function CompactProductCard({ product, index = 0, showBadges = true }: CompactProductCardProps) {
  const { addItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) return

    setIsLoading(true)

    try {
      await addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        quantity: 1
      })
      toast.success(`${product.name} added to cart!`, { duration: 2000 })
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removed from wishlist' : 'Added to wishlist', {
      duration: 1500
    })
  }

  const calculateDiscount = () => {
    if (!product.originalPrice) return null
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }

  const discount = calculateDiscount()
  const hasMultipleImages = product.images && product.images.length > 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
          {/* Image Container */}
          <div
            className="relative aspect-square overflow-hidden bg-gray-50"
            onMouseEnter={() => hasMultipleImages && setCurrentImageIndex(1)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          >
            {/* Product Image */}
            <Image
              src={product.images[currentImageIndex] || product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />

            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            {showBadges && (
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {discount && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md"
                  >
                    -{discount}%
                  </motion.span>
                )}
                {product.stock < 5 && product.stock > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {product.stock} left
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
                    Out of Stock
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions - Show on Hover */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                className={`p-2 rounded-full shadow-lg transition-all ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </motion.button>

              {/* Quick View Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg transition-all"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Add to Cart Button - Bottom */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isLoading || product.stock === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`absolute bottom-0 left-0 right-0 py-2.5 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                product.stock === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              } translate-y-full group-hover:translate-y-0 shadow-lg`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </motion.button>
          </div>

          {/* Product Info */}
          <div className="p-3 flex-1 flex flex-col">
            {/* Category */}
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
              {product.category}
            </p>

            {/* Product Name */}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors flex-1">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  KSh {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    KSh {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Rating (if available) */}
              {product.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-amber-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.rating?.toFixed(1)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
