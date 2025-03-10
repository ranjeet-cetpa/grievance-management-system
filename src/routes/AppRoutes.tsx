import { Routes, Route } from 'react-router';
import PrivateRoute from './PrivateRoute';
import Unauthorized from '@/pages/unauthorized/Unauthorized';
import NotFound from '@/pages/notFound/NotFound';

import Login from '@/pages/login/Login';
import HomePage from '@/pages/home/Home';
import Dashboard from '@/pages/employee/Dashboard';
import MyGrievances from '@/pages/employee/MyGrievances';
import ManageUsers from '@/pages/ManageUsers';

import GrievanceDetails from '@/pages/employee/GrievanceDetails';
import AdminPrivateRoute from './AdminPrivateRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManageRoles from '@/pages/ManageRoles';
import RequestPage from '@/pages/requestPage/RequestPage';
import OrgChart from '@/pages/admin/OrgChart';
import RedressalGrievances from '@/pages/redressal-grievances/RedressalGrievances';
import OrgChart2 from '@/pages/admin/OrgChart2';
import NonOrgChart from "@/pages/admin/NonOrgChart";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manage-services" element={<ManageUsers />} />
        <Route path="/manage-roles" element={<ManageRoles />} />
        <Route path="/grievances" element={<MyGrievances />} />
        <Route path="/redressal-grievances" element={<RedressalGrievances />} />

        <Route path="/grievances/:grievanceId" element={<GrievanceDetails />} />
      </Route>
      <Route element={<AdminPrivateRoute />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-grievances" element={<MyGrievances />} />
        <Route path="/admin-grievances/:grievanceId" element={<GrievanceDetails />} />
        <Route path="/admin-manage-services" element={<ManageUsers />} />
        <Route path="/admin-manage-role" element={<ManageRoles />} />
        <Route path="/admin-org" element={<OrgChart2 />} />
        <Route path="/admin-non-corporate" element={<NonOrgChart />} />
      </Route>
      <Route path="/grievance/:token" element={<RequestPage />} /> <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
