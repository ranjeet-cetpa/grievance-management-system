import axios from 'axios';
import { UserDetails, FlattenedNode } from '@/types/orgChart';

const API_BASE_URL = 'https://uat.grivance.dfccil.cetpainfotech.com/api';

export const orgChartService = {
  async fetchOrgHierarchy(unitId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/Admin/GetOrgGroupHierarchy?unitId=${unitId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching organization hierarchy:', error);
      throw error;
    }
  },

  async updateUserGroupMapping(
    groupMasterId: number,
    unitId: string,
    unitName: string,
    userCodes: { userCode: string; userDetails: string }[]
  ) {
    try {
      const response = await axios.post(`${API_BASE_URL}/Admin/UpdateUserGroupMapping`, {
        groupMasterId,
        unitId,
        unitName,
        userCodes,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user group mapping:', error);
      throw error;
    }
  },
};
