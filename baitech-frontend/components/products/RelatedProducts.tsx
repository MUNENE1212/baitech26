'use client'

import { motion } from 'framer-motion'
import { CompactProductCard } from './CompactProductCard'
import type { Product } from '@/types'
import { Sparkles } from 'lucide-react'

interface RelatedProductsProps {
  products: Product[]
  title?: string
}

export function RelatedProducts({
  products,
  title = 'You May Also Like'
}: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
            </h2>
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-gray-600">
            Customers who viewed this item also viewed
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product, index) => (
            <CompactProductCard
              key={product._id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
