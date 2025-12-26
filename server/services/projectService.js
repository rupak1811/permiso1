const { getDb, toDate, toTimestamp } = require('../config/firestore');

class ProjectService {
  constructor() {
    // Don't initialize immediately - will be initialized lazily
    this._db = null;
  }

  // Lazy initialization of database connection
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

  // Get projects subcollection for a user
  getProjectsCollection(userId) {
    return this.db.collection('users').doc(userId).collection('projects');
  }

  // Get documents subcollection for a project
  getDocumentsCollection(userId, projectId) {
    return this.db.collection('users').doc(userId).collection('projects').doc(projectId).collection('documents');
  }

  // Create project in users/{userId}/projects subcollection
  async create(projectData) {
    try {
      const applicantId = projectData.applicant;
      if (!applicantId) {
        throw new Error('Applicant ID is required');
      }

      const projectsCollection = this.getProjectsCollection(applicantId);
      const projectRef = projectsCollection.doc();
      const projectStatus = projectData.status || 'draft';
      
      const project = {
        id: projectRef.id,
        applicant: applicantId,
        title: projectData.title,
        description: projectData.description || '',
        type: projectData.type,
        status: projectStatus,
        priority: projectData.priority || 'medium',
        estimatedCost: projectData.estimatedCost || 0,
        estimatedTimeline: projectData.estimatedTimeline || 0,
        actualCost: projectData.actualCost || 0,
        actualTimeline: projectData.actualTimeline || 0,
        paymentStatus: projectData.paymentStatus || 'pending',
        location: projectData.location || {},
        reviewer: projectData.reviewer || null,
        forms: projectData.forms || [],
        reviewComments: projectData.reviewComments || [],
        aiAnalysis: projectData.aiAnalysis || null,
        submittedAt: projectData.submittedAt || (projectStatus === 'submitted' ? new Date() : null),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await projectRef.set(project);
      console.log(`[Project Created] Stored in users/${applicantId}/projects/${projectRef.id}, Status: ${projectStatus}`);

      // Store documents in subcollection: users/{userId}/projects/{projectId}/documents
      if (projectData.documents && projectData.documents.length > 0) {
        const documentsCollection = this.getDocumentsCollection(applicantId, projectRef.id);
        const batch = this.db.batch();
        
        for (const doc of projectData.documents) {
          const docRef = documentsCollection.doc();
          batch.set(docRef, {
            id: docRef.id,
            name: doc.name,
            url: doc.url,
            type: doc.type,
            size: doc.size,
            isVerified: doc.isVerified || false,
            verifiedAt: doc.verifiedAt || null,
            verifiedBy: doc.verifiedBy || null,
            uploadedAt: doc.uploadedAt || new Date(),
            createdAt: new Date()
          });
        }
        
        await batch.commit();
      }

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Find project by ID (searches across all users)
  async findById(id, applicantId = null) {
    try {
      // If applicantId is provided, search directly
      if (applicantId) {
        const projectDoc = await this.getProjectsCollection(applicantId).doc(id).get();
        if (projectDoc.exists) {
          const project = { id: projectDoc.id, ...projectDoc.data() };
          // Load documents from subcollection
          project.documents = await this.getProjectDocuments(applicantId, id);
          return project;
        }
        return null;
      }

      // Otherwise, search across all users (for reviewers/admins)
      const usersSnapshot = await this.db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const projectDoc = await this.getProjectsCollection(userId).doc(id).get();
        if (projectDoc.exists) {
          const project = { id: projectDoc.id, ...projectDoc.data() };
          // Load documents from subcollection
          project.documents = await this.getProjectDocuments(userId, id);
          return project;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding project by ID:', error);
      throw error;
    }
  }

  // Get documents for a project from subcollection
  async getProjectDocuments(userId, projectId) {
    try {
      const documentsSnapshot = await this.getDocumentsCollection(userId, projectId).get();
      return documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting project documents:', error);
      return [];
    }
  }

  // Find projects by applicant (from users/{userId}/projects)
  async findByApplicant(applicantId, filters = {}) {
    try {
      let query = this.getProjectsCollection(applicantId);

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      let snapshot;
      try {
        // Try with orderBy first, but fallback if index is missing
        snapshot = await query.orderBy('createdAt', 'desc').get();
      } catch (orderByError) {
        // If orderBy fails (missing index), fetch without it and sort in memory
        console.warn(`OrderBy failed for applicant ${applicantId}, fetching without orderBy:`, orderByError.message);
        snapshot = await query.get();
      }
      
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load documents for each project
      for (const project of projects) {
        project.documents = await this.getProjectDocuments(applicantId, project.id);
      }
      
      // Sort in memory if orderBy wasn't used (check if query has orderBy)
      if (snapshot.docs.length > 0) {
        // Always sort in memory to ensure consistent ordering
        projects.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      }
      
      return projects;
    } catch (error) {
      console.error('Error finding projects by applicant:', error);
      throw error;
    }
  }

  // Find projects by reviewer (searches across all users)
  async findByReviewer(reviewerId, filters = {}) {
    try {
      const allProjects = [];
      const usersSnapshot = await this.db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        let query = this.getProjectsCollection(userId).where('reviewer', '==', reviewerId);
        
        if (filters.status) {
          query = query.where('status', '==', filters.status);
        }
        
        try {
          // Don't use orderBy to avoid index requirement - we'll sort in memory
          const snapshot = await query.get();
          const projects = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            _applicantId: userId // Store userId for applicant population
          }));
          
          // Load documents for each project
          for (const project of projects) {
            project.documents = await this.getProjectDocuments(userId, project.id);
          }
          
          allProjects.push(...projects);
        } catch (err) {
          console.error(`Error querying projects for user ${userId}:`, err);
        }
      }
      
      // Sort by createdAt descending in memory
      return allProjects.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error finding projects by reviewer:', error);
      throw error;
    }
  }

