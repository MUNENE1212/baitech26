#!/usr/bin/env node

/**
 * Database migration script for Next.js application
 * Creates necessary indexes and ensures database structure
 */

import { connectMongoDB, getUsersCollection, getProductsCollection, getServicesCollection, getOrdersCollection } from '../lib/database/connection';

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');

    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ Connected to MongoDB');

    // Get collections
    const usersCollection = await getUsersCollection();
    const productsCollection = await getProductsCollection();
    const servicesCollection = await getServicesCollection();
    const ordersCollection = await getOrdersCollection();

    // Create indexes for users collection
    console.log('📊 Creating indexes for users collection...');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ isActive: 1 });
    await usersCollection.createIndex({ created_at: -1 });

    // Create indexes for products collection
    console.log('📊 Creating indexes for products collection...');
    await productsCollection.createIndex({ product_id: 1 }, { unique: true });
    await productsCollection.createIndex({ category: 1, subcategory: 1 });
    await productsCollection.createIndex({ name: 'text', description: 'text' });
    await productsCollection.createIndex({ featured: 1 });
    await productsCollection.createIndex({ price: 1 });
    await productsCollection.createIndex({ is_active: 1 });
    await productsCollection.createIndex({ created_at: -1 });

    // Create indexes for services collection
    console.log('📊 Creating indexes for services collection...');
    await servicesCollection.createIndex({ service_id: 1 });
    await servicesCollection.createIndex({ status: 1 });
    await servicesCollection.createIndex({ customer_contact: 1 });
    await servicesCollection.createIndex({ assigned_technician: 1 });
    await servicesCollection.createIndex({ request_date: -1 });

    // Create indexes for orders collection
    console.log('📊 Creating indexes for orders collection...');
    await ordersCollection.createIndex({ order_number: 1 }, { unique: true });
    await ordersCollection.createIndex({ customer_contact: 1 });
    await ordersCollection.createIndex({ order_status: 1 });
    await ordersCollection.createIndex({ payment_status: 1 });
    await ordersCollection.createIndex({ order_date: -1 });

    // Create additional collections and indexes if they don't exist
    const db = await connectMongoDB();

    // Services offered collection
    console.log('📊 Creating indexes for services_offered collection...');
    await db.collection('services_offered').createIndex({ service_id: 1 }, { unique: true });
    await db.collection('services_offered').createIndex({ is_active: 1 });
    await db.collection('services_offered').createIndex({ order: 1 });

    // Reviews collection
    console.log('📊 Creating indexes for reviews collection...');
    await db.collection('reviews').createIndex({ date: -1 });
    await db.collection('reviews').createIndex({ rating: 1 });
    await db.collection('reviews').createIndex({ product_id: 1 });
    await db.collection('reviews').createIndex({ service_id: 1 });
    await db.collection('reviews').createIndex({ technician_id: 1 });

    // Technicians collection
    console.log('📊 Creating indexes for technicians collection...');
    await db.collection('technicians').createIndex({ email: 1 }, { unique: true });
    await db.collection('technicians').createIndex({ specializations: 1 });
    await db.collection('technicians').createIndex({ jobs_completed: -1 });
    await db.collection('technicians').createIndex({ average_rating: -1 });
    await db.collection('technicians').createIndex({ is_active: 1 });

    // Technician applications collection
    console.log('📊 Creating indexes for technician_applications collection...');
    await db.collection('technician_applications').createIndex({ email: 1 });
    await db.collection('technician_applications').createIndex({ status: 1 });
    await db.collection('technician_applications').createIndex({ applied_at: -1 });

    console.log('✅ Database migration completed successfully!');
    console.log('\n📈 Summary of created indexes:');
    console.log('  • Users: email (unique), role, isActive, created_at');
    console.log('  • Products: product_id (unique), category+subcategory, text search, featured, price, is_active, created_at');
    console.log('  • Services: service_id, status, customer_contact, assigned_technician, request_date');
    console.log('  • Orders: order_number (unique), customer_contact, order_status, payment_status, order_date');
    console.log('  • Services Offered: service_id (unique), is_active, order');
    console.log('  • Reviews: date, rating, product_id, service_id, technician_id');
    console.log('  • Technicians: email (unique), specializations, jobs_completed, average_rating, is_active');
    console.log('  • Technician Applications: email, status, applied_at');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

export { migrate };