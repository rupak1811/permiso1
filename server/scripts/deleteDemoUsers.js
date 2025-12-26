/**
 * Script to delete all demo users from Firestore
 * 
 * This script will delete users with emails matching demo patterns:
 * - user@permiso.dev
 * - reviewer@permiso.dev
 * - admin@permiso.dev
 * - demo@permiso.dev
 * - Any email containing "demo" or "Demo" in the name
 * 
 * Usage: node scripts/deleteDemoUsers.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initFirestore, getDb } = require('../config/firestore');

const DEMO_EMAILS = [
  'user@permiso.dev',
  'reviewer@permiso.dev',
  'admin@permiso.dev',
  'demo@permiso.dev'
];

const deleteDemoUsers = async () => {
  try {
    console.log('🔍 Initializing Firestore...');
    const db = initFirestore();
    
    if (!db) {
      console.error('❌ Firestore not initialized. Please set GCP_PROJECT_ID in your .env file.');
      process.exit(1);
    }

    console.log('✅ Firestore initialized');
    console.log('🔍 Searching for demo users...');

    const usersCollection = db.collection('users');
    
    // Get all users
    const snapshot = await usersCollection.get();
    
    if (snapshot.empty) {
      console.log('ℹ️  No users found in database.');
      return;
    }

    const usersToDelete = [];
    const demoPatterns = [/demo/i, /Demo/];

    snapshot.forEach(doc => {
      const user = doc.data();
      const email = user.email?.toLowerCase() || '';
      const name = user.name || '';

      // Check if email matches demo patterns
      const isDemoEmail = DEMO_EMAILS.includes(email) || 
                         email.includes('@permiso.dev') ||
                         email.includes('demo');
      
      // Check if name contains "Demo"
      const isDemoName = demoPatterns.some(pattern => pattern.test(name));

      if (isDemoEmail || isDemoName) {
        usersToDelete.push({
          id: doc.id,
          email: user.email,
          name: user.name,
          role: user.role
        });
      }
    });

    if (usersToDelete.length === 0) {
      console.log('✅ No demo users found. Database is clean!');
      return;
    }

    console.log(`\n📋 Found ${usersToDelete.length} demo user(s) to delete:`);
    usersToDelete.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n🗑️  Deleting demo users...');
    
    // Delete users
    const batch = db.batch();
    let deleteCount = 0;

    for (const user of usersToDelete) {
      const userRef = usersCollection.doc(user.id);
      batch.delete(userRef);
      deleteCount++;
    }

    await batch.commit();

    console.log(`\n✅ Successfully deleted ${deleteCount} demo user(s)!`);
    console.log('🎉 Database cleanup complete. Users can now register fresh accounts.');

  } catch (error) {
    console.error('❌ Error deleting demo users:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  deleteDemoUsers()
    .then(() => {
      console.log('\n✨ Script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { deleteDemoUsers };

