import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../app/hooks";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, userRole } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(userRole || ""))
    return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
