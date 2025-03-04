import { RootState } from '@/app/store';
import { useSelector } from 'react-redux';

const useUserRoles = () => {
  const userRole = useSelector((state: RootState) => state.user.Roles);
  const roles = userRole ? userRole.split(',').map((role) => role.trim().toLowerCase()) : [];
  const isNodalOfficer = roles.includes('nodalofficer');
  const isSuperAdmin = roles.includes('superadmin');
  const isAdmin = roles.includes('admin');
  const isUnitCGM = roles.includes('unitcgm');

  return {
    isNodalOfficer,
    isSuperAdmin,
    isAdmin,
    isUnitCGM,
    roles,
  };
};

export default useUserRoles;
