export interface UserDetails {
  userCode: string;
  userDetail: string;
  departments: string[];
}

export interface OrgNode {
  id: number;
  createdBy: string;
  groupName: string;
  description: string;
  isRoleGroup: boolean;
  roleId: number | null;
  isServiceCategory: boolean;
  unitId?: string;
  childGroups: OrgNode[];
  mappedUser: UserDetails[];
}

export interface FlattenedNode {
  id: number;
  groupName: string;
  description: string;
  isRoleGroup: boolean;
  roleId: number | null;
  isServiceCategory: boolean;
  mappedUser: UserDetails[];
  parentGroupId?: number | null;
  unitId?: string;
  createdBy: string;
}
