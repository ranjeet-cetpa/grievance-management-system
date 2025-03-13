import { OrgNode, FlattenedNode } from '@/types/orgChart';

export const flattenOrgChart = (
  node: OrgNode,
  parentId: number | null = null,
  level: number = 0,
  result: FlattenedNode[] = []
): FlattenedNode[] => {
  const currentNode: FlattenedNode = {
    id: node?.id,
    groupName: node?.groupName,
    description: node.description,
    isRoleGroup: node.isRoleGroup,
    roleId: node.roleId,
    isServiceCategory: node.isServiceCategory,
    createdBy: node?.createdBy,
    mappedUser: node.mappedUser || [],
    parentGroupId: parentId,
    unitId: node.unitId,
  };

  result.push(currentNode);

  if (node.childGroups) {
    node.childGroups.forEach((child) => {
      flattenOrgChart(child, node.id, level + 1, result);
    });
  }

  return result;
};

export const getDepartmentData = (departmentName: string, flattenedData: FlattenedNode[]) => {
  const nodalOfficer = flattenedData.find((node) => node.roleId === 4);
  if (!nodalOfficer) return { hod: null, categories: [] };

  const departmentGroup = flattenedData.find(
    (node) => node.groupName === departmentName && node.parentGroupId === nodalOfficer.id
  );

  if (!departmentGroup) return { hod: null, categories: [] };

  const hodGroup = flattenedData.find((node) => node.parentGroupId === departmentGroup.id && node.roleId === 6);
  const categories = hodGroup
    ? flattenedData.filter((node) => node.parentGroupId === hodGroup.id && node.isServiceCategory)
    : [];

  return {
    hod: hodGroup || null,
    categories: categories,
  };
};

export const shouldAllowMultiSelect = (node: FlattenedNode | null): boolean => {
  if (!node) return false;

  if (node.isRoleGroup) {
    if (node.roleId === 2) return false; // MD
    if (node.roleId === 4) return false; // Nodal Officer
    if (node.roleId === 6) return false; // HOD
  }

  return true;
};
