import { RootState } from '@/app/store';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '@/services/axiosInstance';

interface RoleResponse {
  statusCode: number;
  message: string;
  data: string[];
  dataLength: number;
  totalRecords: number;
  error: boolean;
  errorDetail: null | string;
}

const useUserRoles = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setIsLoading(true);
        if (user?.EmpCode) {
          const response = await axiosInstance.get(`/Admin/GetUserRoles?empCode=${user.EmpCode}`);
          if (response.data.data) {
            setRoles(response.data.data.map((role) => role.toLowerCase()));
          }
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.EmpCode]);

  const isNodalOfficer = roles.includes('nodalofficer');
  const isSuperAdmin = roles.includes('superadmin');
  const isAdmin = roles.includes('admin');
  const isUnitCGM = roles.includes('unitcgm');
  const isHOD = roles.includes('hod');
  const isUser = roles.includes('user');
  const isAddressal = roles.includes('redressal');
  const isCommittee = roles.includes('committee');

  return {
    isNodalOfficer,
    isSuperAdmin,
    isAdmin,
    isUnitCGM,
    isHOD,
    isAddressal,
    isCommittee,
    isUser,
    roles,
    isLoading,
  };
};

export default useUserRoles;
