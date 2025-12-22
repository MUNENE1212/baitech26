# EmenTech Full-Stack Next.js Application

A modern, unified full-stack e-commerce and tech services application built with Next.js 16, TypeScript, MongoDB, and Redis.

## 🚀 Features

### Frontend (Next.js App Router)
- **Modern React 19** with Server Components and Client Components
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Embla Carousel** for interactive sliders
- **Zustand** for state management
- **Lucide React** for beautiful icons

### Backend (Next.js API Routes)
- **MongoDB** with optimized indexes and queries
- **Redis** caching for improved performance
- **JWT** authentication with refresh tokens
- **Role-based access control** (Admin, Customer, Technician)
- **Input validation** with Joi
- **Rate limiting** for API protection
- **File upload handling** with Multer
- **Password hashing** with bcrypt
- **Comprehensive error handling**

### Architecture
- **Modular structure** with separation of concerns
- **Database abstraction layer** with connection pooling
- **Caching layer** with automatic invalidation
- **Authentication middleware** with JWT verification
- **Validation schemas** for API endpoints
- **TypeScript definitions** for all data models

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   ├── admin/                   # Admin panel
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── products/           # Product management
│   │   ├── services/           # Service management
│   │   ├── orders/             # Order management
│   │   ├── users/              # User management
│   │   ├── technicians/        # Technician management
│   │   └── home/               # Homepage data
│   ├── about/                  # About page
│   ├── contact-us/             # Contact page
│   ├── products/               # Product pages
│   ├── services/               # Service pages
│   └── ...                     # Other pages
├── src/                        # Backend source code
│   ├── lib/
│   │   ├── database/           # Database layer
│   │   │   ├── connection.ts   # MongoDB & Redis connections
│   │   │   └── models/         # Database models (if needed)
│   │   ├── auth/               # Authentication
│   │   │   ├── jwt.ts          # JWT handling
│   │   │   ├── password.ts     # Password utilities
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── cache/              # Caching layer
│   │   │   └── cache.ts        # Redis cache service
│   │   ├── validations/        # Input validation
│   │   │   └── schemas.ts      # Joi validation schemas
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts           # All type definitions
│   ├── scripts/               # Database scripts
│   │   ├── migrate.ts         # Migration script
│   │   └── clear-cache.ts     # Cache clearing
│   └── config/                # Configuration files
├── components/                 # React components
├── public/                    # Static assets
├── lib/                       # Next.js lib (legacy support)
└── hooks/                     # Custom React hooks
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+ (optional, for caching)
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   cd /path/to/your/project
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/baitech

   # Redis (optional)
   REDIS_URL=redis://localhost:6379

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars

   # Development
   NODE_ENV=development
   ```

3. **Database Setup**
   ```bash
   # Run migrations to create indexes
   npm run db:migrate

   # Seed initial data (admin user, sample products)
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run cache:clear` - Clear Redis cache

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/baitech` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT token expiry | `7d` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |

### Database Configuration

The application automatically creates optimized indexes for:
- Users (email unique, role, active status)
- Products (ID unique, category, text search, price)
- Services (status, customer contact, dates)
- Orders (order number unique, customer contact, dates)
- Reviews (rating, date, product/service references)

### Caching Configuration

Redis caching is implemented for:
- Homepage data (1 hour TTL)
- Product listings (30 minutes TTL)
- Product details (1 hour TTL)
- User sessions (30 minutes TTL)
- Service offerings (1 hour TTL)

## 🔐 Authentication & Authorization

### JWT Authentication
- **Access Token**: 7 days expiry
- **Refresh Token**: 30 days expiry
- **Automatic Refresh**: Client-side token rotation
- **Secure Storage**: HttpOnly cookies or secure local storage

### Role-Based Access Control
- **Admin**: Full access to all resources
- **Customer**: Access to own orders, services, and reviews
- **Technician**: Access to assigned services and ratings

### API Endpoints

#### Authentication
- `POST /api/auth` - Login/Register
- `PUT /api/auth` - Refresh token

#### Products
- `GET /api/products` - List products with filtering
- `POST /api/products` - Create product (admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only, soft delete)

#### Homepage
- `GET /api/home` - Get homepage data (featured products, services, reviews)

#### More endpoints coming soon:
- Services management
- Order processing
- User management
- Admin dashboard
- Technician management

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Use secure JWT secrets
3. Configure proper MongoDB connection
4. Set up Redis for caching (recommended)
5. Configure proper CORS origins
6. Set up proper file storage (local or cloud)

### Docker Deployment
```dockerfile
# Add Dockerfile configuration here
```

## 🧪 Testing

The application includes comprehensive testing:
- Input validation
- Authentication middleware
- Rate limiting
- Database operations
- API endpoints

## 📊 Performance Optimizations

### Database
- **Optimized Indexes**: Composite and text indexes
- **Connection Pooling**: Efficient MongoDB connections
- **Query Optimization**: Efficient database queries

### Caching
- **Redis Layer**: Intelligent caching with TTL
- **Cache Invalidation**: Automatic cache updates
- **Memoization**: Database query memoization

### Frontend
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Static Generation**: Where applicable
- **Incremental Static Regeneration**: For dynamic content

## 🔧 Development Tools

### Type Safety
- Full TypeScript coverage
- Strict type checking
- Interface definitions for all data models

### Code Quality
- ESLint configuration
- Prettier formatting (recommended)
- Husky pre-commit hooks (recommended)

### Debugging
- Comprehensive error handling
- Structured logging
- Performance monitoring

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper error handling
4. Include input validation
5. Update documentation
6. Test your changes

## 📝 Migration from FastAPI

The migration from FastAPI to Next.js API routes includes:

### ✅ Completed
- Database connection and models
- Authentication system (JWT)
- Basic API routes (products, auth, home)
- Caching layer with Redis
- Input validation with Joi
- Error handling and type definitions

### 🚧 In Progress
- Complete API endpoint migration
- Admin dashboard endpoints
- Service management endpoints
- Order processing endpoints
- File upload handling

### 📋 Next Steps
- Complete remaining API endpoints
- Add file upload functionality
- Implement email notifications
- Add analytics and monitoring
- Create admin dashboard UI
- Add comprehensive testing

## 📞 Support

For support or questions:
- Check the documentation
- Review the code comments
- Contact the development team

---

**Note**: This is a unified full-stack application. The previous FastAPI backend has been migrated to Next.js API routes for better maintainability and performance.