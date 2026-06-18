import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';

// Lazy-loaded pages
const Landing    = React.lazy(() => import('./pages/Landing'));
const Login      = React.lazy(() => import('./pages/Login'));
const Register   = React.lazy(() => import('./pages/Register'));
const Dashboard  = React.lazy(() => import('./pages/Dashboard'));
const Editor     = React.lazy(() => import('./pages/Editor'));
const Templates  = React.lazy(() => import('./pages/Templates'));
const SharedDoc  = React.lazy(() => import('./pages/SharedDoc'));
const Pricing    = React.lazy(() => import('./pages/Pricing'));
const NotFound   = React.lazy(() => import('./pages/NotFound'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0c0a08' }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid #3a3328',
          borderTopColor: '#d4a843',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={null}>
          <ScrollToTop />
          <Routes>
            <Route path="/"            element={<Landing />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/templates"   element={<Templates />} />
            <Route path="/pricing"     element={<Pricing />} />
            <Route path="/editor"      element={<Editor />} />
            <Route path="/editor/:id"  element={<Editor />} />
            <Route path="/share/:slug" element={<SharedDoc />} />
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
