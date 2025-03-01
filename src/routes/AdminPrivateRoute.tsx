import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { getSessionItem } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import AdminLayout from "@/components/layout/AdminLayout";

const AdminPrivateRoute: React.FC = () => {
    // const isAuthenticated = getSessionItem('token');
    const isAuthenticated = true


    const user = useSelector((state: RootState) => state.user);
    // return isAuthenticated && (user.Roles === 'admin' || user.Roles === 'superAdmin') ? (
    return isAuthenticated ? (

        <AdminLayout>
            <Outlet />
        </AdminLayout>
    ) : (
        <Navigate to="/" replace />
    );
};

export default AdminPrivateRoute;