'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Laptop,
  Smartphone,
  Monitor,
  Cpu,
  HardDrive,
  Printer,
  Camera,
  Headphones,
  Mouse,
  Keyboard,
  Speaker,
  ChevronRight,
  Grid3x3,
  Package
} from 'lucide-react'
import type { Product } from 'src/types'

export interface CategoryItem {
  id: string
  name: string
  slug: string
  icon?: keyof typeof iconMap
  image?: string
  subcategories?: SubCategory[]
  productCount: number
  color?: string
}

export interface SubCategory {
  id: string
  name: string
  slug: string
  productCount: number
}

const iconMap = {
  laptop: Laptop,
  smartphone: Smartphone,
  monitor: Monitor,
  cpu: Cpu,
  storage: HardDrive,
  printer: Printer,
  camera: Camera,
  headphones: Headphones,
  mouse: Mouse,
  keyboard: Keyboard,
  speaker: Speaker,
  all: Grid3x3,
  package: Package
}

// Icon mapping based on category keywords
function getCategoryIcon(categoryName: string): keyof typeof iconMap {
  const name = categoryName.toLowerCase()

  if (name.includes('laptop') || name.includes('computer')) return 'laptop'
  if (name.includes('mobile') || name.includes('phone')) return 'smartphone'
  if (name.includes('monitor') || name.includes('display')) return 'monitor'
  if (name.includes('component') || name.includes('processor')) return 'cpu'
  if (name.includes('storage') || name.includes('drive')) return 'storage'
  if (name.includes('printer') || name.includes('scanner')) return 'printer'
  if (name.includes('camera') || name.includes('photo')) return 'camera'
  if (name.includes('headphone') || name.includes('headset')) return 'headphones'
  if (name.includes('mouse') || name.includes('mice')) return 'mouse'
  if (name.includes('keyboard')) return 'keyboard'
  if (name.includes('speaker') || name.includes('audio') || name.includes('sound')) return 'speaker'

  return 'package'
}

// Color mapping based on category
function getCategoryColor(index: number): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-cyan-500 to-cyan-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-red-500 to-red-600',
    'from-teal-500 to-teal-600',
    'from-amber-500 to-amber-600'
  ]
  return colors[index % colors.length]
}

// Predefined categories with default icons and colors
const predefinedCategories: Omit<CategoryItem, 'productCount'>[] = [
  {
    id: 'computers-laptops',
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    icon: 'laptop',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'mobile-devices',
    name: 'Mobile Devices',
    slug: 'mobile-devices',
    icon: 'smartphone',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'computer-components',
    name: 'Computer Components',
    slug: 'computer-components',
    icon: 'cpu',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'storage-devices',
    name: 'Storage Devices',
    slug: 'storage-devices',
    icon: 'storage',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'monitors-displays',
    name: 'Monitors & Displays',
    slug: 'monitors-displays',
    icon: 'monitor',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'peripherals',
    name: 'Peripherals',
    slug: 'peripherals',
    icon: 'keyboard',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'printers-scanners',
    name: 'Printers & Scanners',
    slug: 'printers-scanners',
    icon: 'printer',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'audio-sound',
    name: 'Audio & Sound',
    slug: 'audio-sound',
    icon: 'speaker',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'networking',
    name: 'Networking',
    slug: 'networking',
    icon: 'cpu',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'cameras-photography',
    name: 'Cameras & Photography',
    slug: 'cameras-photography',
    icon: 'camera',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'gaming',
    icon: 'cpu',
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    icon: 'package',
    color: 'from-gray-500 to-gray-600'
  }
]

/**
 * Merge predefined categories with actual product counts
 */
function mergeCategoriesWithProducts(products: Product[]): CategoryItem[] {
  // Count products by category
  const productCountMap = new Map<string, number>()

  products.forEach(product => {
    const category = product.category || 'Other'
    // Normalize category name to match predefined ones
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
    productCountMap.set(normalizedCategory, (productCountMap.get(normalizedCategory) || 0) + 1)
  })

  // Add product counts to predefined categories
  const categoriesWithCounts: CategoryItem[] = predefinedCategories.map(cat => ({
    ...cat,
    productCount: productCountMap.get(cat.slug) || 0
  }))

  // Find any categories in products that aren't in predefined list
  const predefinedSlugs = new Set(predefinedCategories.map(c => c.slug))
  const extraCategories: CategoryItem[] = []
  let extraIndex = 0

  productCountMap.forEach((count, slug) => {
    if (!predefinedSlugs.has(slug)) {
      // Find the original category name from products
      const product = products.find(p =>
        (p.category || 'Other').toLowerCase().replace(/\s+/g, '-') === slug
      )
      const categoryName = product?.category || 'Other'

      extraCategories.push({
        id: slug,
        name: categoryName,
        slug: slug,
        icon: getCategoryIcon(categoryName),
        productCount: count,
        color: getCategoryColor(extraIndex + 10) // Offset to avoid color clashes
      })
      extraIndex++
    }
  })

  // Sort: categories with products first, then by count, then alphabetically
  const sorted = [...categoriesWithCounts, ...extraCategories].sort((a, b) => {
    if (a.productCount > 0 && b.productCount === 0) return -1
    if (a.productCount === 0 && b.productCount > 0) return 1
    if (a.productCount !== b.productCount) return b.productCount - a.productCount
    return a.name.localeCompare(b.name)
  })

  return sorted
}