  // Find projects by status (searches across all users for reviewers)
  async findByStatus(statuses, filters = {}) {
    try {
      // If statuses is a single string, convert to array
      const statusArray = Array.isArray(statuses) ? statuses : [statuses];
      const allProjects = [];
      const usersSnapshot = await this.db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        
        for (const status of statusArray) {
          try {
            let query = this.getProjectsCollection(userId).where('status', '==', status);
            
            if (filters.type) {
              query = query.where('type', '==', filters.type);
            }
            
            // Don't use orderBy to avoid index requirement - we'll sort in memory
            const snapshot = await query.get();
            console.log(`[findByStatus] Found ${snapshot.docs.length} projects with status '${status}' for user ${userId}`);
            
            const projects = snapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              _applicantId: userId // Store userId for applicant population
            }));
            
            // Load documents for each project
            for (const project of projects) {
              project.documents = await this.getProjectDocuments(userId, project.id);
            }
            
            allProjects.push(...projects);
          } catch (statusError) {
            console.error(`Error fetching projects with status ${status} for user ${userId}:`, statusError);
          }
        }
      }
      
      // Remove duplicates and sort by createdAt
      const uniqueProjects = allProjects.filter((project, index, self) =>
        index === self.findIndex(p => p.id === project.id)
      );
      
      return uniqueProjects.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error finding projects by status:', error);
      throw error;
    }
  }

  // Find all projects (searches across all users for admins)
  async findAll(filters = {}) {
    try {
      const allProjects = [];
      
      // Ensure database is initialized
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const usersSnapshot = await this.db.collection('users').get();
      
      console.log(`[findAll] Searching across ${usersSnapshot.docs.length} users`);
      
      if (usersSnapshot.empty) {
        console.log('[findAll] No users found in database');
        return [];
      }
      
      // Log all user IDs for debugging
      const userIds = usersSnapshot.docs.map(doc => doc.id);
      console.log(`[findAll] User IDs in database: ${userIds.join(', ')}`);
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        console.log(`[findAll] Checking projects for user: ${userId}`);
        
        try {
          const projectsCollection = this.getProjectsCollection(userId);
          console.log(`[findAll] Querying collection: users/${userId}/projects`);
          
          let query = projectsCollection;
          
          if (filters.status) {
            query = query.where('status', '==', filters.status);
            console.log(`[findAll] Added status filter: ${filters.status}`);
          }
          
          if (filters.type) {
            query = query.where('type', '==', filters.type);
            console.log(`[findAll] Added type filter: ${filters.type}`);
          }
          
          // Don't use orderBy to avoid index requirement - we'll sort in memory
          console.log(`[findAll] Executing query for user ${userId}...`);
          console.log(`[findAll] Query type: ${query.constructor.name}, Has filters: ${!!filters.status || !!filters.type}`);
          
          // If no filters, use collection.get() directly instead of query
          let snapshot;
          if (!filters.status && !filters.type) {
            // No filters - get all documents from collection directly
            console.log(`[findAll] No filters - getting all documents from collection`);
            snapshot = await projectsCollection.get();
          } else {
            // Has filters - use the query
            console.log(`[findAll] Has filters - using query`);
            snapshot = await query.get();
          }
          
          console.log(`[findAll] Query returned ${snapshot.docs.length} documents for user ${userId}`);
          
          const projects = snapshot.docs.map(doc => {
            try {
              return { 
                id: doc.id, 
                ...doc.data(),
                _applicantId: userId // Store userId for applicant population
              };
            } catch (mapError) {
              console.error(`Error mapping project document ${doc.id}:`, mapError);
              return null;
            }
          }).filter(p => p !== null);
          
          console.log(`[findAll] Found ${projects.length} projects for user ${userId}`);
          
          // Load documents for each project
          for (const project of projects) {
            try {
              project.documents = await this.getProjectDocuments(userId, project.id);
            } catch (docError) {
              console.error(`Error loading documents for project ${project.id}:`, docError);
              project.documents = [];
            }
          }
          
          allProjects.push(...projects);
        } catch (err) {
          console.error(`Error querying projects for user ${userId}:`, err);
          console.error(`Error details:`, err.message, err.stack);
          // Continue with next user
        }
      }
      
      console.log(`[findAll] Total projects found: ${allProjects.length}`);
      
      // Sort by createdAt descending
      return allProjects.sort((a, b) => {
        try {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        } catch (sortError) {
          console.error('Error sorting projects:', sortError);
          return 0;
        }
      });
    } catch (error) {
      console.error('Error finding projects:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Update project (searches across all users to find it)
  async update(id, updateData, applicantId = null) {
    try {
      updateData.updatedAt = new Date();
      
      // If applicantId is provided, update directly
      if (applicantId) {
        await this.getProjectsCollection(applicantId).doc(id).update(updateData);
        return await this.findById(id, applicantId);
      }
      
      // Otherwise, search across all users
      const usersSnapshot = await this.db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const projectRef = this.getProjectsCollection(userId).doc(id);
        const projectDoc = await projectRef.get();
        
        if (projectDoc.exists) {
          await projectRef.update(updateData);
          return await this.findById(id, userId);
        }
      }
      
      throw new Error('Project not found');
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project (searches across all users to find it)
  async delete(id, applicantId = null) {
    try {
      // If applicantId is provided, delete directly
      if (applicantId) {
        // Delete all documents in subcollection first
        const documentsSnapshot = await this.getDocumentsCollection(applicantId, id).get();
        const batch = this.db.batch();
        
        documentsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        // Delete the project
        await this.getProjectsCollection(applicantId).doc(id).delete();
        return true;
      }
      
      // Otherwise, search across all users
      const usersSnapshot = await this.db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const projectRef = this.getProjectsCollection(userId).doc(id);
        const projectDoc = await projectRef.get();
        
        if (projectDoc.exists) {
          // Delete all documents in subcollection first
          const documentsSnapshot = await this.getDocumentsCollection(userId, id).get();
          const batch = this.db.batch();
          
          documentsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
          
          // Delete the project
          await projectRef.delete();
          return true;
        }
      }
      
      throw new Error('Project not found');
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Add document to project (in subcollection)
  async addDocument(projectId, document, applicantId = null) {
    try {
      const project = await this.findById(projectId, applicantId);
      if (!project) {
        throw new Error('Project not found');
      }

      const userId = applicantId || project.applicant;
      const documentsCollection = this.getDocumentsCollection(userId, projectId);
      const docRef = documentsCollection.doc();
      
      await docRef.set({
        id: docRef.id,
        name: document.name,
        url: document.url,
        type: document.type,
        size: document.size,
        isVerified: document.isVerified || false,
        verifiedAt: document.verifiedAt || null,
        verifiedBy: document.verifiedBy || null,
        uploadedAt: document.uploadedAt || new Date(),
        createdAt: new Date()
      });

      return await this.getProjectDocuments(userId, projectId);
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  // Remove document from project (from subcollection)
  async removeDocument(projectId, documentId, applicantId = null) {
    try {
      const project = await this.findById(projectId, applicantId);
      if (!project) {
        throw new Error('Project not found');
      }

      const userId = applicantId || project.applicant;
      await this.getDocumentsCollection(userId, projectId).doc(documentId).delete();

      return await this.getProjectDocuments(userId, projectId);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  }

  // Update document verification status
  async updateDocumentVerification(projectId, documentId, isVerified, verifiedBy, applicantId = null) {
    try {
      const project = await this.findById(projectId, applicantId);
      if (!project) {
        throw new Error('Project not found');
      }

      const userId = applicantId || project.applicant;
      const docRef = this.getDocumentsCollection(userId, projectId).doc(documentId);
      const docDoc = await docRef.get();
      
      if (!docDoc.exists) {
        throw new Error('Document not found');
      }

      await docRef.update({
        isVerified: isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? verifiedBy : null,
        updatedAt: new Date()
      });

      return await this.getProjectDocuments(userId, projectId);
    } catch (error) {
      console.error('Error updating document verification:', error);
      throw error;
    }
  }

  // Add review comment
  async addReviewComment(projectId, comment, applicantId = null) {
    try {
      console.log(`[addReviewComment] Project ID: ${projectId}, Applicant ID: ${applicantId}`);
      
      const project = await this.findById(projectId, applicantId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Ensure we have the correct applicantId
      const userId = applicantId || (typeof project.applicant === 'string' 
        ? project.applicant 
        : project.applicant?.id || project.applicant);
      
      if (!userId) {
        throw new Error('Applicant ID is required to add comment');
      }

      console.log(`[addReviewComment] Using applicantId: ${userId}`);

      const reviewComments = project.reviewComments || [];
      const newComment = {
        ...comment,
        timestamp: new Date()
      };
      reviewComments.push(newComment);

      console.log(`[addReviewComment] Adding comment, total comments: ${reviewComments.length}`);
      await this.update(projectId, { reviewComments }, userId);
      console.log(`[addReviewComment] Comment added successfully`);
      
      return reviewComments;
    } catch (error) {
      console.error('Error adding review comment:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}

module.exports = new ProjectService();

