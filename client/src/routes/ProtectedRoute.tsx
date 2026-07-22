import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
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

  return <>{children}</>;
};

export default ProtectedRoute;
