import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingBar from './LoadingBar';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingBar />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
