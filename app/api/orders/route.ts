import { NextRequest, NextResponse } from 'next/server';
import { getOrdersCollection, getProductsCollection } from '../../../src/lib/database/connection';
import { OrderCreateRequest, OrderItemDocument, OrderDocument } from '../../../src/types';
import { requireAuth } from '../../../src/lib/auth/middleware';

// Validation schemas
const orderCreateSchema = {
  customer_name: (data: string) => typeof data === 'string' && data.length >= 1,
  customer_contact: (data: string) => typeof data === 'string' && data.length >= 10,
  items: (data: OrderItemDocument[]) => Array.isArray(data) && data.length >= 1,
  payment_method: (data: string) => ['mpesa', 'cash', 'card'].includes(data),
  shipping_address: (data: { address: string; city: string }) => typeof data === 'object' && data.address && data.city,
  service_note: (data: string) => typeof data === 'string',
};


// Helper function to generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!orderCreateSchema.customer_name(body.customer_name)) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!orderCreateSchema.customer_contact(body.customer_contact)) {
      return NextResponse.json(
        { success: false, error: 'Valid customer contact is required' },
        { status: 400 }
      );
    }

    if (!orderCreateSchema.items(body.items)) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required' },
        { status: 400 }
      );
    }

    if (!orderCreateSchema.payment_method(body.payment_method)) {
      return NextResponse.json(
        { success: false, error: 'Valid payment method is required' },
        { status: 400 }
      );
    }

    const ordersCollection = await getOrdersCollection();
    const productsCollection = await getProductsCollection();

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of body.items) {
      // Get product to verify price and stock
      const product = await productsCollection.findOne({
        product_id: item.product_id,
        is_active: true
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${item.product_id}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        image: product.images?.[0] || ''
      });
    }

    // Calculate shipping and tax (simplified)
    const shipping = 300; // Fixed shipping fee
    const tax = subtotal * 0.16; // 16% VAT
    const total = subtotal + shipping + tax;

    // Create order
    const orderNumber = generateOrderNumber();
    const newOrder = {
      order_number: orderNumber,
      customer_name: body.customer_name,
      customer_contact: body.customer_contact,
      items: orderItems,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
      payment_method: body.payment_method,
      payment_status: 'pending',
      order_status: 'processing',
      shipping_address: body.shipping_address || {},
      service_note: body.service_note || '',
      created_at: new Date(),
      updated_at: new Date(),
      status_history: [
        {
          status: 'processing',
          timestamp: new Date(),
          note: 'Order created and is being processed',
          updated_by: 'system'
        }
      ]
    };

    const result = await ordersCollection.insertOne(newOrder);

    // Update product stock
    for (const item of body.items) {
      await productsCollection.updateOne(
        { product_id: item.product_id },
        { $inc: { stock: -item.quantity } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: result.insertedId.toString(),
        ...newOrder
      }
    });

  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get all orders with pagination (admin or owner only)
export async function GET(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const customer_contact = searchParams.get('customer_contact');

    const ordersCollection = await getOrdersCollection();

    // Build query
    const query: Record<string, unknown> = {};

    // If not admin, only show user's own orders
    if (user.role !== 'admin') {
      query.customer_contact = user.email; // Assuming email is used as customer contact
    } else {
      // Admin can filter by status and customer contact
      if (status) {
        query.order_status = status;
      }

      if (customer_contact) {
        query.customer_contact = { $regex: customer_contact, $options: 'i' };
      }
    }

    // Count total orders for pagination
    const total = await ordersCollection.countDocuments(query);

    // Get orders with pagination
    const skip = (page - 1) * limit;
    const orders = await ordersCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform orders for API response
    const transformedOrders = orders.map((order) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_orders: total,
        orders_per_page: limit,
        has_next: skip + limit < total,
        has_prev: page > 1,
      },
    });

    } catch (error) {
      console.error('Orders GET error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }
  });
}