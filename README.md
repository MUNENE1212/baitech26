# BAITECH - E-commerce & Tech Solutions Platform

A modern, full-stack e-commerce platform built with Next.js 16, MongoDB, and Cloudinary. Features a premium minimalist design with Progressive Web App (PWA) support and WhatsApp integration for seamless customer communication.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse and search products with advanced filtering and sorting
- **Service Marketplace**: Request and manage professional tech services
- **Admin Dashboard**: Full CMS for products, categories, and images
- **Order Management**: Complete order processing with WhatsApp integration
- **Shopping Cart**: Persistent cart with real-time updates
- **WhatsApp Integration**: Direct product inquiries and cart checkout via WhatsApp
- **PWA Support**: Install as app, offline support, push notifications ready

### Technical Features
- **Modern UI**: Premium minimalist design with responsive layout
- **Image Optimization**: Automatic WebP/AVIF conversion with Cloudinary CDN
- **SEO Optimized**: Structured data, meta tags, and sitemap generation
- **Type Safe**: Full TypeScript implementation
- **State Management**: Zustand for cart state with persistence
- **Security**: JWT auth, rate limiting, input validation

## 🛠 Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 3**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management
- **next-pwa**: Progressive Web App support

### Backend (Next.js API Routes)
- **Next.js API Routes**: Built-in API endpoints
- **MongoDB**: NoSQL database (Atlas recommended)
- **Cloudinary**: Image hosting and CDN
- **JWT**: Secure authentication
- **Zod**: Schema validation

### Infrastructure
- **Docker**: Containerized deployment
- **Nginx**: Reverse proxy and SSL
- **Redis**: Optional caching layer

## 📁 Project Structure

```
baitech26/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage
│   ├── catalogue/           # Product catalog
│   ├── products/[id]/       # Product details
│   ├── services/            # Services pages
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── homepage/           # Homepage components
│   ├── products/           # Product components
│   ├── services/           # Service components
│   ├── cart/               # Shopping cart
│   ├── layout/             # Header, Footer
│   ├── admin/              # Admin components
│   └── ui/                 # UI components
├── lib/                     # Utilities
│   ├── api/                # API client
│   ├── db/                 # Database client
│   ├── security/           # Security middleware
│   └── utils/              # Helper functions
├── hooks/                   # React hooks
├── types/                   # TypeScript types
├── public/                  # Static assets
│   ├── images/             # Product images
│   └── *.png, *.ico        # Icons and favicons
├── scripts/                 # Utility scripts
├── deployment/              # Deployment configs
├── Dockerfile              # Production image
├── docker-compose.yml      # Docker services
└── next.config.ts         # Next.js config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas recommended)
- Cloudinary account

### 1. Clone and Install

```bash
git clone git@github.com:MUNENE1212/baitech26.git
cd baitech26
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# MongoDB (Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baitech

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=BAITECH
NEXT_PUBLIC_WHATSAPP_NUMBER=2547XXXXXXXX
```

### 3. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Seed Admin User

```bash
npm run seed:admin
```

Default credentials (change after first login):
- Email: admin@baitech.co.ke
- Password: (set in .env.local)

## 🐳 Docker Deployment

### Build and Run

```bash
# Build image
docker-compose build

# Start application
docker-compose up -d

# View logs
docker-compose logs -f web
```

### Production Deployment

See [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

#### Products
```http
GET  /api/products
GET  /api/products/[id]
GET  /api/products?category=audio&search=speaker
POST /api/admin/products (admin)
PUT  /api/admin/products/[id] (admin)
DELETE /api/admin/products/[id] (admin)
```

#### Homepage
```http
GET /api/home
```
Returns featured products, services, reviews, and promotions.

#### Services
```http
GET /api/services
POST /api/services (admin)
```

## 🎨 Design System

### Colors
- **Primary**: Amber (amber-400 to amber-600)
- **Neutral**: Zinc (zinc-50 to zinc-900)
- **Background**: White/zinc-50
- **Text**: zinc-900 (primary), zinc-600 (secondary)

### Typography
- **Headings**: Poppins (300-800)
- **Body**: Inter (400-600)

### Components
- Buttons: Amber primary, outlined secondary
- Cards: White with subtle borders
- Images: Rounded with aspect ratios
- Navigation: Clean mega menu

## 📱 PWA Features

The application is a Progressive Web App:

- ✅ Installable on mobile and desktop
- ✅ Offline support
- ✅ Push notifications ready
- ✅ App-like experience
- ✅ Splash screens and icons

## 🗄 Database Schema

### Products
```typescript
{
  _id: ObjectId
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  category: string
  subcategory?: string
  images: string[]
  features?: string[]
  stock: number
  featured: boolean
  rating?: number
  createdAt: Date
  updatedAt: Date
}
```

### Users
```typescript
{
  _id: ObjectId
  email: string
  password: string (hashed)
  name: string
  phone?: string
  role: 'customer' | 'admin'
  createdAt: Date
}
```

### Orders
```typescript
{
  _id: ObjectId
  userId?: ObjectId
  items: OrderItem[]
  total: number
  status: string
  createdAt: Date
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `NEXT_PUBLIC_APP_URL` | App URL | ✅ |
| `REDIS_URL` | Redis connection (optional) | ❌ |

## 🚀 Deployment

### Quick Deploy (Docker)

```bash
docker-compose up -d
```

### VPS Deployment

1. Setup VPS with Ubuntu 20.04+
2. Install Docker and Nginx
3. Clone repository
4. Configure environment
5. Run deployment script

See [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Environment Checklist

- [ ] MongoDB Atlas configured
- [ ] Cloudinary account setup
- [ ] JWT_SECRET generated (min 32 chars)
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Admin user seeded
- [ ] Test orders working

## 🔐 Security

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schemas
- **CORS**: Configured origins
- **MongoDB**: Atlas with whitelisted IPs
- **Environment Variables**: Sensitive data not in code

## 📈 Performance

- **Image Optimization**: WebP/AVIF formats
- **CDN**: Cloudinary for static assets
- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Images and components
- **Caching**: Redis (optional)
- **Server-Side Rendering**: Fast initial load

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📞 Support

For technical support:
- **Email**: mnent2025@gmail.com
- **Phone**: +254 799 954 672
- **WhatsApp**: +254 799 954 672

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Cloudinary for image management
- MongoDB for the database

---

**Built with ❤️ by BAITECH Solutions**
