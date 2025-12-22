'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package, Truck, Shield, Tag } from 'lucide-react'

interface Deal {
  id: string
  title: string
  subtitle: string
  description: string
  image?: string
  bgGradient: string
  link: string
  icon: 'package' | 'truck' | 'shield' | 'tag'
  badgeText?: string
}

const iconMap = {
  package: Package,
  truck: Truck,
  shield: Shield,
  tag: Tag
}

const defaultDeals: Deal[] = [
  {
    id: 'bulk-orders',
    title: 'Bulk Orders',
    subtitle: 'Save More',
    description: 'Get up to 30% off on bulk purchases. Perfect for businesses and resellers.',
    bgGradient: 'from-purple-600 to-purple-800',
    link: '/catalogue?filter=bulk',
    icon: 'package',
    badgeText: 'Up to 30% OFF'
  },
  {
    id: 'free-shipping',
    title: 'Free Shipping',
    subtitle: 'Orders Over KSh 5,000',
    description: 'Enjoy free delivery on all orders above KSh 5,000 within Nairobi.',
    bgGradient: 'from-blue-600 to-blue-800',
    link: '/catalogue',
    icon: 'truck',
    badgeText: 'FREE DELIVERY'
  },
  {
    id: 'warranty',
    title: 'Extended Warranty',
    subtitle: 'Premium Protection',
    description: 'Get 2 years warranty on all electronics and appliances.',
    bgGradient: 'from-green-600 to-green-800',
    link: '/catalogue?category=electronics',
    icon: 'shield',
    badgeText: '2 YEARS'
  }
]

interface StaticDealsProps {
  deals?: Deal[]
  columns?: 2 | 3
}

export default function StaticDeals({ deals = defaultDeals, columns = 3 }: StaticDealsProps) {
  const gridCols = columns === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Special Offers
          </h2>
          <p className="text-gray-600">
            Exclusive deals and benefits for our valued customers
          </p>
        </motion.div>

        <div className={`grid ${gridCols} gap-6`}>
          {deals.map((deal, index) => {
            const Icon = iconMap[deal.icon]

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={deal.link}>
                  <div className={`relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${deal.bgGradient}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-6 flex flex-col justify-between text-white">
                      {/* Top Section */}
                      <div>
                        {/* Badge */}
                        {deal.badgeText && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/30"
                          >
                            {deal.badgeText}
                          </motion.div>
                        )}

                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-4 border border-white/30"
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold mb-1">
                          {deal.title}
                        </h3>
                        <p className="text-sm font-semibold text-white/90 mb-3">
                          {deal.subtitle}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-white/80 leading-relaxed">
                          {deal.description}
                        </p>
                      </div>

                      {/* Bottom Section - CTA */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold group-hover:underline">
                          Learn More
                        </span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
