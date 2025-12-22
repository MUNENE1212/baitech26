import { NextRequest, NextResponse } from 'next/server';
import { getOrdersCollection } from '../../../../src/lib/database/connection';
import { ObjectId } from 'mongodb';

import { requireAdmin } from '../../../../src/lib/auth/middleware';

// GET /api/orders/[id] - Get specific order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const ordersCollection = await getOrdersCollection();

    // Try to find by ObjectId first (if it's a MongoDB ID)
    let order;
    try {
      order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    } catch {
      // If ObjectId fails, try as order number
      order = await ordersCollection.findOne({ order_number: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const transformedOrder = {
      id: order._id.toString(),
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_contact: order.customer_contact,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      shipping_address: order.shipping_address || {},
      service_note: order.service_note,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder,
    });

  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
  })(request);
}

// PUT /api/orders/[id]/status - Update order status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAdmin(async (request: NextRequest, user: any) => {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Validation for order status
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(body.order_status)) {
      return NextResponse.json(
        { success: false, error: 'Valid order status is required' },
        { status: 400 }
      );
    }

    const ordersCollection = await getOrdersCollection();

    // Find order
    let order;
    try {
      order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    } catch {
      order = await ordersCollection.findOne({ order_number: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status and add to history
    const statusUpdate: any = {
      order_status: body.order_status,
      updated_at: new Date(),
      status_history: [
        ...(order.status_history || []),
        {
          status: body.order_status,
          timestamp: new Date(),
          note: body.note || '',
          updated_by: user.user_id || 'admin'
        }
      ]
    };

    // Add tracking number if provided
    if (body.tracking_number) {
      statusUpdate.tracking_number = body.tracking_number;
    }

    // Add shipping details if provided
    if (body.estimated_delivery) {
      statusUpdate.estimated_delivery = new Date(body.estimated_delivery);
    }

    const result = await ordersCollection.updateOne(
      { _id: order._id },
      { $set: statusUpdate }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        id: order._id.toString(),
        order_number: order.order_number,
        order_status: body.order_status,
        updated_at: new Date()
      }
    });

  } catch (error) {
    console.error('Order status PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
  })(request);
}