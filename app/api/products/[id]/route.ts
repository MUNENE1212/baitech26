import { NextRequest, NextResponse } from 'next/server';
import { productUpdateSchema, validateBody } from '../../../../src/lib/validations/schemas';
import { requireAuth, requireAdmin } from '../../../../src/lib/auth/middleware';
import { connectMongoDB } from '../../../../src/lib/database/connection';
import { cacheService } from '../../../../src/lib/cache/cache';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../src/types';
import { ObjectId } from 'mongodb';

// GET /api/products/[id] - Get single product
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
     const { id } = await params;

     // Temporarily disable cache to prevent hanging
     // TODO: Re-enable cache after fixing Redis connection issues
     // const cachedProduct = await cacheService.getCachedProduct(id);
     // if (cachedProduct) {
     //   return NextResponse.json({
     //     success: true,
     //     data: cachedProduct,
     //     cached: true,
     //   });
     // }

     const db = await connectMongoDB();
     const productsCollection = db.collection('products');

     // Try to find by MongoDB _id first, then product_id
     let product;

     // Check if id looks like a valid ObjectId (24 hex characters)
     const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

     if (isValidObjectId) {
       try {
         product = await productsCollection.findOne({
           _id: new ObjectId(id),
           is_active: true,
         });
       } catch (error) {
         console.warn('[API] ObjectId query failed:', error);
       }
     }

     // If not found by ObjectId, try product_id field
     if (!product) {
       product = await productsCollection.findOne({
         product_id: id,
         is_active: true,
       });
     }

     if (!product) {
       return NextResponse.json(
         { success: false, error: 'Product not found' },
         { status: 404 }
       );
     }

    // Transform product for API response
    const transformedProduct = {
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
      created_at: product.created_at,
      updated_at: product.updated_at,
      seo: product.seo,
    };

    // Temporarily disable cache to prevent hanging
    // TODO: Re-enable cache after fixing Redis connection issues
    // await cacheService.cacheProduct(id, transformedProduct, 3600);

    return NextResponse.json({
      success: true,
      data: transformedProduct,
    });

  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return requireAdmin(async (request: NextRequest, user: any) => {
    try {
      const { id } = await params;
      const body = await request.json();

      const validation = validateBody(productUpdateSchema)(body);

      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return NextResponse.json(
          { success: false, error: 'Invalid product data', errors: validation.errors },
          { status: 400 }
        );
      }

      const updateData = validation.data!;

      // Try database operations with graceful fallback
      try {
        const db = await connectMongoDB();
        const productsCollection = db.collection('products');

        // Find product first
        let existingProduct;
        try {
          existingProduct = await productsCollection.findOne({
            _id: new ObjectId(id),
          });
        } catch (error) {
          // Invalid ObjectId, try product_id field
          existingProduct = await productsCollection.findOne({
            product_id: id,
          });
        }

        if (!existingProduct) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        }

        // Add updated timestamp and track who updated it
        const updateDoc = {
          ...updateData,
          updated_at: new Date(),
          updated_by: user.user_id, // Track who updated the product
        };

        // Update product and return the updated document
        const filter = existingProduct._id ? { _id: existingProduct._id } : { product_id: id };
        const updatedProduct = await productsCollection.findOneAndUpdate(
          filter,
          { $set: updateDoc },
          { returnDocument: 'after' }
        );

        if (!updatedProduct) {
          return NextResponse.json(
            { success: false, error: 'Product not found or update failed' },
            { status: 404 }
          );
        }

        // Clear related caches (non-blocking)
        try {
          await cacheService.invalidateProductCaches(id);
        } catch (cacheError) {
          console.warn('Cache invalidation failed:', cacheError);
        }

        // Transform and return updated product
        const transformedProduct = {
          id: updatedProduct._id.toString(),
          product_id: updatedProduct.product_id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          category: updatedProduct.category,
          subcategory: updatedProduct.subcategory,
          features: updatedProduct.features || [],
          images: updatedProduct.images || [],
          featured: updatedProduct.featured || false,
          created_at: updatedProduct.created_at,
          updated_at: updatedProduct.updated_at,
          is_active: updatedProduct.is_active,
          seo: updatedProduct.seo,
        };

        // Cache updated product for 1 hour (non-blocking)
        try {
          await cacheService.cacheProduct(id, transformedProduct, 3600);
        } catch (cacheError) {
          console.warn('Product caching failed:', cacheError);
        }

        return NextResponse.json({
          success: true,
          data: transformedProduct,
          message: 'Product updated successfully',
        });

      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        return NextResponse.json(
          {
            success: false,
            error: 'Unable to update product due to database connectivity issues. Please try again later.',
            warning: 'Database connection issue detected'
          },
          { status: 503 } // Service Unavailable
        );
      }

    } catch (error) {
      console.error('Product PUT error:', error);

      // General server error
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
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

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return requireAuth(async (request: NextRequest, user: any) => {
    try {
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Only admins can delete products' },
          { status: 403 }
        );
      }

      const { id } = await params;

      // Try database operations with graceful fallback
      try {
        const db = await connectMongoDB();
        const productsCollection = db.collection('products');

        // Find product first
        let existingProduct;
        try {
          existingProduct = await productsCollection.findOne({
            _id: new ObjectId(id),
          });
        } catch (error) {
          // Invalid ObjectId, try product_id field
          existingProduct = await productsCollection.findOne({
            product_id: id,
          });
        }

        if (!existingProduct) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        }

        // Soft delete (set is_active to false)
        const result = await productsCollection.updateOne(
          existingProduct._id ? { _id: existingProduct._id } : { product_id: id },
          {
            $set: {
              is_active: false,
              deleted_at: new Date(),
            },
          }
        );

        if (result.matchedCount === 0) {
          return NextResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        }

        // Clear related caches (non-blocking)
        try {
          await cacheService.invalidateProductCaches(id);
        } catch (cacheError) {
          console.warn('Cache invalidation failed:', cacheError);
        }

        return NextResponse.json({
          success: true,
          message: 'Product deleted successfully',
        });

      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        return NextResponse.json(
          {
            success: false,
            error: 'Unable to delete product due to database connectivity issues. Please try again later.',
            warning: 'Database connection issue detected'
          },
          { status: 503 } // Service Unavailable
        );
      }

    } catch (error) {
      console.error('Product DELETE error:', error);

      // Handle specific error types
      if (error instanceof NotFoundError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }

      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        );
      }

      // General server error
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
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