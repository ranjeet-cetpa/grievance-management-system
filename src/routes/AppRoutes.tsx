import { Routes, Route } from 'react-router';
import PrivateRoute from './PrivateRoute';
import Unauthorized from '@/pages/unauthorized/Unauthorized';
import NotFound from '@/pages/notFound/NotFound';

import Login from '@/pages/login/Login';
import HomePage from '@/pages/home/Home';
import Dashboard from '@/pages/employee/Dashboard';
import MyGrievances from '@/pages/employee/MyGrievances';
import ManageUsers from '@/pages/role-management/ManageUsers';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/role-management" element={<ManageUsers />} />

        <Route path="/my-grievances" element={<MyGrievances />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
