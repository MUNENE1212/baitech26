# EmenTech Frontend

Modern Next.js 16 frontend for the EmenTech e-commerce platform. Features a premium minimalist design with amber accents, WhatsApp integration, and optimized performance.

## 🚀 Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v3**: Utility-first styling
- **Zustand**: Lightweight state management
- **Framer Motion**: Smooth animations
- **Lucide React**: Modern icon library
- **Sonner**: Beautiful toast notifications

## 📁 Project Structure

```
baitech-frontend/
├── app/                       # Next.js App Router pages
│   ├── page.tsx              # Homepage
│   ├── catalogue/            # Product catalog page
│   ├── services/             # Services page
│   ├── about/                # About page
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── homepage/            # Homepage components
│   │   └── Hero.tsx         # Hero section
│   ├── products/            # Product components
│   │   ├── ProductCard.tsx  # Product card
│   │   └── ProductGrid.tsx  # Product grid
│   ├── services/            # Service components
│   │   └── ServiceGrid.tsx  # Service grid
│   ├── cart/                # Shopping cart
│   │   ├── CartDrawer.tsx   # Cart sidebar
│   │   └── WhatsAppCheckout.tsx  # WhatsApp checkout
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # Header/Navigation
│   │   └── Footer.tsx       # Footer
│   ├── reviews/             # Review components
│   │   └── ReviewSection.tsx
│   └── ui/                  # UI components
│       └── ImageCarousel.tsx # Image carousel
├── hooks/                   # Custom React hooks
│   └── useCart.ts           # Cart management
├── lib/                     # Utilities and helpers
│   ├── api/                 # API client functions
│   │   └── home.ts          # Homepage API
│   └── utils/               # Utility functions
│       ├── cn.ts            # Class name utility
│       └── whatsapp.ts      # WhatsApp integration
├── store/                   # Zustand stores
│   └── cartStore.ts         # Cart state
├── types/                   # TypeScript definitions
│   └── index.ts             # Shared types
└── public/                  # Static assets
    └── images/              # Product images
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**

   Navigate to http://localhost:3001

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Color Palette

**Primary Colors (Amber)**
- `amber-50` - Light backgrounds, badges
- `amber-400` - Accent elements
- `amber-500` - Primary buttons
- `amber-600` - Primary buttons hover, headings
- `amber-700` - Hover states

**Neutral Colors (Zinc)**
- `zinc-50` - Light backgrounds
- `zinc-100` - Borders, dividers
- `zinc-600` - Secondary text
- `zinc-700` - Body text
- `zinc-900` - Headings, footer background

### Typography

**Headings**
```tsx
<h1 className="text-4xl font-light tracking-tight text-zinc-900 lg:text-5xl">
  Heading <span className="font-semibold text-amber-600">Accent</span>
</h1>
```

**Body Text**
```tsx
<p className="text-zinc-600">Body text</p>
```

### Button Styles

**Primary Button**
```tsx
<button className="bg-amber-600 text-white px-6 py-3 hover:bg-amber-700">
  Button Text
</button>
```

**Secondary Button**
```tsx
<button className="border border-zinc-300 text-zinc-700 px-6 py-3 hover:bg-zinc-50">
  Button Text
</button>
```

## 💻 Key Features

### 1. Product Catalog

Browse products with advanced filtering and search:

```typescript
// app/catalogue/page.tsx
const [searchQuery, setSearchQuery] = useState('')
const [selectedCategory, setSelectedCategory] = useState('all')
const [sortBy, setSortBy] = useState('newest')
```

### 2. Shopping Cart

Persistent cart with Zustand:

```typescript
import { useCart } from '@/hooks/useCart'

const { items, totalItems, totalPrice, addToCart } = useCart()

// Add item
await addToCart({
  productId: product.product_id,
  name: product.name,
  price: product.price,
  image: product.images[0]
})
```

### 3. WhatsApp Integration

Direct checkout via WhatsApp:

```typescript
import { generateProductWhatsAppUrl, openWhatsApp } from '@/lib/utils/whatsapp'

// Product inquiry
const url = generateProductWhatsAppUrl(product)
openWhatsApp(url)

// Cart checkout
const cartUrl = generateCartWhatsAppUrl(cartItems)
openWhatsApp(cartUrl)
```

### 4. Image Carousel

Auto-rotating product images:

```typescript
<ImageCarousel
  images={product.images}
  alt={product.name}
/>
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Tailwind Configuration

Colors are configured in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      amber: {
        50: '#fffbeb',
        // ... amber shades
      }
    }
  }
}
```

## 📦 Building for Production

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Set in your hosting platform:
- `NEXT_PUBLIC_API_URL`: Production API URL

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your Git repository to Vercel

2. **Configure**
   - Framework Preset: Next.js
   - Root Directory: `baitech-frontend`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

4. **Deploy**
   - Click Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🎯 Performance Optimizations

### Image Optimization

Next.js Image component automatically optimizes images:

```typescript
import Image from 'next/image'

<Image
  src="/images/product.jpg"
  alt="Product"
  width={400}
  height={400}
  className="object-cover"
/>
```

### Code Splitting

Automatic code splitting with Next.js App Router:
- Each route is a separate bundle
- Components are lazy-loaded

### Font Optimization

Uses `next/font` for optimized font loading.

## 📚 Component Library

### ProductCard

Display product with hover effects:

```typescript
import { ProductCard } from '@/components/products/ProductCard'

<ProductCard product={product} />
```

Features:
- Image carousel on hover
- Add to cart button
- WhatsApp order button
- Stock indicators
- Price display

### CartDrawer

Sliding cart drawer:

```typescript
import { CartDrawer } from '@/components/cart/CartDrawer'

<CartDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### ImageCarousel

Auto-rotating image carousel:

```typescript
import { ImageCarousel } from '@/components/ui/ImageCarousel'

<ImageCarousel
  images={['/img1.jpg', '/img2.jpg']}
  alt="Product name"
/>
```

## 🔐 Authentication

### Login

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Signup

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: email,
    email,
    password,
    full_name: fullName,
    phone_number: phone
  })
})
```

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Change amber to your brand color
      primary: {
        50: '#...',
        // ... other shades
      }
    }
  }
}
```

### Updating Brand

1. Update logo in `components/layout/Header.tsx`
2. Update company name in `components/layout/Footer.tsx`
3. Update metadata in `app/layout.tsx`

## 📱 Mobile Optimization

- Mobile-first responsive design
- Touch-friendly buttons and links
- Optimized images for mobile
- Responsive navigation menu
- Fast page loads

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Change port in package.json
"dev": "next dev -p 3002"
```

**API connection failed**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running on correct port
- Check CORS configuration in backend

**Images not loading**
- Verify images exist in `public/images/`
- Check image paths start with `/images/`
- Ensure image files are not too large

## 📞 Support

For technical support:
- **Email**: mnent2025@gmail.com
- **Phone**: +254 799 954 672

## 📄 License

This project is proprietary software developed for EmenTech. All rights reserved.
