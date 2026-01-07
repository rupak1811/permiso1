import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Landing from './pages/user/Landing';
import UserDashboard from './pages/user/Dashboard';
import ProjectsList from './pages/user/ProjectsList';
import ProjectUpload from './pages/user/ProjectUpload';
import ProjectEdit from './pages/user/ProjectEdit';
import ProjectDetails from './pages/user/ProjectDetails';
import AIAssistant from './pages/user/AIAssistant';
import CostEstimator from './pages/user/CostEstimator';
import DocumentManager from './pages/user/DocumentManager';
import Profile from './pages/user/Profile';
import ApplyForPermits from './pages/user/ApplyForPermits';
import PermitsList from './pages/user/PermitsList';
import PermitDetails from './pages/user/PermitDetails';

// Reviewer Pages
import ReviewerDashboard from './pages/reviewer/Dashboard';
import ReviewWorkflow from './pages/reviewer/ReviewWorkflow';
import ReviewDetails from './pages/reviewer/ReviewDetails';
import ReviewerLanding from './pages/reviewer/Landing';
import ReviewerProjects from './pages/reviewer/ReviewerProjects';
import PendingReviews from './pages/reviewer/PendingReviews';
import CompletedReviews from './pages/reviewer/CompletedReviews';
import ReviewerPermits from './pages/reviewer/ReviewerPermits';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProjects from './pages/admin/Projects';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLanding from './pages/admin/Landing';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
          <Router>
            <div className="min-h-screen">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  },
                }}
              />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login allowedRole="user" />} />
                <Route path="/reviewer/login" element={<Login allowedRole="reviewer" />} />
                <Route path="/admin/login" element={<Login allowedRole="admin" />} />
                <Route path="/reviewer" element={<ReviewerLanding />} />
                <Route path="/admin" element={<AdminLanding />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <UserDashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects/upload" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <ProjectUpload />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects/:id/edit" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <ProjectEdit />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects/:id" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <ProjectDetails />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/projects" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <ProjectsList />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-assistant" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <AIAssistant />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/cost-estimator" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <CostEstimator />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/documents" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <DocumentManager />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <Profile />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/apply-for-permits" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <ApplyForPermits />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/permits" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <PermitsList />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/permits/:id" element={
                  <ProtectedRoute redirectPath="/login">
                    <Navbar />
                    <div className="flex flex-col sm:flex-row">
                      <Sidebar />
                      <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
                        <PermitDetails />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Reviewer Routes */}
                <Route path="/reviewer/dashboard" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <ReviewerDashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/projects" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <ReviewerProjects />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/ai-analysis" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <AIAssistant />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/pending" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <PendingReviews />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/completed" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <CompletedReviews />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/permits/:id" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <PermitDetails />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/permits" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <ReviewerPermits />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/reviewer/projects/:id" element={
                  <ProtectedRoute allowedRoles={['reviewer', 'admin']} redirectPath="/reviewer/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <ReviewDetails />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <AdminDashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <AdminUsers />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/projects" element={
                  <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <AdminProjects />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
                    <Navbar />
                    <div className="flex">
                      <Sidebar />
                      <main className="flex-1 p-6">
                        <AdminAnalytics />
                      </main>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
