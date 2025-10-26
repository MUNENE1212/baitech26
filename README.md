# EmenTech E-commerce & Tech Solutions Platform

A modern, full-stack e-commerce and tech services platform built with Next.js, FastAPI, and MongoDB. Features a premium minimalist design with amber accents and WhatsApp integration for seamless customer communication.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse and search products with advanced filtering and sorting
- **Service Marketplace**: Request and manage professional tech services
- **User Management**: Customer registration, authentication, and profile management
- **Order Management**: Complete order processing with WhatsApp integration
- **Shopping Cart**: Persistent cart with localStorage and real-time updates
- **WhatsApp Integration**: Direct product inquiries and cart checkout via WhatsApp

### Frontend Features (Next.js)
- **Modern UI**: Premium minimalist design with amber color accents
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Image Carousel**: Auto-rotating product image galleries
- **Toast Notifications**: User-friendly feedback system with Sonner
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand for cart state with persistence
- **Optimized Images**: Next.js Image component for automatic optimization

## 🛠 Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v3**: Utility-first styling
- **Zustand**: Lightweight state management
- **Framer Motion**: Smooth animations
- **Lucide React**: Modern icon library
- **Sonner**: Toast notifications

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Motor async driver
- **JWT**: Secure authentication
- **Pydantic**: Data validation and serialization
- **CORS**: Cross-origin resource sharing configured

## 📁 Project Structure

```
newbaitech/
├── baitech-frontend/          # Next.js frontend application
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx          # Homepage
│   │   ├── catalogue/        # Product catalog
│   │   ├── services/         # Services page
│   │   ├── about/            # About page
│   │   ├── login/            # Login page
│   │   └── signup/           # Signup page
│   ├── components/           # React components
│   │   ├── homepage/         # Homepage components
│   │   ├── products/         # Product components
│   │   ├── services/         # Service components
│   │   ├── cart/             # Shopping cart components
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── reviews/          # Review components
│   │   └── ui/               # UI components (ImageCarousel, etc.)
│   ├── hooks/                # Custom React hooks
│   │   └── useCart.ts        # Cart management hook
│   ├── lib/                  # Utilities and helpers
│   │   ├── api/              # API client functions
│   │   └── utils/            # Utility functions
│   ├── store/                # Zustand stores
│   │   └── cartStore.ts      # Cart state management
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Shared types
│   └── public/               # Static assets
│       └── images/           # Product images
├── routes/                   # FastAPI route modules
│   └── api_routes.py         # API endpoints
├── utils/                    # Backend utilities
│   ├── database.py           # MongoDB connection
│   ├── auth.py              # Authentication helpers
│   └── models.py            # Pydantic models
├── main.py                  # FastAPI application entry point
└── requirements.txt         # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB instance
- Modern web browser

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd newbaitech
```

#### 2. Backend Setup

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Create `.env` file:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=baitech
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Initialize database (optional):
```bash
python seed_services.py  # Seed initial services
python insert_p.py       # Insert sample products
```

Start the FastAPI backend:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup

Navigate to frontend directory:
```bash
cd baitech-frontend
```

Install dependencies:
```bash
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```

#### 4. Access the application
- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Get Homepage Data
```http
GET /api/v1/home
```
Returns featured products, services, and reviews.

#### Get Products
```http
GET /api/v1/products?search=&category=&limit=100
```
Query parameters:
- `search`: Search term for product name
- `category`: Filter by category
- `limit`: Maximum number of results

#### Get Single Product
```http
GET /api/v1/products/{product_id}
```

#### Get Services
```http
GET /api/v1/services
```

### Authentication

