const { getDb, toDate, toTimestamp } = require('../config/firestore');

class PermitService {
  constructor() {
    this._db = null;
  }

  _ensureInitialized() {
    if (!this._db) {
      this._db = getDb();
      if (!this._db) {
        throw new Error('Firestore not initialized. Please set GCP_PROJECT_ID environment variable.');
      }
    }
    return this._db;
  }

  get db() {
    return this._ensureInitialized();
  }

  // Get permits collection (top-level collection for all permits)
  getPermitsCollection() {
    const db = this.db;
    if (!db) {
      throw new Error('Firestore not initialized. Please set GCP_PROJECT_ID environment variable.');
    }
    return db.collection('permits');
  }

  // Get permit documents subcollection
  getPermitDocumentsCollection(permitId) {
    return this.getPermitsCollection().doc(permitId).collection('documents');
  }

  // Get permit comments subcollection
  getPermitCommentsCollection(permitId) {
    return this.getPermitsCollection().doc(permitId).collection('comments');
  }

  // Create permit
  async create(permitData) {
    try {
      const permitsCollection = this.getPermitsCollection();
      const permitRef = permitsCollection.doc();
      
      const permit = {
        id: permitRef.id,
        projectId: permitData.projectId,
        projectName: permitData.projectName,
        applicant: permitData.applicant,
        permitType: permitData.permitType, // building, electric, plumber, demolition
        status: permitData.status || 'submitted', // submitted, under_review, request_more_docs, approved, rejected
        location: permitData.location || {},
        address: permitData.address || {},
        permitDescription: permitData.permitDescription || '',
        projectDocuments: permitData.projectDocuments || [], // References to project documents
        selectedDocuments: permitData.selectedDocuments || [], // Document IDs selected for this permit
        reviewer: permitData.reviewer || null,
        reviewComments: permitData.reviewComments || [],
        requestedDocuments: permitData.requestedDocuments || [],
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await permitRef.set(permit);

      // Store selected documents in subcollection
      if (permitData.selectedDocuments && permitData.selectedDocuments.length > 0) {
        const documentsCollection = this.getPermitDocumentsCollection(permitRef.id);
        const batch = this.db.batch();
        
        for (const docId of permitData.selectedDocuments) {
          // Find the document in project documents
          const projectDoc = permitData.projectDocuments.find(d => d.id === docId || d.fileName === docId);
          if (projectDoc) {
            const docRef = documentsCollection.doc();
            batch.set(docRef, {
              id: docRef.id,
              projectDocumentId: docId,
              name: projectDoc.name,
              url: projectDoc.url,
              type: projectDoc.type,
              size: projectDoc.size,
              uploadedAt: projectDoc.uploadedAt || new Date(),
              createdAt: new Date()
            });
          }
        }
        
        await batch.commit();
      }

      return permit;
    } catch (error) {
      console.error('Error creating permit:', error);
      throw error;
    }
  }

  // Find permit by ID
  async findById(id) {
    try {
      const permitDoc = await this.getPermitsCollection().doc(id).get();
      if (!permitDoc.exists) {
        return null;
      }

      const permit = { id: permitDoc.id, ...permitDoc.data() };
      
      // Load documents from subcollection
      try {
        permit.documents = await this.getPermitDocuments(id);
      } catch (docError) {
        console.error(`Error loading documents for permit ${id}:`, docError);
        permit.documents = [];
      }
      
      // Load comments from subcollection
      try {
        permit.comments = await this.getPermitComments(id);
      } catch (commentError) {
        console.error(`Error loading comments for permit ${id}:`, commentError);
        permit.comments = [];
      }
      
      return permit;
    } catch (error) {
      console.error('Error finding permit by ID:', error);
      return null; // Return null instead of throwing to prevent server crash
    }
  }

  // Get permit documents from subcollection
  async getPermitDocuments(permitId) {
    try {
      const documentsSnapshot = await this.getPermitDocumentsCollection(permitId).get();
      return documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting permit documents:', error);
      return [];
    }
  }

  // Get permit comments from subcollection
  async getPermitComments(permitId) {
    try {
      const commentsSnapshot = await this.getPermitCommentsCollection(permitId).get();
      const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort by timestamp descending
      return comments.sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting permit comments:', error);
      return [];
    }
  }

  // Find permits by applicant
  async findByApplicant(applicantId, filters = {}) {
    try {
      const collection = this.getPermitsCollection();
      let query = collection.where('applicant', '==', applicantId);

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.permitType) {
        query = query.where('permitType', '==', filters.permitType);
      }

      let snapshot;
      try {
        snapshot = await query.orderBy('createdAt', 'desc').get();
      } catch (orderByError) {
        // If orderBy fails (missing index), fetch without it
        console.warn('OrderBy failed, fetching without orderBy:', orderByError.message);
        snapshot = await query.get();
      }

      const permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load documents and comments for each permit
      for (const permit of permits) {
        try {
          permit.documents = await this.getPermitDocuments(permit.id);
          permit.comments = await this.getPermitComments(permit.id);
        } catch (docError) {
          console.error(`Error loading documents/comments for permit ${permit.id}:`, docError);
          permit.documents = [];
          permit.comments = [];
        }
      }

      // Sort in memory if needed
      permits.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      return permits;
    } catch (error) {
      console.error('Error finding permits by applicant:', error);
      // Return empty array instead of throwing to prevent server crash
      return [];
    }
  }

