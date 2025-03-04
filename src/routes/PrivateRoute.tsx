import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import AppLayout from '@/components/app-layout';
import { getSessionItem } from '@/lib/helperFunction';
const PrivateRoute: React.FC = () => {
  const isAuthenticated = getSessionItem('token');
  //const isAuthenticated = true;

  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
