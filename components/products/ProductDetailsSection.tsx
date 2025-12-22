'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  MessageCircle,
  Heart,
  Share2,
  Check,
  Truck,
  Shield,
  Package,
  Star,
  Minus,
  Plus
} from 'lucide-react'
import type { Product } from 'src/types'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import { generateProductWhatsAppUrl, openWhatsApp } from '@/lib/utils/whatsapp'

interface ProductDetailsSectionProps {
  product: Product
}

export function ProductDetailsSection({ product }: ProductDetailsSectionProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      addToCart({
        id: product.product_id,
        product_id: product.product_id,
        name: product.name,
        price: product.price || 0,
        image: product.images?.[0] || '',
        quantity,
        total: (product.price || 0) * quantity
      })
      toast.success(`${quantity} x ${product.name} added to cart!`)
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const handleWhatsAppOrder = () => {
    const url = generateProductWhatsAppUrl(product, quantity)
    openWhatsApp(url)
    toast.success('Opening WhatsApp for order')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at Baitech!`,
          url: window.location.href
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const calculateDiscount = () => {
    if (!product.originalPrice || !product.price) return null
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }

  const discount = calculateDiscount()
  const isInStock = (product.stock || 0) > 0
  const isLowStock = (product.stock || 0) < 5 && (product.stock || 0) > 0

  const incrementQuantity = () => {
    if (quantity < (product.stock || 0)) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Badge */}
      <div>
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
          {product.category}
        </span>
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} out of 5
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-b border-gray-200 py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">
            KSh {product.price ? product.price.toLocaleString() : 'N/A'}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-xl text-gray-500 line-through">
                KSh {product.originalPrice.toLocaleString()}
              </span>
              {discount && (
                <span className="inline-block px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                  Save {discount}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3">
          {isInStock ? (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-semibold">In Stock</span>
              {isLowStock && (
                <span className="text-orange-600 text-sm">
                  (Only {product.stock || 0} left!)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>

      {/* Features */}
      {product.features && product.features.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
          <ul className="space-y-2">
            {product.features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <Check className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Quantity Selector */}
      {isInStock && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-6 py-2 font-semibold text-lg min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= (product.stock || 0)}
                className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {product.stock || 0} available
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={!isInStock || isAdding}
          whileHover={{ scale: isInStock ? 1.02 : 1 }}
          whileTap={{ scale: isInStock ? 0.98 : 1 }}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
            isInStock
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding to Cart...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </motion.button>

        <motion.button
          onClick={handleWhatsAppOrder}
          disabled={!isInStock}
          whileHover={{ scale: isInStock ? 1.02 : 1 }}
          whileTap={{ scale: isInStock ? 0.98 : 1 }}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
            isInStock
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          Order via WhatsApp
        </motion.button>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <button
            onClick={toggleFavorite}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
              isFavorite
                ? 'bg-red-50 border-red-500 text-red-600'
                : 'bg-white border-gray-300 text-gray-700 hover:border-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border-2 bg-white border-gray-300 text-gray-700 hover:border-amber-400"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-200 pt-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Free Shipping</h4>
            <p className="text-sm text-gray-600">On orders over KSh 5,000</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Warranty Included</h4>
            <p className="text-sm text-gray-600">2-year manufacturer warranty</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Easy Returns</h4>
            <p className="text-sm text-gray-600">30-day return policy</p>
          </div>
        </div>
      </div>
    </div>
  )
}
