'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ServiceGrid } from '@/components/services/ServiceGrid'
import type { Product } from 'src/types'

interface FeaturedShowcaseProps {
  products: Product[]
  services: any[]
  className?: string
}

export function FeaturedShowcase({ products, services, className = '' }: FeaturedShowcaseProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className={`space-y-20 ${className}`}>
      {/* Featured Products */}
      {products.length > 0 && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white py-16"
        >
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              badge="Curated Selection"
              title="Featured "
              highlightedText="Products"
              description="Handpicked premium tech essentials"
              badgeVariant="outlined"
            />

            <motion.div variants={itemVariants}>
              <ProductGrid
                products={products}
                variant="compact"
                columns={5}
              />
            </motion.div>

            {/* Quick View CTA */}
            <motion.div
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <a
                href="/all-products"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-6 py-3 font-medium text-amber-900 transition-all hover:bg-amber-100 hover:border-amber-400"
              >
                View All Products
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Featured Services */}
      {services.length > 0 && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-zinc-50 py-16"
        >
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              badge="Expert Solutions"
              title="Professional "
              highlightedText="Services"
              description="Technical expertise at your fingertips"
              badgeVariant="outlined"
            />

            <motion.div variants={itemVariants}>
              <ServiceGrid services={services} />
            </motion.div>

            {/* Quick View CTA */}
            <motion.div
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <a
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-6 py-3 font-medium text-amber-900 transition-all hover:bg-amber-50 hover:border-amber-400"
              >
                Explore All Services
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </div>
        </motion.section>
      )}
    </div>
  )
}