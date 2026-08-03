import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../features/landing/pages/LandingPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import UserManagementPage from '@/features/users/pages/UserManagementPage';
import UserDetailPage from '@/features/users/pages/UserDetailPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import RolesAndPermissionsPage from '@/features/roles/pages/RolesAndPermissionsPage';
import ActivitiesPage from '@/features/activities/pages/ActivitiesPage';
import ActivityDetailPage from '@/features/activities/pages/ActivityDetailPage';
import ReportsLayout from '@/features/reports/components/ReportsLayout';
import ReportsOverviewPage from '@/features/reports/pages/ReportsOverviewPage';
import ReportsActivityPage from '@/features/reports/pages/ReportsActivityPage';
import ReportsSecurityPage from '@/features/reports/pages/ReportsSecurityPage';
import ReportsPermissionsPage from '@/features/reports/pages/ReportsPermissionsPage';
import ReportsExportsPage from '@/features/reports/pages/ReportsExportsPage';
import ReportsScheduledPage from '@/features/reports/pages/ReportsScheduledPage';
import ReportsOperationsPage from '@/features/reports/pages/ReportsOperationsPage';
import SettingsLayout from '@/features/settings/components/SettingsLayout';
import ProfileSettingsTab from '@/features/settings/components/ProfileSettingsTab';
import AccountSettingsTab from '@/features/settings/components/AccountSettingsTab';
import SecuritySettingsTab from '@/features/settings/components/SecuritySettingsTab';
import AppearanceSettingsTab from '@/features/settings/components/AppearanceSettingsTab';
import NotificationPreferencesTab from '@/features/settings/components/NotificationPreferencesTab';
import ApiKeysTab from '@/features/settings/components/ApiKeysTab';
import IntegrationsTab from '@/features/settings/components/IntegrationsTab';
import AuditLogTab from '@/features/settings/components/AuditLogTab';
import IntegrationsPage from '@/features/settings/pages/IntegrationsPage';
import PermissionsPage from '@/features/permissions/pages/PermissionsPage';
import TeamsPage from '@/features/teams/pages/TeamsPage';
import TeamDetailPage from '@/features/teams/pages/TeamDetailPage';
import SecurityLayout from '@/features/security/components/SecurityLayout';
import SecurityOverviewPage from '@/features/security/pages/SecurityOverviewPage';
import SecuritySessionsPage from '@/features/security/pages/SecuritySessionsPage';
import SecurityAccessReviewsPage from '@/features/security/pages/SecurityAccessReviewsPage';
import UnauthorizedPage from '@/features/errors/pages/UnauthorizedPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import MyAccessPage from '@/features/access/pages/MyAccessPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Herhangi bir kimliği doğrulanmış rol erişebilir — sayfa içeriği role göre kendini uyarlar */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredFeature="ownNotifications">
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/access"
          element={
            <ProtectedRoute requiredFeature="ownAccess">
              <MyAccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute requiredFeature="users">
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/:id"
          element={
            <ProtectedRoute requiredFeature="users">
              <UserDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Global aktivite akışı yalnızca Admin'e açık; Editor/Viewer aynı route'ta kendi
            aktivitelerini görür (bkz. ActivitiesPage'in rol bazlı içerik seçimi). */}
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route
          path="/activities/:id"
          element={
            <ProtectedRoute requiredFeature="globalActivity">
              <ActivityDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams"
          element={
            <ProtectedRoute requiredFeature="teams">
              <TeamsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute requiredFeature="teams">
              <TeamDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredFeature="reports">
              <ReportsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReportsOverviewPage />} />
          <Route path="activity" element={<ReportsActivityPage />} />
          {/* Editor-only tab; Admin never sees "operations" data it doesn't already get from
              Reports Overview/Activity, so the tab itself is hidden from Admin in ReportsLayout. */}
          <Route path="operations" element={<ReportsOperationsPage />} />
          {/* Own-exports for Editor, full export history for Admin — branches internally,
              no per-tab gate needed since the outer /reports route already blocks Viewer. */}
          <Route path="exports" element={<ReportsExportsPage />} />
          <Route
            path="security"
            element={
              <ProtectedRoute requiredFeature="securityReports">
                <ReportsSecurityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="permissions"
            element={
              <ProtectedRoute requiredFeature="permissionReports">
                <ReportsPermissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="scheduled"
            element={
              <ProtectedRoute requiredFeature="scheduledReports">
                <ReportsScheduledPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="/settings/profile" replace />} />
          <Route path="profile" element={<ProfileSettingsTab />} />
          <Route path="account" element={<AccountSettingsTab />} />
          <Route path="security" element={<SecuritySettingsTab />} />
          <Route path="appearance" element={<AppearanceSettingsTab />} />
          <Route path="notifications" element={<NotificationPreferencesTab />} />
          <Route
            path="api-keys"
            element={
              <ProtectedRoute requiredFeature="apiKeys">
                <ApiKeysTab />
              </ProtectedRoute>
            }
          />
          <Route
            path="integrations"
            element={
              <ProtectedRoute requiredFeature="integrations">
                <IntegrationsTab />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit"
            element={
              <ProtectedRoute requiredFeature="personalAudit">
                <AuditLogTab />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* Admin Özel Alanı — Roller, İzinler, Güvenlik ve Entegrasyonlar sadece Admin rolüne açık */}
      <Route
        element={
          <ProtectedRoute requiredRole="Admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/roles" element={<RolesAndPermissionsPage />} />
        <Route path="/roles/:id" element={<RolesAndPermissionsPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />

        <Route path="/security" element={<SecurityLayout />}>
          <Route index element={<SecurityOverviewPage />} />
          <Route path="sessions" element={<SecuritySessionsPage />} />
          <Route path="access-reviews" element={<SecurityAccessReviewsPage />} />
        </Route>
      </Route>

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
