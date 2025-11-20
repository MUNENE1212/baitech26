#!/usr/bin/env node

/**
 * Simple Admin Seeder (No TypeScript required)
 *
 * Usage: node scripts/seed-admin-simple.js
 */

const readline = require('readline')

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function getAdminCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  log('\n🔐 Admin User Setup', 'bold')
  log('==================\n', 'bold')

  const name = await question(rl, `${colors.cyan}Admin Name:${colors.reset} `)
  const email = await question(rl, `${colors.cyan}Admin Email:${colors.reset} `)
  const password = await question(rl, `${colors.cyan}Admin Password:${colors.reset} `)
  const confirmPassword = await question(rl, `${colors.cyan}Confirm Password:${colors.reset} `)
  const phone = await question(rl, `${colors.cyan}Admin Phone:${colors.reset} `)

  rl.close()

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match!')
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long!')
  }

  if (!email.includes('@')) {
    throw new Error('Invalid email format!')
  }

  return { name, email, password, phone }
}

async function seedAdmin(credentials) {
  log('\n📤 Sending request to backend...', 'blue')
  log(`API URL: ${API_URL}/api/v1/auth/register\n`, 'blue')

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...credentials,
        role: 'admin'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    log('\n✅ SUCCESS!', 'green')
    log('==========\n', 'green')
    log(`Admin user created successfully!`, 'green')
    log(`\nAdmin Details:`, 'bold')
    log(`  Name:  ${credentials.name}`, 'cyan')
    log(`  Email: ${credentials.email}`, 'cyan')
    log(`  Phone: ${credentials.phone}`, 'cyan')
    log(`  Role:  admin`, 'cyan')

    if (data.token) {
      log(`\n🔑 Access Token:`, 'yellow')
      log(`${data.token}`, 'yellow')
      log(`\n💡 Save this token - you'll need it for admin operations!`, 'yellow')
    }

    log('\n🎉 You can now log in to the admin panel!', 'green')
    log(`   URL: http://localhost:3000/admin\n`, 'blue')

  } catch (error) {
    log('\n❌ ERROR!', 'red')
    log('=========\n', 'red')

    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      log('Admin user already exists with this email.', 'red')
      log('\n💡 Try logging in instead, or use a different email.', 'yellow')
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      log('Cannot connect to the backend server.', 'red')
      log('\n💡 Make sure your backend is running and accessible at:', 'yellow')
      log(`   ${API_URL}`, 'yellow')
    } else {
      log(`Failed to create admin user: ${error.message}`, 'red')
    }

    throw error
  }
}

async function main() {
  try {
    log('\n🚀 Baitech Admin User Seeder', 'bold')
    log('============================\n', 'bold')
    log('This script will create an admin user in your database.\n', 'cyan')

    const credentials = await getAdminCredentials()

    log('\n📋 Review Admin Details:', 'yellow')
    log('========================\n', 'yellow')
    log(`  Name:  ${credentials.name}`)
    log(`  Email: ${credentials.email}`)
    log(`  Phone: ${credentials.phone}`)
    log(`  Role:  admin\n`)

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const confirm = await question(rl, `${colors.yellow}Proceed with creating this admin user? (yes/no):${colors.reset} `)
    rl.close()

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      log('\n❌ Operation cancelled.', 'red')
      process.exit(0)
    }

    await seedAdmin(credentials)

    log('\n✨ Done!\n', 'green')
    process.exit(0)

  } catch (error) {
    if (error.message !== 'Operation cancelled') {
      log(`\n💥 Error: ${error.message}\n`, 'red')
    }
    process.exit(1)
  }
}

// Run the script
main()
