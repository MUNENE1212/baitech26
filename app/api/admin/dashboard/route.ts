import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../src/lib/auth/middleware';

// GET /api/admin/dashboard - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    return requireAdmin(async (request: NextRequest, user: any) => {
      try {
        // Import dependencies only when needed to avoid startup issues
        const { connectMongoDB } = await import('../../../../src/lib/database/connection');
        const { cacheService } = await import('../../../../src/lib/cache/cache');

        // Get database connection
        const db = await connectMongoDB();

        if (!db) {
          // Return fallback data when database connection fails
          const fallbackStats = {
            overview: {
              total_users: 0,
              total_products: 0,
              total_services: 0,
              total_orders: 0,
              active_services: 0,
              low_stock_products: 0,
              featured_products: 0,
              hot_deal_products: 0
            },
            recent_orders: {
              orders: [],
              total_revenue: 0,
              order_count: 0,
            },
            top_products: [],
            orders_by_status: [],
            sales_summary: {
              total_revenue: 0,
              order_count: 0,
              average_order_value: 0,
            },
            quick_stats: {
              pending_orders: 0,
              completed_orders: 0,
              cancelled_orders: 0,
              total_revenue_7days: 0,
              new_orders_this_week: 0,
            }
          };

          return NextResponse.json({
            success: true,
            data: fallbackStats,
            warning: 'Using fallback data due to database connectivity issues'
          });
        }

        // Get collections
        const usersCollection = db.collection('users');
        const productsCollection = db.collection('products');
        const servicesCollection = db.collection('services');
        const ordersCollection = db.collection('orders');

        // Get total counts
        const [
          totalUsers,
          totalProducts,
          totalServices,
          totalOrders,
        ] = await Promise.all([
          usersCollection.countDocuments({}),
          productsCollection.countDocuments({}),
          servicesCollection.countDocuments({}),
          ordersCollection.countDocuments({}),
        ]);

        // Get active services
        const activeServices = await servicesCollection.countDocuments({
          is_active: true
        });

        // Get low stock products (less than 5)
        const lowStockProducts = await productsCollection.countDocuments({
          is_active: true,
          stock: { $lt: 5 }
        });

        // Get featured products
        const featuredProducts = await productsCollection.countDocuments({
          is_active: true,
          featured: true
        });

        // Get hot deals products
        const hotDealProducts = await productsCollection.countDocuments({
          is_active: true,
          is_hot_deal: true
        });

        // Get recent orders (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrders = await ordersCollection
          .find({
            created_at: { $gte: sevenDaysAgo }
          })
          .sort({ created_at: -1 })
          .limit(10)
          .toArray();

        // Calculate total revenue
        const totalRevenue = recentOrders.reduce((sum: number, order: any) => {
          return sum + (order.total_amount || 0);
        }, 0);

        // Get orders by status
        const ordersByStatus = await ordersCollection.aggregate([
          {
            $match: {
              created_at: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]).toArray();

        // Get top products (most ordered)
        const topProducts = await ordersCollection.aggregate([
          {
            $match: {
              created_at: { $gte: sevenDaysAgo }
            }
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product_id',
              total_quantity: { $sum: '$items.quantity' },
              product_name: { $first: '$items.name' }
            }
          },
          { $sort: { total_quantity: -1 } },
          { $limit: 5 }
        ]).toArray();

        // Construct dashboard data
        const dashboardStats = {
          overview: {
            total_users: totalUsers,
            total_products: totalProducts,
            total_services: totalServices,
            total_orders: totalOrders,
            active_services: activeServices,
            low_stock_products: lowStockProducts,
            featured_products: featuredProducts,
            hot_deal_products: hotDealProducts
          },
          recent_orders: {
            orders: recentOrders,
            total_revenue: totalRevenue,
            order_count: recentOrders.length,
          },
          top_products: topProducts,
          orders_by_status: ordersByStatus,
          sales_summary: {
            total_revenue: totalRevenue,
            order_count: recentOrders.length,
            average_order_value: recentOrders.length > 0 ? totalRevenue / recentOrders.length : 0,
          },
          quick_stats: {
            pending_orders: ordersByStatus.find((item: any) => item._id === 'Processing')?.count || 0,
            completed_orders: ordersByStatus.find((item: any) => item._id === 'Delivered')?.count || 0,
            cancelled_orders: ordersByStatus.find((item: any) => item._id === 'Cancelled')?.count || 0,
            total_revenue_7days: totalRevenue,
            new_orders_this_week: recentOrders.length,
          }
        };

        return NextResponse.json({
          success: true,
          data: dashboardStats,
        });

      } catch (error) {
        console.error('Admin dashboard GET error:', error);

        // Return fallback data when database operations fail
        const fallbackStats = {
          overview: {
            total_users: 0,
            total_products: 0,
            total_services: 0,
            total_orders: 0,
            active_services: 0,
            low_stock_products: 0,
            featured_products: 0,
            hot_deal_products: 0
          },
          recent_orders: {
            orders: [],
            total_revenue: 0,
            order_count: 0,
          },
          top_products: [],
          orders_by_status: [],
          sales_summary: {
            total_revenue: 0,
            order_count: 0,
            average_order_value: 0,
          },
          quick_stats: {
            pending_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            total_revenue_7days: 0,
            new_orders_this_week: 0,
          }
        };

        return NextResponse.json({
          success: true,
          data: fallbackStats,
          warning: 'Using fallback data due to database connectivity issues'
        });
      }
    });
  } catch (error) {
    console.error('Admin dashboard authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}