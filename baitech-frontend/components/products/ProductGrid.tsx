import { ProductCard } from './ProductCard'
import type { Product } from '@/types'
import Link from 'next/link'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No products available at the moment</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/catalogue"
          className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
        >
          View All Products
        </Link>
      </div>
    </>
  )
}
