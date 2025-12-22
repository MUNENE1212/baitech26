import { ProductCard } from './ProductCard'
import { CompactProductCard } from './CompactProductCard'
import type { Product } from 'src/types'
import Link from 'next/link'

interface ProductGridProps {
  products: Product[]
  variant?: 'default' | 'compact'
  columns?: 3 | 4 | 5
  showViewAll?: boolean
  viewAllLink?: string
}

export function ProductGrid({
  products,
  variant = 'compact',
  columns = 5,
  showViewAll = true,
  viewAllLink = '/catalogue'
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No products available at the moment</p>
      </div>
    )
  }

  const gridClasses = {
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
  }

  const gapClasses = variant === 'compact' ? 'gap-4 md:gap-6' : 'gap-6 md:gap-8'

  return (
    <>
      <div className={`grid ${gridClasses[columns]} ${gapClasses}`}>
        {products.map((product, index) => (
          variant === 'compact' ? (
            <CompactProductCard key={product.id} product={product} index={index} />
          ) : (
            <ProductCard key={product.id} product={product} />
          )
        ))}
      </div>

      {showViewAll && (
        <div className="mt-12 text-center">
          <Link
            href={viewAllLink}
            className="inline-block rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
          >
            View All Products
          </Link>
        </div>
      )}
    </>
  )
}
