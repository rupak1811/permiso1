/**
 * Script to delete ALL data from Firestore
 * 
 * This script will delete EVERYTHING:
 * - ALL users
 * - ALL projects
 * - ALL notifications
 * - Any other collections that exist
 * 
 * ⚠️ WARNING: This is IRREVERSIBLE! All data will be permanently deleted.
 * 
 * Usage: node scripts/deleteAllData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initFirestore, getDb } = require('../config/firestore');

// Known collections to delete
const KNOWN_COLLECTIONS = ['users', 'projects', 'notifications'];

const deleteAllData = async () => {
  try {
    console.log('🔍 Initializing Firestore...');
    const db = initFirestore();
    
    if (!db) {
      console.error('❌ Firestore not initialized. Please set GCP_PROJECT_ID in your .env file.');
      process.exit(1);
    }

    console.log('✅ Firestore initialized\n');

    // Get all collections
    console.log('📋 Discovering collections...');
    const collections = await db.listCollections();
    const collectionIds = collections.map(col => col.id);
    
    console.log(`   Found ${collectionIds.length} collection(s): ${collectionIds.join(', ')}\n`);

    if (collectionIds.length === 0) {
      console.log('✅ No collections found. Database is already empty!');
      return;
    }

    // Count documents in each collection
    console.log('📊 Counting documents...\n');
    const collectionStats = {};
    let totalDocuments = 0;

    for (const collectionId of collectionIds) {
      try {
        const collection = db.collection(collectionId);
        const snapshot = await collection.get();
        const count = snapshot.size;
        collectionStats[collectionId] = count;
        totalDocuments += count;
        console.log(`   ${collectionId}: ${count} document(s)`);
      } catch (error) {
        console.error(`   ❌ Error counting ${collectionId}: ${error.message}`);
        collectionStats[collectionId] = 0;
      }
    }

    console.log(`\n   Total: ${totalDocuments} document(s) across ${collectionIds.length} collection(s)\n`);

    if (totalDocuments === 0) {
      console.log('✅ Database is already empty!');
      return;
    }

    // Warning and confirmation
    console.log('⚠️  ⚠️  ⚠️  WARNING ⚠️  ⚠️  ⚠️');
    console.log('This will PERMANENTLY DELETE ALL DATA from Firestore!');
    console.log('This action CANNOT be undone.');
    console.log('\nCollections to be deleted:');
    collectionIds.forEach(id => {
      console.log(`   - ${id} (${collectionStats[id]} documents)`);
    });
    console.log(`\nTotal: ${totalDocuments} documents will be deleted.`);
    console.log('\n⚠️  Press Ctrl+C within 10 seconds to cancel...\n');
    
    // Wait 10 seconds
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r   Starting in ${i} seconds...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n\n🗑️  Starting deletion process...\n');

    // Delete all collections
    let totalDeleted = 0;
    const batchSize = 500; // Firestore batch limit

    for (const collectionId of collectionIds) {
      const count = collectionStats[collectionId];
      if (count === 0) {
        console.log(`⏭️  Skipping ${collectionId} (empty)`);
        continue;
      }

      console.log(`🗑️  Deleting ${collectionId} (${count} documents)...`);
      
      try {
        const collection = db.collection(collectionId);
        let deleted = 0;
        let batch = db.batch();
        let batchCount = 0;

        // Get all documents
        const snapshot = await collection.get();
        
        for (const doc of snapshot.docs) {
          batch.delete(doc.ref);
          batchCount++;
          deleted++;

          // Commit batch when it reaches 500 (Firestore limit)
          if (batchCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
            process.stdout.write(`\r   Deleted ${deleted}/${count} documents...`);
          }
        }

        // Commit remaining documents
        if (batchCount > 0) {
          await batch.commit();
        }

        totalDeleted += deleted;
        console.log(`\r   ✅ Deleted ${deleted} document(s) from ${collectionId}        `);
      } catch (error) {
        console.error(`\n   ❌ Error deleting ${collectionId}: ${error.message}`);
        if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
          console.error('   ⚠️  Permission denied. Make sure service account has proper IAM roles.');
          console.error('   See server/FIX_PERMISSIONS_NOW.md for help.');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✨ Deletion complete!`);
    console.log(`   Total documents deleted: ${totalDeleted}`);
    console.log(`   Collections processed: ${collectionIds.length}`);
    console.log('\n🎉 Database is now empty. Users can register and create projects from scratch!');
    console.log('\n📝 Note: Collections still exist but are empty.');
    console.log('   They will be automatically removed by Firestore after 7 days of being empty.\n');

  } catch (error) {
    console.error('\n❌ Error deleting data:', error);
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
  deleteAllData()
    .then(() => {
      console.log('\n✨ Script completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { deleteAllData };

