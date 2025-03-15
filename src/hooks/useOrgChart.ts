import { useState, useCallback } from 'react';
import { OrgNode, FlattenedNode, UserDetails } from '@/types/orgChart';
import { orgChartService } from '@/services/orgChartService';
import { flattenOrgChart, getDepartmentData, shouldAllowMultiSelect } from '@/utils/orgChartUtils';
import toast from 'react-hot-toast';

interface UseOrgChartProps {
  unitId: string;
  unitName: string;
}

export const useOrgChart = ({ unitId, unitName }: UseOrgChartProps) => {
  const [chartData, setChartData] = useState<OrgNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flattenedData, setFlattenedData] = useState<FlattenedNode[]>([]);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FlattenedNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orgChartService.fetchOrgHierarchy(unitId);
      setChartData(data);
      setFlattenedData(flattenOrgChart(data));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch organization data');
      toast.error('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  const handleAddUser = useCallback(async () => {
    if (!selectedNode) return;

    try {
      setIsSubmitting(true);

      const userCodes = selectedUsers.map((user) => ({
        userCode: user.userCode,
        userDetails: user.userDetail,
      }));

      await orgChartService.updateUserGroupMapping(selectedNode.id, unitId, unitName, userCodes);
      toast.success('User mapping updated successfully');

      await fetchData();

      setAddUserDialogOpen(false);
      setSelectedUsers([]);
      setSelectedNode(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating user group mapping:', error);
      toast.error('Failed to update user mapping');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedNode, selectedUsers, unitId, unitName, fetchData]);

  const handleEditNode = useCallback((node: FlattenedNode) => {
    setSelectedNode(node);
    setIsEditMode(true);
    setSelectedUsers(node.mappedUser);
    setAddUserDialogOpen(true);
  }, []);

  const handleAddNode = useCallback((node: FlattenedNode) => {
    setSelectedNode(node);
    setIsEditMode(false);
    setSelectedUsers([]);
    setAddUserDialogOpen(true);
  }, []);

  const handleAddDepartment = useCallback(() => {
    setSelectedNode({
      id: 0,
      groupName: '',
      description: '',
      isRoleGroup: false,
      roleId: null,
      isServiceCategory: true,
      mappedUser: [],
      unitId,
      createdBy: '',
    });
    setIsEditMode(false);
    setAddUserDialogOpen(true);
  }, [unitId]);

  const getDepartmentDataForName = useCallback(
    (departmentName: string) => getDepartmentData(departmentName, flattenedData),
    [flattenedData]
  );

  return {
    chartData,
    loading,
    error,
    flattenedData,
    addUserDialogOpen,
    selectedNode,
    isEditMode,
    selectedUsers,
    isSubmitting,
    setAddUserDialogOpen,
    setSelectedUsers,
    fetchData,
    handleAddUser,
    handleEditNode,
    handleAddNode,
    handleAddDepartment,
    getDepartmentDataForName,
    shouldAllowMultiSelect,
  };
};