#### Signup
```http
POST /signup
Content-Type: application/json

{
  "username": "user@example.com",
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe",
  "phone_number": "+254700000000"
}
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Amber (amber-400 to amber-600)
- **Neutral**: Zinc (zinc-50 to zinc-900)
- **Background**: White and zinc-50
- **Text**: zinc-900 (primary), zinc-600 (secondary)

### Typography
- **Font**: System font stack with light/semibold weights
- **Headings**: Light weight with semibold accents
- **Body**: Regular weight zinc-600

### Components
- **Buttons**: Amber primary, zinc secondary
- **Cards**: White with subtle borders and rounded corners
- **Images**: Rounded (rounded-lg) with aspect ratios
- **Navigation**: Clean, icon-free design
- **Footer**: Dark (zinc-900) with amber accents

## 💻 Frontend Development

### Key Components

#### Product Card
```typescript
<ProductCard product={product} />
```
Features:
- Image carousel on hover
- Add to cart button
- WhatsApp order button
- Stock indicators

#### Cart Management
```typescript
import { useCart } from '@/hooks/useCart'

const { items, totalItems, totalPrice, addToCart, removeFromCart } = useCart()
```

#### WhatsApp Integration
```typescript
import { generateProductWhatsAppUrl, openWhatsApp } from '@/lib/utils/whatsapp'

// For product orders
const url = generateProductWhatsAppUrl(product)
openWhatsApp(url)

// For cart checkout
const cartUrl = generateCartWhatsAppUrl(cartItems)
openWhatsApp(cartUrl)
```

### Building for Production

```bash
cd baitech-frontend
npm run build
npm start
```

## 🗄 Database Schema

### Products Collection
```javascript
{
  "_id": ObjectId,
  "product_id": "string",
  "name": "string",
  "price": Number,
  "description": "string",
  "category": "string",
  "images": ["/images/filename.jpg"],
  "features": ["string"],
  "stock": Number,
  "featured": Boolean,
  "created_at": Date
}
```

### Users Collection
```javascript
{
  "_id": ObjectId,
  "username": "string",
  "email": "string",
  "password": "hashed_string",
  "full_name": "string",
  "phone_number": "string",
  "role": "customer|admin",
  "created_at": Date
}
```

## 🔧 Configuration

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### Backend Environment Variables
- `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: Database name
- `SECRET_KEY`: JWT secret key
- `ALGORITHM`: JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (1440 = 24 hours)

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd baitech-frontend
npm run build
```
Deploy to Vercel:
- Connect GitHub repository
- Set environment variable: `NEXT_PUBLIC_API_URL`
- Deploy

### Backend Deployment (Production)
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment
```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY baitech-frontend/package*.json ./
RUN npm install
COPY baitech-frontend .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

## 🎯 Key Features & Highlights

### WhatsApp Integration
- Direct product inquiries with pre-filled product details
- Cart checkout via WhatsApp with complete order summary
- General inquiry support

### Modern UI/UX
- Premium minimalist design
- Smooth animations with Framer Motion
- Image carousels with auto-rotation
- Responsive mobile-first design

### Performance
- Next.js Image optimization
- Server-side rendering
- Automatic code splitting
- Lazy loading images

## 🔐 Security Features

- **Password Hashing**: Secure bcrypt hashing
- **JWT Authentication**: Stateless tokens
- **CORS Configuration**: Controlled origins
- **Type Validation**: Pydantic and TypeScript
- **XSS Protection**: React automatic escaping

## 📞 Support & Contact

For technical support or business inquiries:

- **Email**: mnent2025@gmail.com
- **Phone**: +254 799 954 672
- **WhatsApp**: +254 799 954 672
- **Location**: Nairobi, Kenya

## 📄 License

This project is proprietary software developed for EmenTech. All rights reserved.

---

## 🚀 Quick Start Guide

1. **Install Backend**: `pip install -r requirements.txt`
2. **Setup MongoDB**: Configure `.env` with MongoDB connection
3. **Start Backend**: `uvicorn main:app --reload`
4. **Install Frontend**: `cd baitech-frontend && npm install`
5. **Configure Frontend**: Create `.env.local` with `NEXT_PUBLIC_API_URL`
6. **Start Frontend**: `npm run dev`
7. **Access Application**: Visit http://localhost:3001

The platform is now ready for development!
