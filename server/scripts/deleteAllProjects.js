/**
 * Script to delete ALL projects from Firestore
 * 
 * This will delete every project in the database, regardless of who created it.
 * 
 * ⚠️ WARNING: This is IRREVERSIBLE!
 * 
 * Usage: node scripts/deleteAllProjects.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initFirestore, getDb } = require('../config/firestore');

const deleteAllProjects = async () => {
  try {
    console.log('🔍 Initializing Firestore...');
    const db = initFirestore();
    
    if (!db) {
      console.error('❌ Firestore not initialized. Please set GCP_PROJECT_ID in your .env file.');
      process.exit(1);
    }

    console.log('✅ Firestore initialized\n');

    // Check projects collection
    console.log('📋 Checking projects collection...');
    const projectsCollection = db.collection('projects');
    const snapshot = await projectsCollection.get();
    
    const projectCount = snapshot.size;
    console.log(`   Found ${projectCount} project(s)\n`);

    if (projectCount === 0) {
      console.log('✅ No projects found. Database is clean!');
      return;
    }

    // Show project details
    console.log('📊 Projects to be deleted:');
    snapshot.forEach((doc, index) => {
      const project = doc.data();
      console.log(`   ${index + 1}. ${project.name || project.title || 'Untitled'} (ID: ${doc.id})`);
      if (project.applicant) {
        console.log(`      Created by: ${project.applicant}`);
      }
    });

    // Warning
    console.log('\n⚠️  ⚠️  ⚠️  WARNING ⚠️  ⚠️  ⚠️');
    console.log(`This will PERMANENTLY DELETE ${projectCount} project(s)!`);
    console.log('This action CANNOT be undone.');
    console.log('\n⚠️  Press Ctrl+C within 10 seconds to cancel...\n');
    
    // Wait 10 seconds
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r   Starting in ${i} seconds...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n\n🗑️  Starting deletion process...\n');

    // Delete projects in batches
    const batchSize = 500;
    let deleted = 0;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      batchCount++;
      deleted++;

      if (batchCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
        process.stdout.write(`\r   Deleted ${deleted}/${projectCount} projects...`);
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`\r   ✅ Deleted ${deleted} project(s)        \n`);

    // Also delete related notifications
    console.log('🔍 Checking for related notifications...');
    const notificationsCollection = db.collection('notifications');
    const notificationsSnapshot = await notificationsCollection.get();
    
    if (notificationsSnapshot.size > 0) {
      console.log(`   Found ${notificationsSnapshot.size} notification(s)`);
      console.log('   Deleting notifications...');
      
      let notifBatch = db.batch();
      let notifCount = 0;
      let notifDeleted = 0;

      for (const doc of notificationsSnapshot.docs) {
        notifBatch.delete(doc.ref);
        notifCount++;
        notifDeleted++;

        if (notifCount >= batchSize) {
          await notifBatch.commit();
          notifBatch = db.batch();
          notifCount = 0;
        }
      }

      if (notifCount > 0) {
        await notifBatch.commit();
      }

      console.log(`   ✅ Deleted ${notifDeleted} notification(s)\n`);
    } else {
      console.log('   ✅ No notifications found\n');
    }

    console.log('='.repeat(60));
    console.log(`\n✨ Deletion complete!`);
    console.log(`   Projects deleted: ${deleted}`);
    console.log(`   Notifications deleted: ${notificationsSnapshot.size || 0}`);
    console.log('\n🎉 All projects removed. Users can now create fresh projects!\n');

  } catch (error) {
    console.error('\n❌ Error deleting projects:', error);
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      console.error('\n⚠️  Permission denied. Make sure:');
      console.error('   1. Service account has "Cloud Datastore User" or "Cloud Firestore User" role');
      console.error('   2. See server/FIX_PERMISSIONS_NOW.md for detailed instructions');
    }
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  deleteAllProjects()
    .then(() => {
      console.log('\n✨ Script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { deleteAllProjects };

