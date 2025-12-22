import { NextRequest, NextResponse } from 'next/server';
import { getServicesOfferedCollection, cacheService } from '../../../src/lib/database/connection';
import { requireAdmin } from '../../../src/lib/auth/middleware';

// GET /api/services - Get all active services from services_offered collection
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cachedServices = await cacheService.getCachedServicesOffered();
    if (cachedServices) {
      return NextResponse.json(cachedServices);
    }

    const servicesCollection = await getServicesOfferedCollection();

    // Get active services, sorted by order
    const services = await servicesCollection
      .find({ is_active: true })
      .sort({ order: 1 })
      .toArray();

    // Transform services for API response (matching Python schema and frontend expectations)
    const transformedServices = services.map((service: any) => ({
      id: service._id.toString(),
      service_id: service.service_id,
      name: service.name,
      description: service.description,
      // Match frontend Service interface expectations
      price_range: {
        min: service.pricing?.base_price || service.base_price || service.pricing || 0,
        max: service.pricing?.base_price || service.base_price || service.pricing || 0 // For now using same price for both, can be updated later
      },
      // Additional pricing fields for compatibility
      pricing: service.pricing || {
        type: service.price_type || 'starting_from',
        base_price: service.base_price || service.pricing || 0,
        unit: 'KES'
      },
      category: service.category,
      subcategory: service.subcategory,
      duration_estimate: service.duration_estimate,
      duration_hours: service.duration_hours || 1,
      image: service.image_url || service.image,
      is_active: service.is_active,
      order: service.order || 0,
      featured: service.featured || false,
      service_type: service.service_type,
      features: service.features || [],
      requirements: service.requirements || [],
      estimated_duration: service.duration_estimate,
      seo: service.seo,
      created_at: service.created_at,
      updated_at: service.updated_at,
    }));

    // Cache services for 1 hour
    await cacheService.cacheServicesOffered(transformedServices, 3600);

    return NextResponse.json(transformedServices);

  } catch (error) {
    console.error('Services GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create new service (admin only)
export const POST = requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.service_id) {
      return NextResponse.json(
        { error: 'Name and service_id are required' },
        { status: 400 }
      );
    }

    const servicesCollection = await getServicesOfferedCollection();

    // Check if service_id already exists
    const existingService = await servicesCollection.findOne({
      service_id: body.service_id
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Service ID already exists' },
        { status: 409 }
      );
    }

    // Create new service (matching Python schema)
    const price = parseFloat(body.pricing) || parseFloat(body.base_price) || 0;
    const newService = {
      service_id: body.service_id,
      name: body.name,
      description: body.description || '',
      category: body.category,
      subcategory: body.subcategory || null,
      pricing: {
        type: body.price_type || 'starting_from',
        base_price: price,
        unit: 'KES'
      },
      base_price: price,
      price_range: {
        min: price,
        max: price
      },
      price_type: body.price_type || 'starting_from',
      duration_hours: parseFloat(body.duration_hours) || 1,
      duration_estimate: body.duration_estimate || '',
      image: body.image || '',
      image_url: body.image_url || body.image || '',
      is_active: body.is_active !== undefined ? body.is_active : true,
      order: parseInt(body.order) || 0,
      featured: body.featured || false,
      service_type: body.service_type || 'installation',
      features: body.features || [],
      requirements: body.requirements || [],
      seo: body.seo,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await servicesCollection.insertOne(newService);

    // Clear related caches
    await cacheService.invalidateServiceCaches();

    // Return created service
    const createdService = {
      id: result.insertedId.toString(),
      ...newService,
    };

    return NextResponse.json(createdService);

  } catch (error) {
    console.error('Services POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
});

