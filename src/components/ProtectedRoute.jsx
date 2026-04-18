import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading, isSyncing, isTransitioning } = useAuth();

  if (loading || isSyncing || isTransitioning) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p className="text-secondary font-medium animate-pulse">Syncing your universe...</p>
      </div>
    );
  }

  if (!user) {
    // Save the intended destination so they can be redirected back after login
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