  // Find permits by reviewer
  async findByReviewer(reviewerId, filters = {}) {
    try {
      let query = this.getPermitsCollection().where('reviewer', '==', reviewerId);

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      let snapshot;
      try {
        snapshot = await query.orderBy('createdAt', 'desc').get();
      } catch (orderByError) {
        snapshot = await query.get();
      }

      const permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load documents and comments for each permit
      for (const permit of permits) {
        permit.documents = await this.getPermitDocuments(permit.id);
        permit.comments = await this.getPermitComments(permit.id);
      }

      return permits.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error finding permits by reviewer:', error);
      throw error;
    }
  }

  // Find permits by status (for reviewers to see all pending permits)
  async findByStatus(statuses, filters = {}) {
    try {
      const statusArray = Array.isArray(statuses) ? statuses : [statuses];
      const allPermits = [];

      for (const status of statusArray) {
        let query = this.getPermitsCollection().where('status', '==', status);

        if (filters.permitType) {
          query = query.where('permitType', '==', filters.permitType);
        }

        const snapshot = await query.get();
        const permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load documents and comments for each permit
        for (const permit of permits) {
          permit.documents = await this.getPermitDocuments(permit.id);
          permit.comments = await this.getPermitComments(permit.id);
        }

        allPermits.push(...permits);
      }

      // Remove duplicates and sort
      const uniquePermits = allPermits.filter((permit, index, self) =>
        index === self.findIndex(p => p.id === permit.id)
      );

      return uniquePermits.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error finding permits by status:', error);
      throw error;
    }
  }

  // Find all permits (for admins)
  async findAll(filters = {}) {
    try {
      let query = this.getPermitsCollection();

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.permitType) {
        query = query.where('permitType', '==', filters.permitType);
      }

      let snapshot;
      try {
        snapshot = await query.orderBy('createdAt', 'desc').get();
      } catch (orderByError) {
        snapshot = await query.get();
      }

      const permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Load documents and comments for each permit
      for (const permit of permits) {
        permit.documents = await this.getPermitDocuments(permit.id);
        permit.comments = await this.getPermitComments(permit.id);
      }

      return permits.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error finding all permits:', error);
      throw error;
    }
  }

  // Update permit
  async update(id, updateData) {
    try {
      updateData.updatedAt = new Date();
      await this.getPermitsCollection().doc(id).update(updateData);
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating permit:', error);
      throw error;
    }
  }

  // Add comment to permit
  async addComment(permitId, commentData) {
    try {
      const commentsCollection = this.getPermitCommentsCollection(permitId);
      const commentRef = commentsCollection.doc();
      
      const comment = {
        id: commentRef.id,
        ...commentData,
        timestamp: new Date(),
        createdAt: new Date()
      };

      await commentRef.set(comment);
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Update permit status with action
  async updateStatus(permitId, status, actionData = {}) {
    try {
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'request_more_docs') {
        updateData.requestedDocuments = actionData.requestedDocuments || [];
        updateData.requestMoreDocsComment = actionData.comment || '';
      } else if (status === 'rejected') {
        updateData.rejectionComment = actionData.comment || '';
      } else if (status === 'approved') {
        updateData.approvalComment = actionData.comment || '';
        updateData.approvedAt = new Date();
        updateData.reviewer = actionData.reviewer || null;
      }

      if (actionData.reviewer) {
        updateData.reviewer = actionData.reviewer;
      }

      await this.getPermitsCollection().doc(permitId).update(updateData);
      return await this.findById(permitId);
    } catch (error) {
      console.error('Error updating permit status:', error);
      throw error;
    }
  }
}

module.exports = new PermitService();

