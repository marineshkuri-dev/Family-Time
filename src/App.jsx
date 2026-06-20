import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage       from './pages/LandingPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import CalendarPage      from './pages/CalendarPage';
import TasksPage         from './pages/TasksPage';
import AddEventPage      from './pages/AddEventPage';
import FamilyMembersPage from './pages/FamilyMembersPage';
import ProfilePage       from './pages/ProfilePage';
import SettingsPage      from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/calendar"       element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/tasks"          element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/add-event"      element={<ProtectedRoute><AddEventPage /></ProtectedRoute>} />
        <Route path="/family-members" element={<ProtectedRoute><FamilyMembersPage /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings"       element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
