import { Navigate } from 'react-router-dom';

// Placeholder — replace with real auth check once Supabase is added
const isAuthenticated = () => true;

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
