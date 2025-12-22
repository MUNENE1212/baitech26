import { NextRequest, NextResponse } from 'next/server';
import { getServicesOfferedCollection, cacheService } from '../../../../src/lib/database/connection';
import { requireAdmin } from '../../../../src/lib/auth/middleware';

// PUT /api/services/[id] - Update existing service (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest, user: any) => {
    try {
      const { id: serviceId } = await params;
      const body = await req.json();

      // Basic validation
      if (!body.name || !body.service_id) {
        return NextResponse.json(
          { error: 'Name and service_id are required' },
          { status: 400 }
        );
      }

      const servicesCollection = await getServicesOfferedCollection();

      // Find service by either _id or service_id
      const { ObjectId } = await import('mongodb');
      const query = ObjectId.isValid(serviceId)
        ? { _id: new ObjectId(serviceId) }
        : { service_id: serviceId };

      const existingService = await servicesCollection.findOne(query);

      if (!existingService) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      // If updating service_id, check for conflicts
      if (body.service_id !== existingService.service_id) {
        const duplicateService = await servicesCollection.findOne({
          service_id: body.service_id,
          _id: { $ne: existingService._id }
        });

        if (duplicateService) {
          return NextResponse.json(
            { error: 'Service ID already exists' },
            { status: 409 }
          );
        }
      }

      // Update service (matching Python schema)
      const price = parseFloat(body.pricing) || parseFloat(body.base_price) || existingService.pricing?.base_price || 0;
      const updatedService = {
        service_id: body.service_id,
        name: body.name,
        description: body.description || existingService.description,
        category: body.category || existingService.category,
        subcategory: body.subcategory || existingService.subcategory,
        pricing: {
          type: body.price_type || existingService.pricing?.type || 'starting_from',
          base_price: price,
          unit: 'KES'
        },
        base_price: price,
        price_range: {
          min: price,
          max: price
        },
        price_type: body.price_type || existingService.pricing?.type || 'starting_from',
        duration_hours: parseFloat(body.duration_hours) || existingService.duration_hours,
        duration_estimate: body.duration_estimate || existingService.duration_estimate,
        image: body.image || existingService.image,
        image_url: body.image_url || body.image || existingService.image_url,
        is_active: body.is_active !== undefined ? body.is_active : existingService.is_active,
        order: parseInt(body.order) || existingService.order,
        featured: body.featured || existingService.featured,
        service_type: body.service_type || existingService.service_type,
        features: body.features || existingService.features,
        requirements: body.requirements || existingService.requirements,
        seo: body.seo || existingService.seo,
        updated_at: new Date(),
      };

      const result = await servicesCollection.updateOne(
        query,
        { $set: updatedService }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      // Clear related caches
      await cacheService.invalidateServiceCaches();

      // Return updated service
      const responseService = {
        id: existingService._id.toString(),
        service_id: updatedService.service_id,
        ...updatedService,
      };

      return NextResponse.json(responseService);

    } catch (error) {
      console.error('Services PUT error:', error);
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE /api/services/[id] - Delete service (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (req: NextRequest, user: any) => {
    try {
      const { id: serviceId } = await params;

      const servicesCollection = await getServicesOfferedCollection();

      // Find service by either _id or service_id
      const { ObjectId } = await import('mongodb');
      const query = ObjectId.isValid(serviceId)
        ? { _id: new ObjectId(serviceId) }
        : { service_id: serviceId };

      const existingService = await servicesCollection.findOne(query);

      if (!existingService) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      // Soft delete by setting is_active to false
      const result = await servicesCollection.updateOne(
        query,
        {
          $set: {
            is_active: false,
            updated_at: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      // Clear related caches
      await cacheService.invalidateServiceCaches();

      return NextResponse.json(
        { success: true, message: 'Service deleted successfully' }
      );

    } catch (error) {
      console.error('Services DELETE error:', error);
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 }
      );
    }
  })(request);
}