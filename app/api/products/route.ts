import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '../../../src/lib/database/connection';
import { cacheService } from '../../../src/lib/cache/cache';
import { requireAuth, requireAdmin } from '../../../src/lib/auth/middleware';
import { productCreateSchema, validateBody } from '../../../src/lib/validations/schemas';

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Check cache first
    const cacheKey = searchParams.toString();
    const cachedProducts = await cacheService.get(cacheKey);
    if (cachedProducts) {
      return NextResponse.json({
        success: true,
        data: cachedProducts,
        cached: true,
      });
    }

    const db = await connectMongoDB();
    const productsCollection = db.collection('products');

    // Build query - only show active products
    const query: any = { is_active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    if (featured !== null) {
      query.featured = featured === 'true';
    }

    // Count total products for pagination
    const total = await productsCollection.countDocuments(query);

    // Get products with pagination
    const skip = (page - 1) * limit;
    const products = await productsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform products for API response
    const transformedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory,
      features: product.features || [],
      images: product.images || [],
      featured: product.featured || false,
      is_on_sale: product.is_on_sale || false,
      is_hot_deal: product.is_hot_deal || false,
      isHotDeal: product.is_hot_deal || false,
      discount_percentage: product.discount_percentage,
      original_price: product.original_price,
      originalPrice: product.original_price,
      rating: product.rating,
      num_reviews: product.num_reviews,
      tags: product.tags,
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      created_at: product.created_at,
      updated_at: product.updated_at,
      seo: product.seo,
    }));

    const response = {
      products: transformedProducts,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_products: total,
        products_per_page: limit,
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    };

    // Cache the result for 15 minutes
    await cacheService.set(cacheKey, response, 900);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    return requireAdmin(async (request: NextRequest, user: any) => {
      try {
        const body = await request.json();
        const validation = validateBody(productCreateSchema)(body);

        if (!validation.isValid) {
          return NextResponse.json(
            { success: false, error: 'Invalid product data', errors: validation.errors },
            { status: 400 }
          );
        }

        const productData = validation.data!;

        // Try database operations with graceful fallback
        try {
          const db = await connectMongoDB();
          const productsCollection = db.collection('products');

          // Check if product_id already exists
          const existingProduct = await productsCollection.findOne({
            product_id: productData.product_id
          });

          if (existingProduct) {
            return NextResponse.json(
              { success: false, error: 'Product ID already exists' },
              { status: 409 }
            );
          }

          // Create new product
          const newProduct = {
            product_id: productData.product_id,
            name: productData.name,
            description: productData.description || '',
            price: parseFloat(productData.price.toString()),
            stock: parseInt(productData.stock?.toString() || '0'),
            category: productData.category,
            subcategory: productData.subcategory,
            features: productData.features || [],
            images: productData.images || [],
            featured: productData.featured || false,
            is_on_sale: body.is_on_sale || false,
            is_hot_deal: body.is_hot_deal || false,
            discount_percentage: body.discount_percentage,
            original_price: body.original_price,
            rating: body.rating || 0,
            num_reviews: body.num_reviews || 0,
            tags: body.tags || [],
            sku: body.sku,
            weight: body.weight,
            dimensions: body.dimensions,
            seo: productData.seo,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: user.user_id, // Track who created the product
          };

          const result = await productsCollection.insertOne(newProduct);

          // Clear related caches (non-blocking)
          try {
            await cacheService.invalidateProductCaches();
          } catch (cacheError) {
            console.warn('Cache invalidation failed:', cacheError);
          }

          // Return created product
          const createdProduct = {
            id: result.insertedId.toString(),
            ...newProduct,
          };

          return NextResponse.json({
            success: true,
            data: createdProduct,
            message: 'Product created successfully'
          });

        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          return NextResponse.json(
            {
              success: false,
              error: 'Unable to create product due to database connectivity issues. Please try again later.',
              warning: 'Database connection issue detected'
            },
            { status: 503 } // Service Unavailable
          );
        }

      } catch (error) {
        console.error('Products POST error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create product' },
          { status: 500 }
        );
      }
    })(request);
  } catch (error) {
    console.error('Authentication or wrapper error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}