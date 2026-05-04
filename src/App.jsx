import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import { LoadingProvider, useLoading } from './components/LoadingBar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Editor = React.lazy(() => import('./pages/Editor'));
const Templates = React.lazy(() => import('./pages/Templates'));
const SharedDoc = React.lazy(() => import('./pages/SharedDoc'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function RouteTracker({ children }) {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading();
    const timer = setTimeout(() => {
      stopLoading();
    }, 400); // Simulate network load for lazy components
    return () => clearTimeout(timer);
  }, [location, startLoading, stopLoading]);

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <LoadingProvider>
            <RouteTracker>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/share/:slug" element={<SharedDoc />} />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/editor" element={
                    <ProtectedRoute>
                      <Editor />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/editor/:id" element={
                    <ProtectedRoute>
                      <Editor />
                    </ProtectedRoute>
                  } />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </RouteTracker>
          </LoadingProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
