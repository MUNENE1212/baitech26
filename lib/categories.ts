/**
 * Comprehensive Product Category Structure
 * Organized for optimal UX with logical groupings
 */

export interface SubCategory {
  name: string
  slug: string
  description?: string
}

export interface Category {
  name: string
  slug: string
  icon?: string
  subcategories: SubCategory[]
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    subcategories: [
      { name: 'Televisions & Displays', slug: 'televisions-displays' },
      { name: 'Home Theater Systems', slug: 'home-theater' },
      { name: 'Projectors & Screens', slug: 'projectors-screens' },
      { name: 'Streaming Devices', slug: 'streaming-devices' },
      { name: 'Smart Home Devices', slug: 'smart-home' },
      { name: 'Security Cameras', slug: 'security-cameras' },
      { name: 'Drones & Accessories', slug: 'drones' },
    ],
  },
  {
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    subcategories: [
      { name: 'Desktop Computers', slug: 'desktop-computers' },
      { name: 'Laptops & Notebooks', slug: 'laptops' },
      { name: 'Gaming PCs', slug: 'gaming-pcs' },
      { name: 'Tablets & iPads', slug: 'tablets' },
      { name: 'Monitors & Displays', slug: 'monitors' },
      { name: 'All-in-One PCs', slug: 'all-in-one-pcs' },
    ],
  },
  {
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    subcategories: [
      { name: 'Keyboards & Mice', slug: 'keyboards-mice' },
      { name: 'Webcams & Microphones', slug: 'webcams-microphones' },
      { name: 'USB Hubs & Adapters', slug: 'usb-hubs-adapters' },
      { name: 'External Hard Drives', slug: 'external-storage' },
      { name: 'Laptop Bags & Cases', slug: 'laptop-bags' },
      { name: 'Cooling Pads & Stands', slug: 'cooling-stands' },
      { name: 'Docking Stations', slug: 'docking-stations' },
      { name: 'KVM Switches', slug: 'kvm-switches' },
    ],
  },
  {
    name: 'Mobile Phones & Tablets',
    slug: 'mobile-phones-tablets',
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones' },
      { name: 'Feature Phones', slug: 'feature-phones' },
      { name: 'Tablets', slug: 'tablets-mobile' },
      { name: 'Smart Watches', slug: 'smart-watches' },
      { name: 'Fitness Trackers', slug: 'fitness-trackers' },
    ],
  },
  {
    name: 'Mobile Accessories',
    slug: 'mobile-accessories',
    subcategories: [
      { name: 'Phone Cases & Covers', slug: 'phone-cases' },
      { name: 'Screen Protectors', slug: 'screen-protectors' },
      { name: 'Chargers & Cables', slug: 'chargers-cables' },
      { name: 'Power Banks', slug: 'power-banks' },
      { name: 'Car Mounts & Holders', slug: 'car-mounts' },
      { name: 'Selfie Sticks & Tripods', slug: 'selfie-sticks' },
      { name: 'Phone Rings & Grips', slug: 'phone-grips' },
      { name: 'Wireless Chargers', slug: 'wireless-chargers' },
    ],
  },
  {
    name: 'Audio & Sound',
    slug: 'audio-sound',
    subcategories: [
      { name: 'Headphones & Earphones', slug: 'headphones-earphones' },
      { name: 'Bluetooth Speakers', slug: 'bluetooth-speakers' },
      { name: 'Home Audio Systems', slug: 'home-audio' },
      { name: 'Soundbars', slug: 'soundbars' },
      { name: 'Microphones', slug: 'microphones' },
      { name: 'DJ Equipment', slug: 'dj-equipment' },
      { name: 'Car Audio', slug: 'car-audio' },
      { name: 'Musical Instruments', slug: 'musical-instruments' },
    ],
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    subcategories: [
      { name: 'Gaming Consoles', slug: 'gaming-consoles' },
      { name: 'Video Games', slug: 'video-games' },
      { name: 'Gaming Controllers', slug: 'gaming-controllers' },
      { name: 'Gaming Headsets', slug: 'gaming-headsets' },
      { name: 'Gaming Keyboards & Mice', slug: 'gaming-keyboards-mice' },
      { name: 'Gaming Chairs', slug: 'gaming-chairs' },
      { name: 'VR Headsets', slug: 'vr-headsets' },
      { name: 'Gaming Accessories', slug: 'gaming-accessories' },
    ],
  },
  {
    name: 'Networking',
    slug: 'networking',
    subcategories: [
      { name: 'WiFi Routers', slug: 'wifi-routers' },
      { name: 'Mesh WiFi Systems', slug: 'mesh-wifi' },
      { name: 'WiFi Adapters', slug: 'wifi-adapters' },
      { name: 'Network Switches', slug: 'network-switches' },
      { name: 'Powerline Adapters', slug: 'powerline-adapters' },
      { name: 'Ethernet Cables', slug: 'ethernet-cables' },
      { name: 'Range Extenders', slug: 'range-extenders' },
    ],
  },
  {
    name: 'Cables & Adapters',
    slug: 'cables-adapters',
    subcategories: [
      { name: 'HDMI Cables', slug: 'hdmi-cables' },
      { name: 'USB Cables', slug: 'usb-cables' },
      { name: 'Audio Cables', slug: 'audio-cables' },
      { name: 'Video Converters', slug: 'video-converters' },
      { name: 'Display Adapters', slug: 'display-adapters' },
      { name: 'Lightning Cables', slug: 'lightning-cables' },
      { name: 'USB-C Cables', slug: 'usb-c-cables' },
    ],
  },
  {
    name: 'Cameras & Photography',
    slug: 'cameras-photography',
    subcategories: [
      { name: 'Digital Cameras', slug: 'digital-cameras' },
      { name: 'Action Cameras', slug: 'action-cameras' },
      { name: 'Camera Lenses', slug: 'camera-lenses' },
      { name: 'Tripods & Stabilizers', slug: 'tripods-stabilizers' },
      { name: 'Camera Bags', slug: 'camera-bags' },
      { name: 'Memory Cards', slug: 'memory-cards' },
      { name: 'Lighting Equipment', slug: 'lighting-equipment' },
    ],
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    subcategories: [
      { name: 'Smart Watches', slug: 'smart-watches-wearable' },
      { name: 'Fitness Bands', slug: 'fitness-bands' },
      { name: 'Smart Glasses', slug: 'smart-glasses' },
      { name: 'Smart Rings', slug: 'smart-rings' },
      { name: 'Health Monitors', slug: 'health-monitors' },
    ],
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    subcategories: [
      { name: 'Hair Dryers & Stylers', slug: 'hair-dryers-stylers' },
      { name: 'Hair Clippers & Trimmers', slug: 'hair-clippers' },
      { name: 'Electric Shavers', slug: 'electric-shavers' },
      { name: 'Facial Care Devices', slug: 'facial-care' },
      { name: 'Massage Devices', slug: 'massage-devices' },
      { name: 'Electric Toothbrushes', slug: 'electric-toothbrushes' },
      { name: 'Beauty Tools', slug: 'beauty-tools' },
    ],
  },
  {
    name: 'Home Appliances',
    slug: 'home-appliances',
    subcategories: [
      { name: 'Vacuum Cleaners', slug: 'vacuum-cleaners' },
      { name: 'Air Purifiers', slug: 'air-purifiers' },
      { name: 'Fans & Heaters', slug: 'fans-heaters' },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
      { name: 'Water Filters', slug: 'water-filters' },
      { name: 'Iron & Steamers', slug: 'iron-steamers' },
    ],
  },
  {
    name: 'Office Electronics',
    slug: 'office-electronics',
    subcategories: [
      { name: 'Printers & Scanners', slug: 'printers-scanners' },
      { name: 'Projectors', slug: 'projectors' },
      { name: 'Laminators', slug: 'laminators' },
      { name: 'Shredders', slug: 'shredders' },
      { name: 'Label Makers', slug: 'label-makers' },
      { name: 'Office Phones', slug: 'office-phones' },
    ],
  },
  {
    name: 'Automotive Electronics',
    slug: 'automotive-electronics',
    subcategories: [
      { name: 'Car Chargers', slug: 'car-chargers' },
      { name: 'Dash Cameras', slug: 'dash-cameras' },
      { name: 'GPS Navigation', slug: 'gps-navigation' },
      { name: 'Car Audio Systems', slug: 'car-audio-systems' },
      { name: 'Bluetooth Car Kits', slug: 'bluetooth-car-kits' },
      { name: 'Parking Sensors', slug: 'parking-sensors' },
    ],
  },
  {
    name: 'Power & Electrical',
    slug: 'power-electrical',
    subcategories: [
      { name: 'Extension Cords', slug: 'extension-cords' },
      { name: 'Surge Protectors', slug: 'surge-protectors' },
      { name: 'UPS Systems', slug: 'ups-systems' },
      { name: 'Power Inverters', slug: 'power-inverters' },
      { name: 'Solar Panels & Kits', slug: 'solar-panels' },
      { name: 'Batteries & Chargers', slug: 'batteries-chargers' },
    ],
  },
  {
    name: 'Fashion Accessories',
    slug: 'fashion-accessories',
    subcategories: [
      { name: 'Watch Bands & Straps', slug: 'watch-bands' },
      { name: 'Jewelry', slug: 'jewelry' },
      { name: 'Sunglasses', slug: 'sunglasses' },
      { name: 'Bags & Backpacks', slug: 'bags-backpacks' },
      { name: 'Wallets & Cardholders', slug: 'wallets' },
      { name: 'Belts', slug: 'belts' },
    ],
  },
  {
    name: 'Kids & Baby',
    slug: 'kids-baby',
    subcategories: [
      { name: 'Kids Tablets', slug: 'kids-tablets' },
      { name: 'Educational Toys', slug: 'educational-toys' },
      { name: 'Baby Monitors', slug: 'baby-monitors' },
      { name: 'Kids Headphones', slug: 'kids-headphones' },
      { name: 'Smart Toys', slug: 'smart-toys' },
    ],
  },
]

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return PRODUCT_CATEGORIES.find(cat => cat.slug === slug)
}

/**
 * Get subcategory by parent slug and subcategory slug
 */
export function getSubCategoryBySlug(
  categorySlug: string,
  subCategorySlug: string
): SubCategory | undefined {
  const category = getCategoryBySlug(categorySlug)
  return category?.subcategories.find(sub => sub.slug === subCategorySlug)
}

/**
 * Get all subcategories across all categories
 */
export function getAllSubCategories(): SubCategory[] {
  return PRODUCT_CATEGORIES.flatMap(cat => cat.subcategories)
}

/**
 * Search categories and subcategories by query
 */
export function searchCategories(query: string): {
  category: Category
  subcategory?: SubCategory
}[] {
  const results: { category: Category; subcategory?: SubCategory }[] = []
  const lowerQuery = query.toLowerCase()

  PRODUCT_CATEGORIES.forEach(category => {
    // Check if category name matches
    if (category.name.toLowerCase().includes(lowerQuery)) {
      results.push({ category })
    }

    // Check if any subcategory matches
    category.subcategories.forEach(subcategory => {
      if (subcategory.name.toLowerCase().includes(lowerQuery)) {
        results.push({ category, subcategory })
      }
    })
  })

  return results
}
