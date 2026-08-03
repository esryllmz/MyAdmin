import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/store';
import { Loader2 } from 'lucide-react';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import type { ViewFeature } from '@/core/hooks/useRolePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Legacy role-name check (e.g. "Admin"). Prefer requiredFeature for new routes. */
  requiredRole?: string;
  /** Centralized view-level permission — see core/hooks/useRolePermissions.ts VIEW_ACCESS. */
  requiredFeature?: ViewFeature;
}

const ProtectedRoute = ({ children, requiredRole, requiredFeature }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const { canView } = useRolePermissions();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.roles) {
    const hasPermission = user.roles.some(role => role.name === requiredRole);

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredFeature && !canView(requiredFeature)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
