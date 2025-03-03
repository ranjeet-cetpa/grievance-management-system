import { Routes, Route } from 'react-router';
import PrivateRoute from './PrivateRoute';
import Unauthorized from '@/pages/unauthorized/Unauthorized';
import NotFound from '@/pages/notFound/NotFound';

import Login from '@/pages/login/Login';
import HomePage from '@/pages/home/Home';
import Dashboard from '@/pages/employee/Dashboard';
import MyGrievances from '@/pages/employee/MyGrievances';
import ManageUsers from '@/pages/role-management/ManageUsers';

import GrievanceDetails from '@/pages/employee/GrievanceDetails';
import AdminPrivateRoute from './AdminPrivateRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/role-management" element={<ManageUsers />} />
        <Route path="/grievances" element={<MyGrievances />} />
        <Route path="/grievances/:grievanceId" element={<GrievanceDetails />} />
      </Route>
      <Route element={<AdminPrivateRoute />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-grievances" element={<MyGrievances />} />
        <Route path="/admin-grievances/:grievanceId" element={<GrievanceDetails />} />
        <Route path="/admin-manage-user" element={<ManageUsers />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
