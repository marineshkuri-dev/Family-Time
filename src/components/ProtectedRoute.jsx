import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" />
        <p>טוען...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