interface CategoryHierarchyProps {
  products?: Product[]
  layout?: 'grid' | 'list'
  showProductCount?: boolean
  onCategoryClick?: (categorySlug: string) => void
  selectedCategory?: string
  enableFiltering?: boolean
}

export default function CategoryHierarchy({
  products = [],
  layout = 'grid',
  showProductCount = true,
  onCategoryClick,
  selectedCategory,
  enableFiltering = false
}: CategoryHierarchyProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])

  useEffect(() => {
    const mergedCategories = mergeCategoriesWithProducts(products)
    setCategories(mergedCategories)
  }, [products])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  // Count available vs unavailable categories
  const availableCount = categories.filter(c => c.productCount > 0).length
  const totalCount = categories.length

  if (layout === 'grid') {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-600">
              {availableCount > 0
                ? `${availableCount} ${availableCount === 1 ? 'category' : 'categories'} available`
                : 'Browse our collection of tech products'}
            </p>
            {availableCount < totalCount && availableCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                More categories coming soon
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon ? iconMap[category.icon] : Grid3x3
              const isExpanded = expandedCategory === category.id
              const isHovered = hoveredCategory === category.id
              const isAvailable = category.productCount > 0

              const isSelected = selectedCategory === category.slug

              const handleCategoryClick = (e: React.MouseEvent) => {
                if (!isAvailable) return
                if (enableFiltering && onCategoryClick) {
                  e.preventDefault()
                  onCategoryClick(category.slug)
                }
              }

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Main Category Card */}
                  {enableFiltering ? (
                    <motion.div
                      onClick={handleCategoryClick}
                      whileHover={isAvailable ? { y: -5 } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      className={`group ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <div className={`relative h-32 rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
                        isAvailable ? 'hover:shadow-xl' : 'opacity-60'
                      } ${isSelected ? 'ring-4 ring-amber-500 ring-offset-2' : ''}`}>
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} ${
                          isAvailable ? 'opacity-90 group-hover:opacity-100' : 'opacity-40'
                        } transition-opacity`} />

                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '15px 15px'
                          }} />
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        {/* Unavailable Overlay */}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                              <span className="text-xs font-semibold text-gray-700">Coming Soon</span>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="relative h-full p-4 flex flex-col justify-between text-white">
                          <div>
                            <motion.div
                              animate={{ rotate: isHovered && isAvailable ? 360 : 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Icon className="w-8 h-8 mb-2" />
                            </motion.div>
                            <h3 className="font-bold text-sm md:text-base line-clamp-2">
                              {category.name}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs opacity-80">
                              {isAvailable ? (
                                `${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}`
                              ) : (
                                'No products yet'
                              )}
                            </span>
                            {isAvailable && <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <Link href={isAvailable ? `/catalogue?category=${category.slug}` : '#'}>
                      <motion.div
                        whileHover={isAvailable ? { y: -5 } : {}}
                        whileTap={isAvailable ? { scale: 0.98 } : {}}
                        className={`group ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div className={`relative h-32 rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
                          isAvailable ? 'hover:shadow-xl' : 'opacity-60'
                        }`}>
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} ${
                            isAvailable ? 'opacity-90 group-hover:opacity-100' : 'opacity-40'
                          } transition-opacity`} />

                          {/* Pattern Overlay */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                              backgroundSize: '15px 15px'
                            }} />
                          </div>

                          {/* Unavailable Overlay */}
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                <span className="text-xs font-semibold text-gray-700">Coming Soon</span>
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          <div className="relative h-full p-4 flex flex-col justify-between text-white">
                            <div>
                              <motion.div
                                animate={{ rotate: isHovered && isAvailable ? 360 : 0 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Icon className="w-8 h-8 mb-2" />
                              </motion.div>
                              <h3 className="font-bold text-sm md:text-base line-clamp-2">
                                {category.name}
                              </h3>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs opacity-80">
                                {isAvailable ? (
                                  `${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}`
                                ) : (
                                  'No products yet'
                                )}
                              </span>
                              {isAvailable && <ChevronRight className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* View All Categories Link - Only show if products available */}
          {availableCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full transition-all hover:scale-105 shadow-md"
              >
                Browse All Products
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    )
  }

  // List layout for sidebar/compact view
  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const Icon = category.icon ? iconMap[category.icon] : Grid3x3
        const isExpanded = expandedCategory === category.id

        return (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                  {category.name}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && category.subcategories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-12 pr-4 py-2 space-y-1">
                    {category.subcategories.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/catalogue?category=${category.slug}&subcategory=${subcat.slug}`}
                        className="block py-2 text-sm text-gray-600 hover:text-amber-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span>{subcat.name}</span>
                          {showProductCount && subcat.productCount !== undefined && (
                            <span className="text-xs text-gray-400">
                              ({subcat.productCount})
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
