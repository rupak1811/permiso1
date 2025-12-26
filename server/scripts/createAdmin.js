/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js
 * 
 * This script creates a default admin account if it doesn't exist.
 * Default credentials:
 * - Email: admin@permiso.dev
 * - Password: admin123
 * 
 * You can modify the credentials below or pass them as environment variables.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initFirestore } = require('../config/firestore');
const userService = require('../services/userService');

const DEFAULT_ADMIN = {
  name: 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@permiso.dev',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  role: 'admin'
};

const createAdmin = async () => {
  try {
    console.log('🔍 Initializing Firestore...');
    const db = initFirestore();
    
    if (!db) {
      console.error('❌ Firestore not initialized. Please set GCP_PROJECT_ID in your .env file.');
      process.exit(1);
    }

    console.log('✅ Firestore initialized\n');

    // Check if admin already exists
    console.log(`📋 Checking if admin user exists: ${DEFAULT_ADMIN.email}`);
    const existingAdmin = await userService.findByEmail(DEFAULT_ADMIN.email);
    
    if (existingAdmin) {
      console.log(`✅ Admin user already exists!`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`\n📝 Login Credentials:`);
      console.log(`   Email: ${DEFAULT_ADMIN.email}`);
      console.log(`   Password: ${DEFAULT_ADMIN.password}`);
      return;
    }

    // Create admin user
    console.log(`\n🔨 Creating admin user...`);
    const admin = await userService.create(DEFAULT_ADMIN);
    
    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`\n📝 Login Credentials:`);
    console.log(`   Email: ${DEFAULT_ADMIN.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    console.log(`\n⚠️  IMPORTANT: Change the password after first login!`);
    console.log(`\n🔗 You can now login at: http://localhost:3000/admin/login`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
};

// Run the script
createAdmin()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

