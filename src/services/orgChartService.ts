import axios from 'axios';
import { UserDetails, FlattenedNode } from '@/types/orgChart';
import axiosInstance from './axiosInstance';

export const orgChartService = {
  async fetchOrgHierarchy(unitId: string) {
    try {
      const response = await axiosInstance.get(`/Admin/GetOrgGroupHierarchy?unitId=${unitId}`);
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
      const response = await axiosInstance.post(`/Admin/UpdateUserGroupMapping`, {
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
