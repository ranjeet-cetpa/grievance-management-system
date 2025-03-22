import { useState, useEffect } from 'react';
import axiosInstance from '@/services/axiosInstance';

interface MappedUser {
  userCode: string;
  userDetails: string;
  unitId: string;
  unitName: string;
}

interface RoleDetailResponse {
  roleDetail: {
    id: number;
    roleName: string;
    // ... other fields
  };
  mappedUsers: MappedUser[];
}

const useAdminUnits = (userCode: string) => {
  const [adminUnits, setAdminUnits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminUnits = async () => {
      try {
        const response = await axiosInstance.get<{ data: RoleDetailResponse }>('/Admin/GetRoleDetail?roleId=1');
        const mappedUsers = response.data.data.mappedUsers;
        const userUnits = mappedUsers.filter((user) => user.userCode === userCode).map((user) => Number(user.unitId));
        setAdminUnits(userUnits);
      } catch (error) {
        console.error('Error fetching admin units:', error);
        setAdminUnits([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUnits();
  }, [userCode]);

  return { adminUnits, isLoading };
};

export default useAdminUnits;
