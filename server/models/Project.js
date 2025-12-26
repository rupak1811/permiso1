const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['building', 'renovation', 'commercial', 'residential', 'other']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  forms: [{
    formType: String,
    data: mongoose.Schema.Types.Mixed,
    isCompleted: {
      type: Boolean,
      default: false
    },
    aiGenerated: {
      type: Boolean,
      default: false
    }
  }],
  estimatedCost: {
    type: Number,
    default: 0
  },
  estimatedTimeline: {
    type: Number, // in days
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  actualTimeline: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  reviewComments: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  aiAnalysis: {
    extractedData: mongoose.Schema.Types.Mixed,
    recommendations: [String],
    confidence: Number,
    lastAnalyzed: Date
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dueDate: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
projectSchema.index({ applicant: 1, status: 1 });
projectSchema.index({ reviewer: 1, status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
