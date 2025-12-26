import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      dashboard: 'Dashboard',
      projects: 'Projects',
      upload: 'Upload',
      aiAssistant: 'AI Assistant',
      costEstimator: 'Cost Estimator',
      documents: 'Documents',
      reviews: 'Reviews',
      admin: 'Admin',
      logout: 'Logout',
      
      // Auth
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      
      // Landing Page
      heroTitle: 'AI-Powered Permit Management',
      heroSubtitle: 'Streamline your permit applications with intelligent automation, real-time tracking, and expert guidance.',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      
      // Features
      features: {
        aiAdvisor: 'AI Permit Advisor',
        aiAdvisorDesc: 'Get intelligent recommendations and automated form filling',
        documentAutomation: 'Document Automation',
        documentAutomationDesc: 'Upload and automatically process your documents',
        multilingualSupport: 'Multilingual Support',
        multilingualSupportDesc: 'Access the platform in multiple languages',
        realTimeTracking: 'Real-time Tracking',
        realTimeTrackingDesc: 'Track your application status in real-time',
        costEstimation: 'Cost Estimation',
        costEstimationDesc: 'Get accurate cost and timeline estimates',
        expertReview: 'Expert Review',
        expertReviewDesc: 'Professional review and feedback on your applications'
      },
      
      // Dashboard
      welcomeBack: 'Welcome back',
      recentProjects: 'Recent Projects',
      pendingReviews: 'Pending Reviews',
      notifications: 'Notifications',
      quickActions: 'Quick Actions',
      
      // Project Status
      status: {
        draft: 'Draft',
        submitted: 'Submitted',
        underReview: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn'
      },
      
      // Priority
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      
      // Common Actions
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      
      // Messages
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      noData: 'No data available',
      tryAgain: 'Try again',
      
      // AI Assistant
      aiAssistant: 'AI Assistant',
      askQuestion: 'Ask a question about permits...',
      send: 'Send',
      clear: 'Clear',
      
      // Cost Estimator
      projectType: 'Project Type',
      projectSize: 'Project Size (sq ft)',
      complexity: 'Complexity',
      location: 'Location',
      estimate: 'Estimate',
      estimatedCost: 'Estimated Cost',
      estimatedTimeline: 'Estimated Timeline',
      
      // Document Manager
      uploadDocuments: 'Upload Documents',
      dragDropFiles: 'Drag and drop files here, or click to select',
      supportedFormats: 'Supported formats: PDF, DOC, DOCX, DWG, DXF, JPG, PNG',
      maxFileSize: 'Max file size: 10MB',
      
      // Notifications
      newNotification: 'New notification',
      projectUpdated: 'Project updated',
      statusChanged: 'Status changed',
      commentAdded: 'Comment added',
      
      // Admin
      totalUsers: 'Total Users',
      totalProjects: 'Total Projects',
      revenue: 'Revenue',
      activeUsers: 'Active Users',
      userManagement: 'User Management',
      projectManagement: 'Project Management',
      analytics: 'Analytics',
      auditTrail: 'Audit Trail',
      
      // Sidebar
      navigation: 'Navigation',
      workflow: 'Workflow',
      activeProjects: 'Active Projects',
      completedToday: 'Completed Today',
      
      // Navbar
      search: 'Search...',
      profile: 'Profile',
      profileSettings: 'Profile Settings'
    }
  },
  es: {
    translation: {
      // Navigation
      home: 'Inicio',
      dashboard: 'Panel',
      projects: 'Proyectos',
      upload: 'Subir',
      aiAssistant: 'Asistente IA',
      costEstimator: 'Calculadora de Costos',
      documents: 'Documentos',
      reviews: 'Revisiones',
      admin: 'Admin',
      logout: 'Cerrar Sesión',
      
      // Auth
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo',
      password: 'Contraseña',
      name: 'Nombre',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      dontHaveAccount: '¿No tienes una cuenta?',
      
      // Landing Page
      heroTitle: 'Gestión de Permisos con IA',
      heroSubtitle: 'Optimiza tus solicitudes de permisos con automatización inteligente, seguimiento en tiempo real y orientación experta.',
      getStarted: 'Comenzar',
      learnMore: 'Saber Más',
      
      // Features
      features: {
        aiAdvisor: 'Asesor de Permisos IA',
        aiAdvisorDesc: 'Obtén recomendaciones inteligentes y llenado automático de formularios',
        documentAutomation: 'Automatización de Documentos',
        documentAutomationDesc: 'Sube y procesa automáticamente tus documentos',
        multilingualSupport: 'Soporte Multilingüe',
        multilingualSupportDesc: 'Accede a la plataforma en múltiples idiomas',
        realTimeTracking: 'Seguimiento en Tiempo Real',
        realTimeTrackingDesc: 'Rastrea el estado de tu solicitud en tiempo real',
        costEstimation: 'Estimación de Costos',
        costEstimationDesc: 'Obtén estimaciones precisas de costos y tiempos',
        expertReview: 'Revisión Experta',
        expertReviewDesc: 'Revisión profesional y retroalimentación en tus solicitudes'
      },
      
      // Sidebar
      navigation: 'Navegación',
      workflow: 'Flujo de Trabajo',
      activeProjects: 'Proyectos Activos',
      completedToday: 'Completados Hoy',
      totalUsers: 'Usuarios Totales',
      revenue: 'Ingresos',
      userManagement: 'Gestión de Usuarios',
      projectManagement: 'Gestión de Proyectos',
      analytics: 'Análisis',
      
      // Navbar
      search: 'Buscar...',
      profile: 'Perfil',
      profileSettings: 'Configuración de Perfil'
    }
  },
  hi: {
    translation: {
      // Navigation
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      projects: 'प्रोजेक्ट',
      upload: 'अपलोड',
      aiAssistant: 'AI सहायक',
      costEstimator: 'लागत अनुमानक',
      documents: 'दस्तावेज',
      reviews: 'समीक्षा',
      admin: 'एडमिन',
      logout: 'लॉग आउट',
      
      // Auth
      login: 'लॉग इन',
      register: 'रजिस्टर',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'नाम',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      forgotPassword: 'पासवर्ड भूल गए?',
      alreadyHaveAccount: 'पहले से खाता है?',
      dontHaveAccount: 'खाता नहीं है?',
      
      // Landing Page
      heroTitle: 'AI-संचालित परमिट प्रबंधन',
      heroSubtitle: 'बुद्धिमान स्वचालन, वास्तविक समय ट्रैकिंग और विशेषज्ञ मार्गदर्शन के साथ अपने परमिट आवेदनों को सुव्यवस्थित करें।',
      getStarted: 'शुरू करें',
      learnMore: 'और जानें',
      
      // Sidebar
      navigation: 'नेविगेशन',
      workflow: 'वर्कफ़्लो',
      activeProjects: 'सक्रिय प्रोजेक्ट',
      completedToday: 'आज पूर्ण हुए',
      totalUsers: 'कुल उपयोगकर्ता',
      revenue: 'राजस्व',
      userManagement: 'उपयोगकर्ता प्रबंधन',
      projectManagement: 'प्रोजेक्ट प्रबंधन',
      analytics: 'विश्लेषण',
      
      // Navbar
      search: 'खोजें...',
      profile: 'प्रोफ़ाइल',
      profileSettings: 'प्रोफ़ाइल सेटिंग्स'
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, []);

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t: i18n.t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
