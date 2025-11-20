#!/usr/bin/env node
/**
 * Direct MongoDB Atlas Admin Creator (Node.js version)
 * No backend required - connects directly to Atlas
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://baitech:ix5YYaOLtX0r2LTe@cluster0.nmtob1l.mongodb.net/baitekdb?retryWrites=true&w=majority';
const DB_NAME = 'baitekdb';

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createAdmin() {
  log('\n🚀 Baitech Atlas Admin Creator', 'bold');
  log('='.repeat(60), 'bold');

  const client = new MongoClient(MONGO_URI);

  try {
    log('\n📤 Connecting to MongoDB Atlas...', 'blue');
    await client.connect();

    log('✓ Connected successfully!\n', 'green');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Admin credentials
    const adminEmail = 'admin@baitech.co.ke';
    const adminPassword = 'Wincers#1';

    // Check if admin exists
    log(`🔍 Checking for existing admin: ${adminEmail}`, 'blue');
    const existing = await usersCollection.findOne({ email: adminEmail });

    if (existing) {
      log('\n⚠ Admin user already exists!', 'yellow');
      log(`   Name:  ${existing.name}`, 'cyan');
      log(`   Email: ${existing.email}`, 'cyan');
      log(`   Role:  ${existing.role}`, 'cyan');

      // Ensure admin role
      log('\n🔄 Ensuring admin role is set...', 'blue');
      await usersCollection.updateOne(
        { email: adminEmail },
        { $set: { role: 'admin' } }
      );
      log('✓ Admin role confirmed', 'green');
    } else {
      // Create new admin
      log('\n📝 Creating new admin user...', 'blue');

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminData = {
        name: 'Baitech Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+254700000000',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await usersCollection.insertOne(adminData);
      log(`✓ Admin created! ID: ${result.insertedId}`, 'green');
    }

    // Display credentials
    log('\n' + '='.repeat(60), 'bold');
    log('ADMIN LOGIN CREDENTIALS', 'bold');
    log('='.repeat(60), 'bold');
    log(`Email:    ${adminEmail}`, 'cyan');
    log(`Password: ${adminPassword}`, 'cyan');
    log(`Role:     admin`, 'cyan');
    log('\n⚠ IMPORTANT: Change the password after first login!', 'yellow');
    log('\nLogin at: http://localhost:3000/login', 'blue');
    log('='.repeat(60), 'bold');

    // List all admins
    log('\n📋 All Admin Users:', 'blue');
    const admins = await usersCollection.find({ role: 'admin' }).toArray();
    admins.forEach((admin, i) => {
      log(`  ${i + 1}. ${admin.name} - ${admin.email}`, 'cyan');
    });

    log('\n✨ Done!\n', 'green');

  } catch (error) {
    log('\n❌ ERROR:', 'red');
    log('='.repeat(60), 'red');

    if (error.message.includes('authentication failed')) {
      log('Authentication failed. Check your MongoDB credentials.', 'red');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      log('Cannot connect to MongoDB Atlas.', 'red');
      log('\n💡 Check:', 'yellow');
      log('   - Your internet connection', 'yellow');
      log('   - MongoDB Atlas IP whitelist', 'yellow');
      log('   - Firewall settings', 'yellow');
    } else {
      log(error.message, 'red');
    }

    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the script
createAdmin().catch(console.error);
