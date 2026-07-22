import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../features/landing/pages/LandingPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import UserManagementPage from '@/features/users/pages/UserManagementPage'; 
import { DashboardLayout } from '@/layouts/DashboardLayout';
import RolesAndPermissionsPage from '@/features/roles/pages/RolesAndPermissionsPage';
import ActivitiesPage from '@/features/activities/pages/ActivitiesPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Aşama 3 Düzeltmesi: Forgot Password route eklendi */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Ana Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Diğer sayfalar */}
        <Route path="/team" element={<UserManagementPage />} />
        <Route path="/roles" element={<RolesAndPermissionsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} /> 

      </Route>

      {/* Admin Özel Alanı */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="Admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
