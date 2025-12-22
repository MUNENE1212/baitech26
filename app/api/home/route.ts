import { NextRequest, NextResponse } from 'next/server';
import { getProductsCollection, getServicesOfferedCollection, getReviewsCollection } from '../../../src/lib/database/connection';
import { cacheService } from '../../../src/lib/cache/cache';

// GET /api/home - Get homepage data (featured products, services, reviews)
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedData = await cacheService.getCachedHomepageData();
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fetch data in parallel
    const [productsCollection, servicesCollection, reviewsCollection] = await Promise.all([
      getProductsCollection(),
      getServicesOfferedCollection(),
      getReviewsCollection(),
    ]);

    // Get featured products (limit 6)
    const featuredProducts = await productsCollection
      .find({
        $or: [
          { featured: true, is_active: true },
          { isHotDeal: true, is_active: true }
        ]
      })
      .limit(6)
      .sort({ created_at: -1 })
      .toArray();

    // Get active services (limit 4, randomly)
    const allServices = await servicesCollection
      .find({ is_active: true })
      .sort({ order: 1 })
      .toArray();

    const featuredServices = allServices.slice(0, 4);

    // Get recent reviews (limit 5)
    const recentReviews = await reviewsCollection
      .find()
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    // Transform data for API response
    const transformedProducts = featuredProducts.map((product: any) => ({
      id: product._id.toString(),
      product_id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory,
      images: product.images || [],
      featured: product.featured,
      seo: product.seo,
    }));

    const transformedServices = featuredServices.map((service: any) => ({
      id: service._id.toString(),
      service_id: service.service_id,
      name: service.name,
      description: service.description,
      // Transform price_range to match frontend Service interface expectations
      price_range: {
        min: service.base_price || service.pricing || 0,
        max: service.base_price || service.pricing || 0 // Using same price for both min and max since API returns single price
      },
      image: service.image_url || service.image || '/logo-md.png', // Ensure image is always a string
      is_active: service.is_active,
      order: service.order,
      featured: service.featured || false,
      service_type: service.service_type,
      features: service.features || [],
      requirements: service.requirements || [],
      category: service.category,
      subcategory: service.subcategory,
      duration_estimate: service.duration_estimate,
      duration_hours: service.duration_hours || 1,
      pricing: {
        type: service.price_type || 'fixed',
        base_price: service.base_price || service.pricing || 0,
        unit: 'KES'
      },
      estimated_duration: service.duration_estimate,
      seo: service.seo,
      created_at: service.created_at,
      updated_at: service.updated_at,
    }));

    const transformedReviews = recentReviews.map((review: any) => ({
      id: review._id.toString(),
      customer_name: review.customer_name,
      product_id: review.product_id,
      service_id: review.service_id,
      technician_id: review.technician_id,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      verified: review.verified,
      helpful: review.helpful,
    }));

    const homepageData = {
      featured_products: transformedProducts,
      featured_services: transformedServices,
      recent_reviews: transformedReviews,
      stats: {
        total_products: transformedProducts.length,
        total_services: transformedServices.length,
        total_reviews: transformedReviews.length,
      },
    };

    // Cache the data for 1 hour
    await cacheService.cacheHomepageData(homepageData, 3600);

    return NextResponse.json(homepageData);

  } catch (error) {
    console.error('Homepage GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}