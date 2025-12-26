/**
 * Comprehensive script to delete ALL demo data from Firestore
 * 
 * This script will delete:
 * - Demo users (users with demo emails or names)
 * - Projects created by demo users
 * - Notifications for demo users
 * 
 * Usage: node scripts/deleteAllDemoData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initFirestore, getDb } = require('../config/firestore');

const DEMO_EMAILS = [
  'user@permiso.dev',
  'reviewer@permiso.dev',
  'admin@permiso.dev',
  'demo@permiso.dev'
];

const deleteAllDemoData = async () => {
  try {
    console.log('🔍 Initializing Firestore...');
    const db = initFirestore();
    
    if (!db) {
      console.error('❌ Firestore not initialized. Please set GCP_PROJECT_ID in your .env file.');
      process.exit(1);
    }

    console.log('✅ Firestore initialized\n');

    // Step 1: Find and delete demo users
    console.log('📋 Step 1: Finding demo users...');
    const usersCollection = db.collection('users');
    const usersSnapshot = await usersCollection.get();
    
    const demoUserIds = [];
    const demoUsers = [];

    if (!usersSnapshot.empty) {
      usersSnapshot.forEach(doc => {
        const user = doc.data();
        const email = user.email?.toLowerCase() || '';
        const name = user.name || '';

        const isDemoEmail = DEMO_EMAILS.includes(email) || 
                           email.includes('@permiso.dev') ||
                           email.includes('demo');
        const isDemoName = /demo/i.test(name);

        if (isDemoEmail || isDemoName) {
          demoUserIds.push(doc.id);
          demoUsers.push({
            id: doc.id,
            email: user.email,
            name: user.name
          });
        }
      });
    }

    console.log(`   Found ${demoUsers.length} demo user(s)`);

    // Step 2: Find and delete projects by demo users
    console.log('\n📋 Step 2: Finding projects by demo users...');
    const projectsCollection = db.collection('projects');
    const projectsSnapshot = await projectsCollection.get();
    
    const projectsToDelete = [];

    if (!projectsSnapshot.empty) {
      projectsSnapshot.forEach(doc => {
        const project = doc.data();
        const applicantId = project.applicant || project.applicantId || '';
        
        if (demoUserIds.includes(applicantId)) {
          projectsToDelete.push({
            id: doc.id,
            name: project.name || project.title || 'Untitled Project',
            applicantId
          });
        }
      });
    }

    console.log(`   Found ${projectsToDelete.length} project(s) by demo users`);

    // Step 3: Find and delete notifications for demo users
    console.log('\n📋 Step 3: Finding notifications for demo users...');
    const notificationsCollection = db.collection('notifications');
    const notificationsSnapshot = await notificationsCollection.get();
    
    const notificationsToDelete = [];

    if (!notificationsSnapshot.empty) {
      notificationsSnapshot.forEach(doc => {
        const notification = doc.data();
        const userId = notification.user || notification.userId || '';
        
        if (demoUserIds.includes(userId)) {
          notificationsToDelete.push(doc.id);
        }
      });
    }

    console.log(`   Found ${notificationsToDelete.length} notification(s) for demo users`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Demo Users: ${demoUsers.length}`);
    console.log(`   - Demo Projects: ${projectsToDelete.length}`);
    console.log(`   - Demo Notifications: ${notificationsToDelete.length}`);
    console.log(`   - Total items to delete: ${demoUsers.length + projectsToDelete.length + notificationsToDelete.length}`);

    if (demoUsers.length === 0 && projectsToDelete.length === 0 && notificationsToDelete.length === 0) {
      console.log('\n✅ No demo data found. Database is clean!');
      return;
    }

    // Confirmation
    console.log('\n⚠️  WARNING: This will permanently delete all demo data!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete in batches
    console.log('\n🗑️  Starting deletion process...\n');

    // Delete notifications first
    if (notificationsToDelete.length > 0) {
      console.log(`   Deleting ${notificationsToDelete.length} notification(s)...`);
      const batch1 = db.batch();
      let count = 0;
      for (const notifId of notificationsToDelete) {
        if (count >= 500) {
          await batch1.commit();
          count = 0;
        }
        batch1.delete(notificationsCollection.doc(notifId));
        count++;
      }
      if (count > 0) await batch1.commit();
      console.log(`   ✅ Deleted ${notificationsToDelete.length} notification(s)`);
    }

    // Delete projects
    if (projectsToDelete.length > 0) {
      console.log(`   Deleting ${projectsToDelete.length} project(s)...`);
      const batch2 = db.batch();
      let count = 0;
      for (const project of projectsToDelete) {
        if (count >= 500) {
          await batch2.commit();
          count = 0;
        }
        batch2.delete(projectsCollection.doc(project.id));
        count++;
      }
      if (count > 0) await batch2.commit();
      console.log(`   ✅ Deleted ${projectsToDelete.length} project(s)`);
    }

    // Delete users last
    if (demoUsers.length > 0) {
      console.log(`   Deleting ${demoUsers.length} user(s)...`);
      const batch3 = db.batch();
      let count = 0;
      for (const user of demoUsers) {
        if (count >= 500) {
          await batch3.commit();
          count = 0;
        }
        batch3.delete(usersCollection.doc(user.id));
        count++;
      }
      if (count > 0) await batch3.commit();
      console.log(`   ✅ Deleted ${demoUsers.length} user(s)`);
    }

    console.log('\n🎉 Database cleanup complete!');
    console.log('   All demo data has been removed.');
    console.log('   Users can now register fresh accounts and start projects from scratch.');

  } catch (error) {
    console.error('❌ Error deleting demo data:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  deleteAllDemoData()
    .then(() => {
      console.log('\n✨ Script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { deleteAllDemoData };

