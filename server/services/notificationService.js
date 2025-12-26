const { getDb, toDate, toTimestamp } = require('../config/firestore');

const COLLECTION_NAME = 'notifications';

class NotificationService {
  constructor() {
    // Don't initialize immediately - will be initialized lazily
    this._db = null;
    this._collection = null;
  }

  // Lazy initialization of database connection
  _ensureInitialized() {
    if (!this._db) {
      this._db = getDb();
      if (!this._db) {
        throw new Error('Firestore not initialized. Please set GCP_PROJECT_ID environment variable.');
      }
      this._collection = this._db.collection(COLLECTION_NAME);
    }
    return this._collection;
  }

  get collection() {
    return this._ensureInitialized();
  }

  // Create notification
  async create(notificationData) {
    try {
      const notificationRef = this.collection.doc();
      const notification = {
        id: notificationRef.id,
        ...notificationData,
        isRead: notificationData.isRead || false,
        priority: notificationData.priority || 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await notificationRef.set(notification);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Find notification by ID
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error finding notification by ID:', error);
      throw error;
    }
  }

  // Find notifications by user
  async findByUser(userId, filters = {}) {
    try {
      let query = this.collection.where('user', '==', userId);

      if (filters.isRead !== undefined) {
        query = query.where('isRead', '==', filters.isRead);
      }

      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error finding notifications by user:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      await this.collection.doc(id).update({
        isRead: true,
        updatedAt: new Date()
      });
      return await this.findById(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId) {
    try {
      const snapshot = await this.collection
        .where('user', '==', userId)
        .where('isRead', '==', false)
        .get();

      this._ensureInitialized(); // Ensure DB is initialized
      const batch = this._db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isRead: true,
          updatedAt: new Date()
        });
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    try {
      const snapshot = await this.collection
        .where('user', '==', userId)
        .where('isRead', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();

