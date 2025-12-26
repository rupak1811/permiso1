const { getDb, toDate, toTimestamp } = require('../config/firestore');
const bcrypt = require('bcryptjs');

const COLLECTION_NAME = 'users';

class UserService {
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

  // Create user
  async create(userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const userRef = this.collection.doc();
      const user = {
        id: userRef.id,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        role: userData.role || 'user',
        preferences: {
          language: userData.preferences?.language || 'en',
          notifications: {
            email: userData.preferences?.notifications?.email !== undefined ? userData.preferences.notifications.email : true,
            push: userData.preferences?.notifications?.push !== undefined ? userData.preferences.notifications.push : true
          }
        }
      };

      await userRef.set(user);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      const user = { id: doc.id, ...doc.data() };
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      const snapshot = await this.collection
        .where('email', '==', email.toLowerCase().trim())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const user = { id: doc.id, ...doc.data() };
      return user; // Include password for authentication
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Update user
  async update(id, updateData) {
    try {
      // Hash password if being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      updateData.updatedAt = new Date();
      await this.collection.doc(id).update(updateData);
      
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Find all users (with optional filters)
  async findAll(filters = {}) {
    try {
      let query = this.collection;

      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }

      if (filters.isActive !== undefined) {
        query = query.where('isActive', '==', filters.isActive);
      }

      const snapshot = await query.get();
      const users = snapshot.docs.map(doc => {
        const user = { id: doc.id, ...doc.data() };
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return users;
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  // Compare password
  async comparePassword(user, candidatePassword) {
    if (!user.password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, user.password);
  }

  // Update last login
  async updateLastLogin(id) {
    try {
      await this.collection.doc(id).update({
        lastLogin: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
}

// Export singleton instance - will initialize lazily when first used
module.exports = new UserService();

