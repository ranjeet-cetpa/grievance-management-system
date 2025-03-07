import { RootState } from '@/app/store';
import { useSelector } from 'react-redux';

const useUserRoles = () => {
  const userRole = useSelector((state: RootState) => state.user.Roles);
  console.log('this is user role ', userRole);
  const roles = userRole ? userRole.split(',').map((role) => role.trim().toLowerCase()) : [];
  const isNodalOfficer = roles.includes('nodalofficer');
  const isSuperAdmin = roles.includes('superadmin');
  const isAdmin = roles.includes('admin');
  const isUnitCGM = roles.includes('unitcgm');
  const isHOD = roles.includes('hod');
  const isUser = roles.includes('user');
  const isAddressal = roles.includes('addressal');
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
  };
};

export default useUserRoles;
