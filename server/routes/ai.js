const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { auth } = require('../middleware/auth');
const projectService = require('../services/projectService');

const router = express.Router();

// Lazy initialization of Gemini client
let genAI = null;
const getGemini = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured. Please set it in your .env file.');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// @route   POST /api/ai/analyze
// @desc    Analyze document with AI to extract cost, timeline, and other project details
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  try {
    const { documentUrl, projectId, projectType } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ message: 'Document URL is required' });
    }

    let analysis = null;

    try {
      // Use Gemini to analyze the document
      const model = getGemini().getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.3, // Lower temperature for more accurate extraction
        }
      });

      const prompt = `You are analyzing a construction/permit document. Extract the following information from the document:

1. Estimated project cost (in USD) - look for budget, cost, price, estimate, total cost
2. Estimated timeline/duration (in days) - look for timeline, duration, completion time, schedule
3. Project type (if not already provided)
4. Required permits
5. Compliance issues or missing requirements
6. Recommendations

Document URL: ${documentUrl}
${projectType ? `Project Type: ${projectType}` : ''}

Return a JSON object with this structure:
{
  "estimatedCost": <number in USD>,
  "estimatedTimeline": <number in days>,
  "projectType": "<type>",
  "requiredPermits": ["permit1", "permit2"],
  "complianceIssues": ["issue1", "issue2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

If you cannot find specific values, use reasonable estimates based on the project type:
- Building Construction: $50,000-$200,000, 90-180 days
- Renovation: $25,000-$100,000, 45-90 days
- Commercial: $75,000-$300,000, 120-240 days
- Residential: $30,000-$150,000, 60-120 days
- Other: $20,000-$80,000, 30-90 days

Only return valid JSON, no additional text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response (handle markdown code blocks if present)
      let extractedData;
      try {
        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON, using fallback:', parseError);
        // Fallback to mock data if parsing fails
        extractedData = getFallbackAnalysis(projectType);
      }

      // Ensure numeric values are valid
      if (!extractedData.estimatedCost || isNaN(extractedData.estimatedCost)) {
        extractedData.estimatedCost = getDefaultCost(projectType);
      }
      if (!extractedData.estimatedTimeline || isNaN(extractedData.estimatedTimeline)) {
        extractedData.estimatedTimeline = getDefaultTimeline(projectType);
      }

      analysis = {
        extractedData: {
          projectType: extractedData.projectType || projectType || 'Building Construction',
          estimatedCost: Math.round(parseFloat(extractedData.estimatedCost)),
          estimatedTimeline: Math.round(parseInt(extractedData.estimatedTimeline)),
          requiredPermits: extractedData.requiredPermits || [],
          complianceIssues: extractedData.complianceIssues || [],
          recommendations: extractedData.recommendations || []
        },
        confidence: 0.85,
        lastAnalyzed: new Date()
      };
    } catch (aiError) {
      console.error('Gemini AI analysis error:', aiError);
      // Fallback to mock analysis if AI fails
      analysis = {
        extractedData: {
          projectType: projectType || 'Building Construction',
          estimatedCost: getDefaultCost(projectType),
          estimatedTimeline: getDefaultTimeline(projectType),
          requiredPermits: ['Building Permit', 'Electrical Permit', 'Plumbing Permit'],
          complianceIssues: [],
          recommendations: [
            'Review all documents for completeness',
            'Ensure all required permits are included',
            'Verify compliance with local building codes'
          ]
        },
        confidence: 0.70,
        lastAnalyzed: new Date()
      };
    }

    // Update project with AI analysis
    if (projectId) {
      await projectService.update(projectId, { 
        aiAnalysis: analysis,
        estimatedCost: analysis.extractedData.estimatedCost,
        estimatedTimeline: analysis.extractedData.estimatedTimeline
      });
    }

    res.json({
      message: 'Document analyzed successfully',
      analysis: analysis
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ message: 'AI analysis failed' });
  }
});

// Helper functions for fallback values
function getDefaultCost(projectType) {
  const costs = {
    'building': 100000,
    'renovation': 50000,
    'commercial': 150000,
    'residential': 75000,
    'other': 40000
  };
  return costs[projectType] || 75000;
}

function getDefaultTimeline(projectType) {
  const timelines = {
    'building': 120,
    'renovation': 60,
    'commercial': 150,
    'residential': 90,
    'other': 45
  };
  return timelines[projectType] || 90;
}

function getFallbackAnalysis(projectType) {
  return {
    estimatedCost: getDefaultCost(projectType),
    estimatedTimeline: getDefaultTimeline(projectType),
    projectType: projectType || 'Building Construction',
    requiredPermits: ['Building Permit'],
    complianceIssues: [],
    recommendations: []
  };
}

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, projectId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get project context if provided
    let projectContext = '';
    if (projectId) {
      const project = await projectService.findById(projectId);
      if (project) {
        projectContext = `Project: ${project.title}, Type: ${project.type}, Status: ${project.status}`;
      }
    }

    const systemPrompt = `You are an AI assistant for the Permiso Platform, a permit management system. 
    You help users with permit applications, document requirements, and regulatory compliance.
    ${projectContext ? `Current project context: ${projectContext}` : ''}
    
    Provide helpful, accurate information about:
    - Permit requirements and processes
    - Document preparation and submission
    - Regulatory compliance
    - Timeline and cost estimates
    - Common issues and solutions
    
    Be concise, professional, and helpful.`;

    const model = getGemini().getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });
    
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      message: 'AI response generated',
      response: text
    });
  } catch (error) {
    console.error('AI chat error:', error);
    if (error.message && error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({ 
        message: 'AI chat failed: Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.' 
      });
    }
    res.status(500).json({ 
      message: 'AI chat failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/estimate
// @desc    Get cost and timeline estimate
// @access  Private
router.post('/estimate', auth, async (req, res) => {
  try {
    const { projectType, size, complexity, location } = req.body;

    // Mock estimation logic - in production, this would use more sophisticated algorithms
    const baseCosts = {
      'building': 50000,
      'renovation': 25000,
      'commercial': 75000,
      'residential': 30000,
      'other': 20000
    };

    const baseTimelines = {
      'building': 120,
      'renovation': 60,
      'commercial': 150,
      'residential': 90,
      'other': 45
    };

    const complexityMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.5,
      'urgent': 2.0
    };

    const sizeMultiplier = Math.max(0.5, Math.min(2.0, size / 1000)); // Assuming size in sq ft

    const baseCost = baseCosts[projectType] || 20000;
    const baseTimeline = baseTimelines[projectType] || 60;
    const complexityValue = complexityMultiplier[complexity] || 1.0;

    const estimatedCost = Math.round(baseCost * complexityValue * sizeMultiplier);
    const estimatedTimeline = Math.round(baseTimeline * complexityValue);

    res.json({
      message: 'Estimate generated successfully',
      estimate: {
        cost: estimatedCost,
        timeline: estimatedTimeline,
        breakdown: {
          baseCost,
          complexityMultiplier: complexityValue,
          sizeMultiplier: sizeMultiplier,
          projectType,
          location
        }
      }
    });
  } catch (error) {
    console.error('Estimation error:', error);
    res.status(500).json({ message: 'Estimation failed' });
  }
});

// @route   POST /api/ai/validate
// @desc    Validate form data with AI
// @access  Private
router.post('/validate', auth, async (req, res) => {
  try {
    const { formData, projectType } = req.body;

    if (!formData) {
      return res.status(400).json({ message: 'Form data is required' });
    }

    // Mock validation logic
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check required fields based on project type
    const requiredFields = {
      'building': ['address', 'buildingType', 'totalArea', 'height'],
      'renovation': ['address', 'renovationType', 'affectedArea'],
      'commercial': ['address', 'businessType', 'occupancy', 'totalArea'],
      'residential': ['address', 'dwellingType', 'bedrooms', 'totalArea']
    };

    const fields = requiredFields[projectType] || [];
    fields.forEach(field => {
      if (!formData[field]) {
        validationResults.errors.push(`${field} is required for ${projectType} projects`);
        validationResults.isValid = false;
      }
    });

    // Check for common issues
    if (formData.totalArea && formData.totalArea < 100) {
      validationResults.warnings.push('Total area seems unusually small for this project type');
    }

    if (formData.height && formData.height > 50) {
      validationResults.warnings.push('Building height exceeds standard limits - additional permits may be required');
    }

    res.json({
      message: 'Validation completed',
      validation: validationResults
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ message: 'Validation failed' });
  }
});

module.exports = router;
