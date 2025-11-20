/**
 * Product Data Generator - Adds realistic sample data to existing products
 */

import type { Product } from '@/types'

interface ProductEnhancement {
  originalPrice?: number
  rating?: number
}

/**
 * Generate realistic pricing and ratings based on category
 */
export function generateEnhancedData(product: Product): ProductEnhancement {
  const enhancement: ProductEnhancement = {}

  // Generate original price (10-30% higher than current price)
  const discountPercentages = [10, 15, 20, 25, 30]
  const randomDiscount = discountPercentages[Math.floor(Math.random() * discountPercentages.length)]
  enhancement.originalPrice = Math.round(product.price * (1 + randomDiscount / 100))

  // Generate rating based on category (higher-end products get better ratings)
  const baseRating = product.price > 50000 ? 4.0 : 3.5
  const variance = Math.random() * 1.0 // Random between 0 and 1
  enhancement.rating = Math.min(5.0, Math.max(3.0, baseRating + variance))
  enhancement.rating = Math.round(enhancement.rating * 10) / 10 // Round to 1 decimal

  return enhancement
}

/**
 * Category-specific feature templates
 */
const featureTemplates: Record<string, string[][]> = {
  'Computers & Laptops': [
    ['Intel Core i7 Processor', '16GB RAM', '512GB SSD', 'Full HD Display'],
    ['AMD Ryzen 5', '8GB DDR4 RAM', '256GB NVMe SSD', 'Backlit Keyboard'],
    ['Intel Core i5', '12GB RAM', '1TB HDD + 256GB SSD', '15.6" Screen'],
    ['Apple M2 Chip', '16GB Unified Memory', '512GB SSD', 'Retina Display']
  ],
  'Mobile Devices': [
    ['6.7" AMOLED Display', '128GB Storage', '5G Enabled', '50MP Camera'],
    ['5000mAh Battery', 'Fast Charging', 'Dual SIM', 'Fingerprint Sensor'],
    ['256GB Storage', '12GB RAM', '108MP Triple Camera', 'Wireless Charging'],
    ['Face ID', 'IP68 Water Resistant', '5G Support', 'Ceramic Shield']
  ],
  'Computer Components': [
    ['Latest Generation', 'High Performance', 'Efficient Cooling', '3 Year Warranty'],
    ['RGB Lighting', 'Overclocking Support', 'Low Power Consumption', 'Silent Operation'],
    ['Premium Build Quality', 'Easy Installation', 'Compatible with Latest Standards', 'Long Lifespan']
  ],
  'Storage Devices': [
    ['High Speed Transfer', 'Durable Design', 'Shock Resistant', 'Compact Size'],
    ['USB 3.2 Gen 2', 'Up to 550MB/s Read Speed', 'Hardware Encryption', '5 Year Warranty'],
    ['NVMe Technology', 'PCIe 4.0 Interface', 'DRAM Cache', 'Low Latency']
  ],
  'Monitors & Displays': [
    ['4K UHD Resolution', 'HDR Support', '144Hz Refresh Rate', 'IPS Panel'],
    ['1ms Response Time', 'FreeSync/G-Sync', 'Adjustable Stand', 'Blue Light Filter'],
    ['27" Display', 'Ultra-Wide', 'Curved Screen', 'Picture-in-Picture']
  ],
  'Peripherals': [
    ['Mechanical Switches', 'RGB Backlight', 'Programmable Keys', 'Ergonomic Design'],
    ['Wireless Connectivity', 'Long Battery Life', 'Plug & Play', 'Compact Design'],
    ['High Precision Sensor', 'Customizable DPI', 'Comfortable Grip', 'Durable Build']
  ],
  'Printers & Scanners': [
    ['Wireless Printing', 'Auto Duplex', 'Fast Print Speed', 'High Yield Cartridges'],
    ['All-in-One', 'Copy, Scan, Print', 'Mobile Printing', 'Energy Efficient'],
    ['High Resolution', 'Low Running Costs', 'Quiet Operation', 'Compact Footprint']
  ],
  'Audio & Sound': [
    ['Active Noise Cancellation', 'Wireless Bluetooth', '30 Hour Battery', 'Premium Sound'],
    ['Deep Bass', 'Crystal Clear Audio', 'Comfortable Fit', 'Foldable Design'],
    ['Surround Sound', 'Multiple Connectivity', 'Remote Control', 'Wall Mountable']
  ],
  'Networking': [
    ['Wi-Fi 6 Support', 'Gigabit Ethernet', 'MU-MIMO Technology', 'Easy Setup'],
    ['Dual Band', 'Extended Range', 'Parental Controls', 'Guest Network'],
    ['High Speed', 'Stable Connection', 'Multiple Ports', 'Quality of Service']
  ],
  'Cameras & Photography': [
    ['High Resolution Sensor', '4K Video Recording', 'Image Stabilization', 'Fast Autofocus'],
    ['Interchangeable Lenses', 'WiFi & Bluetooth', 'Touchscreen Display', 'RAW Support'],
    ['Wide Angle Lens', 'Night Mode', 'Professional Mode', 'Long Battery Life']
  ],
  'Gaming': [
    ['High FPS', 'Ray Tracing', 'Low Latency', 'Cooling System'],
    ['RGB Lighting', 'Customizable', 'Ergonomic', 'Tournament Grade'],
    ['Ultra-Fast Response', 'Precision Control', 'Durable Build', 'Multi-Platform']
  ],
  'Accessories': [
    ['Universal Compatibility', 'Premium Materials', 'Protective Design', 'Stylish Look'],
    ['Easy to Use', 'Portable', 'Durable Construction', 'Value for Money'],
    ['High Quality', 'Versatile', 'Lightweight', 'Long Lasting']
  ]
}

/**
 * Get random features for a category
 */
function getRandomFeatures(category: string): string[] {
  const templates = featureTemplates[category] || featureTemplates['Accessories']
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
  return randomTemplate
}

/**
 * Add realistic features if product has none or very few
 */
export function generateFeatures(product: Product): string[] {
  // If product already has good features, keep them
  if (product.features && product.features.length >= 3) {
    return product.features
  }

  // Generate features based on category
  return getRandomFeatures(product.category)
}

/**
 * Generate complete enhanced product data
 */
export function generateCompleteProductData(product: Product): Partial<Product> {
  const enhancement = generateEnhancedData(product)
  const features = generateFeatures(product)

  return {
    originalPrice: enhancement.originalPrice,
    rating: enhancement.rating,
    features: features
  }
}

/**
 * Batch generate data for multiple products
 */
export function batchGenerateProductData(products: Product[]): Map<string, Partial<Product>> {
  const enhancements = new Map<string, Partial<Product>>()

  products.forEach(product => {
    const enhanced = generateCompleteProductData(product)
    enhancements.set(product._id, enhanced)
  })

  return enhancements
}

/**
 * Apply enhancements to a product
 */
export function applyEnhancements(
  product: Product,
  enhancements: Partial<Product>
): Product {
  return {
    ...product,
    ...enhancements
  }
}

/**
 * Preview enhanced product without saving
 */
export function previewEnhancement(product: Product): Product {
  const enhancements = generateCompleteProductData(product)
  return applyEnhancements(product, enhancements)
}
