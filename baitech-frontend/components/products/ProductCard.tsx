'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import type { Product } from '@/types'
import { toast } from 'sonner'
import { ShoppingBag, Check, MessageCircle } from 'lucide-react'
import { generateProductWhatsAppUrl, openWhatsApp } from '@/lib/utils/whatsapp'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)

    try {
      await addToCart({
        productId: product.product_id,
        name: product.name,
        price: product.price,
        image: product.images[0] || null,
      })

      toast.success('Added to cart', {
        duration: 2000,
        description: product.name,
      })

      setTimeout(() => setIsAdding(false), 1500)
    } catch (error) {
      toast.error('Failed to add item')
      setIsAdding(false)
    }
  }

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = generateProductWhatsAppUrl(product)
    openWhatsApp(url)

    toast.success('Opening WhatsApp', {
      duration: 2000,
      description: 'Redirecting to WhatsApp for immediate order',
    })
  }

  return (
    <Link href={`/products/${product._id}`}>
      <div
        className="group relative overflow-hidden rounded-lg bg-white transition-all duration-500 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-zinc-50">
        <ImageCarousel images={product.images} alt={product.name} />

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Stock badge */}
        {product.stock < 5 && product.stock > 0 && (
          <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-zinc-900">
            Only {product.stock} left
          </div>
        )}

        {/* Action buttons - appear on hover */}
        <div className={`absolute inset-x-4 bottom-4 space-y-2 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 font-medium transition-all ${
              isAdding
                ? 'bg-emerald-600 text-white'
                : product.stock === 0
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-zinc-900'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </button>

          {/* WhatsApp Order Button */}
          <button
            onClick={handleWhatsAppOrder}
            className="w-full flex items-center justify-center gap-2 border border-white bg-white/90 backdrop-blur-sm py-3 font-medium text-emerald-600 transition-all hover:bg-white hover:text-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Order via WhatsApp
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-2">
        {/* Category */}
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="text-base font-medium text-zinc-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-zinc-900">
            Ksh {product.price.toLocaleString()}
          </span>
        </div>

        {/* Features - show on desktop only */}
        {product.features && product.features.length > 0 && (
          <div className="hidden lg:block pt-2 border-t border-zinc-100">
            <ul className="space-y-1">
              {product.features.slice(0, 2).map((feature, idx) => (
                <li key={idx} className="text-xs text-zinc-600 flex items-start gap-2">
                  <span className="text-zinc-400 mt-0.5">•</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    </Link>
  )
}
