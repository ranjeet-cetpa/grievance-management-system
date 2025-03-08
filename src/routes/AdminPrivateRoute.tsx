import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { getSessionItem } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import AdminLayout from '@/components/layout/AdminLayout';
import useUserRoles from '@/hooks/useUserRoles';

const AdminPrivateRoute: React.FC = () => {
  const isAuthenticated = true;
  const { isNodalOfficer, isSuperAdmin, isAdmin, isUnitCGM } = useUserRoles();
  const hasAccess = isNodalOfficer || isSuperAdmin || isAdmin || isUnitCGM;

  return isAuthenticated && hasAccess ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminPrivateRoute;
