import { AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { Plus, UserPlus, Users, User, Pencil, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import React, { useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StyledNode, NodeLabel, RoleText, CommitteeLayout, MembersList } from '@/components/org-chart/StyledOrgChart';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import UserSelect from '@/components/org-chart/UserSelect';
import Loader from '@/components/ui/loader';
import axios from 'axios';
import axiosInstance from '@/services/axiosInstance';

// Define the type for our org chart data
interface UserDetails {
  userCode: string;
  userDetail: string;
  departments: string[];
}

interface OrgNode {
  id: number;
  groupName: string;
  description: string;
  isCommitee: boolean;
  isHOD: boolean;
  isServiceCategory: boolean;
  unitId?: string;
  parentGroupId?: number | null;
  childGroups: OrgNode[];
  mappedUser: UserDetails[];
}

interface NonCorporateOfficeChartProps {
  unitId: number;
}

const NonCorporateOfficeChart: React.FC<NonCorporateOfficeChartProps> = ({ unitId }) => {
  const [chartData, setChartData] = React.useState<OrgNode | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<OrgNode | null>(null);
  const [showMappedUsersDialog, setShowMappedUsersDialog] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserCode, setNewUserCode] = React.useState('');
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newGroupDescription, setNewGroupDescription] = React.useState('');
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<UserDetails[]>([]);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  // console.log(employeeList);
  const user = useSelector((state: RootState) => state.user);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  //console.log(employeeList);

  const dataFetcher = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/Admin/GetOrgGroupHierarchy?unitId=${unitId}`);
      const result = await response.data;
      //   console.log(result.data);
      setChartData(result.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch organization data');
      toast.error('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dataFetcher();
  }, [unitId]);

  const handleAddUser = async () => {
    if (!selectedNode) return;

    try {
      setIsSubmitting(true);
      const requestBody = {
        groupMasterId: selectedNode.id,
        unitId: selectedNode.unitId || unitId,
        unitName: selectedNode.groupName,
        userCodes: selectedNode.isCommitee
          ? selectedUsers.map((user) => ({
              userCode: user.userCode,
              userDetails: user.userDetail,
              departments: [],
            }))
          : [
              {
                userCode: newUserCode,
                userDetails: newUserName,
                departments: [],
              },
            ],
      };

      await axiosInstance.post('/Admin/UpdateUserGroupMapping', requestBody);
      toast.success('User mapping updated successfully');

      const newData = JSON.parse(JSON.stringify(chartData));
      if (!newData) return;

      const findNodeAndUpdate = (node: OrgNode, level: number): boolean => {
        if (node.id === selectedNode.id) {
          if (node.isCommitee) {
            node.mappedUser = selectedUsers;
          } else {
            if (!node.mappedUser) {
              node.mappedUser = [];
            }

            if (isEditMode) {
              node.mappedUser[0] = {
                userCode: newUserCode,
                userDetail: newUserName,
                departments: [],
              };
            } else {
              node.mappedUser.push({
                userCode: newUserCode,
                userDetail: newUserName,
                departments: [],
              });
            }
          }
          return true;
        }

        if (node.childGroups) {
          for (let i = 0; i < node.childGroups.length; i++) {
            if (findNodeAndUpdate(node.childGroups[i], level + 1)) {
              return true;
            }
          }
        }
        return false;
      };

      if (findNodeAndUpdate(newData, 0)) {
        setChartData(newData);
      }

      setAddUserDialogOpen(false);
      setNewUserName('');
      setNewUserCode('');
      setSelectedUsers([]);
      setSelectedNode(null);
      setIsEditMode(false);
      dataFetcher();
    } catch (error) {
      console.error('Error updating user group mapping:', error);
      toast.error('Failed to update user mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!selectedNode || !newGroupName || selectedUsers.length === 0) return;

    try {
      setIsSubmitting(true);
      const requestBody = {
        id: 0,
        groupName: newGroupName,
        description: newGroupDescription || '',
        isCommitee: false,
        isHOD: false,
        isServiceCategory: true,
        parentGroupId: selectedNode.id,
        unitId: selectedNode.unitId || unitId,
        unitName: selectedNode.groupName,
        createdBy: user?.EmpCode,
        childGroup: null,
        mappedUser: selectedUsers.map((user) => ({
          userCode: user.userCode,
          userDetail: user.userDetail,
          departments: user.departments || [],
        })),
      };

      await axiosInstance.post('/Admin/AddUpdateGroupNew', requestBody);
      toast.success('Sub Section added successfully');

      const newData = JSON.parse(JSON.stringify(chartData));
      if (!newData) return;

      const findNodeAndUpdate = (node: OrgNode): boolean => {
        if (node.id === selectedNode.id) {
          if (!node.childGroups) {
            node.childGroups = [];
          }
          node.childGroups.push({
            id: 0,
            groupName: newGroupName,
            description: newGroupDescription || 'Category',
            isCommitee: true,
            isHOD: false,
            isServiceCategory: true,
            parentGroupId: node.id,
            unitId: node.unitId,
            childGroups: [],
            mappedUser: selectedUsers,
          });
          return true;
        }

        if (node.childGroups) {
          for (let i = 0; i < node.childGroups.length; i++) {
            if (findNodeAndUpdate(node.childGroups[i])) {
              return true;
            }
          }
        }
        return false;
      };

      if (findNodeAndUpdate(newData)) {
        setChartData(newData);
      }

      setAddCategoryDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setSelectedUsers([]);
      setSelectedNode(null);
      dataFetcher();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RenderNode = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
    const hasMember = node.mappedUser && node.mappedUser.length > 0;
    const isSingleMemberRole = level === 0 || level === 1;
    const isNodalOfficer = node.description === 'Nodal Officer';

    return (
      <StyledNode isCommittee={node.isCommitee} role={node.description}>
        <div className="flex flex-row gap-2">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{node.groupName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 items-center">
            {level !== 2 && <NodeLabel role={node.description}>{node?.mappedUser?.[0]?.userDetail}</NodeLabel>}
            {level === 2 && <NodeLabel role={node.description}>{node?.groupName}</NodeLabel>}
            {node.description !== 'Committee' && <RoleText role={node.description}>{node.description}</RoleText>}
          </div>
          <div className="flex gap-2">
            {level === 2 && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto px-1 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  setShowMappedUsersDialog(true);
                }}
              >
                <div className="flex gap-0.5 items-center">
                  <Info className="w-4 h-4" />
                </div>
              </Button>
            )}
          </div>
        </div>
      </StyledNode>
    );
  };

  const RenderTree = ({ data, level = 0 }: { data: OrgNode; level?: number }) => {
    if (data.isCommitee && data.mappedUser && data.mappedUser.length > 0) {
      const midPoint = Math.ceil(data.mappedUser.length / 2);
      const leftMembers = data.mappedUser.slice(0, midPoint);
      const rightMembers = data.mappedUser.slice(midPoint);

      return (
        <TreeNode
          label={
            <CommitteeLayout>
              <MembersList style={{ alignItems: 'flex-end' }}>
                {leftMembers.map((member, index) => (
                  <StyledNode key={`left-${index}`} isCommittee={true} role="Category Member">
                    <div className="flex flex-row gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{member.userDetail.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 items-center">
                        <NodeLabel role="Category Member">{member.userDetail}</NodeLabel>
                        <RoleText role="Category Member">Category Member</RoleText>
                      </div>
                    </div>
                  </StyledNode>
                ))}
              </MembersList>

              <RenderNode node={data} level={level} />

              <MembersList style={{ alignItems: 'flex-start' }}>
                {rightMembers.map((member, index) => (
                  <StyledNode key={`right-${index}`} isCommittee={true} role="Category Member">
                    <div className="flex flex-row gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{member.userDetail.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 items-center">
                        <NodeLabel role="Category Member">{member.userDetail}</NodeLabel>
                        <RoleText role="Category Member">Category Member</RoleText>
                      </div>
                    </div>
                  </StyledNode>
                ))}
              </MembersList>
            </CommitteeLayout>
          }
        >
          {data.childGroups?.map((child, index) => (
            <RenderTree key={index} data={child} level={level + 1} />
          ))}
        </TreeNode>
      );
    }

    return (
      <TreeNode label={<RenderNode node={data} level={level} />}>
        {data.childGroups?.map((child, index) => (
          <RenderTree key={index} data={child} level={level + 1} />
        ))}
      </TreeNode>
    );
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!chartData) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ padding: '40px', background: '#f9f9f9', minHeight: '100vh', overflowX: 'auto' }}>
      <Tree
        lineWidth={'2px'}
        lineColor={'#2196f3'}
        lineBorderRadius={'10px'}
        label={<RenderNode node={chartData} level={0} />}
      >
        {chartData.childGroups?.map((child, index) => (
          <RenderTree key={index} data={child} level={1} />
        ))}
      </Tree>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Edit user for ${selectedNode?.groupName} with role: ${selectedNode?.description}`
                : `Add a new user ${selectedNode?.groupName ? `for ${selectedNode.groupName}` : ''} with role: ${
                    selectedNode?.description
                  }`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <UserSelect
              employees={employeeList}
              value={selectedNode?.isCommitee ? selectedUsers : [{ userCode: newUserCode, userDetail: newUserName }]}
              onChange={(users) => {
                if (selectedNode?.isCommitee) {
                  setSelectedUsers(
                    users.map((user) => ({
                      userCode: user.userCode,
                      userDetail: user.userDetail,
                      departments: [],
                    }))
                  );
                } else {
                  setNewUserCode(users[0]?.userCode || '');
                  setNewUserName(users[0]?.userDetail || '');
                }
              }}
              isMulti={selectedNode?.isCommitee}
              label="Select User"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUserDialogOpen(false);
                setIsEditMode(false);
                setSelectedUsers([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={
                selectedNode?.isCommitee ? selectedUsers.length === 0 : !newUserName || !newUserCode || isSubmitting
              }
            >
              {isSubmitting ? <Loader className="w-4 h-4 mr-2" /> : null}
              {isEditMode ? 'Update User' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Add a new category below {selectedNode?.groupName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter category name"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter category description"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <UserSelect
                employees={employeeList}
                value={selectedUsers}
                onChange={(users) =>
                  setSelectedUsers(
                    users.map((user) => ({
                      userCode: user.userCode,
                      userDetail: user.userDetail,
                      departments: [],
                    }))
                  )
                }
                isMulti={true}
                label="Select Users"
              />
              {selectedUsers.length === 0 && (
                <Label className="text-red-500 text-xs">Minimum one user is required</Label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newGroupName || selectedUsers.length === 0 || isSubmitting}>
              {isSubmitting ? <Loader className="w-4 h-4 mr-2" /> : null}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapped Users Dialog */}
      <Dialog open={showMappedUsersDialog} onOpenChange={setShowMappedUsersDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Users mapped to {selectedNode?.groupName}</DialogTitle>
            {/* <DialogDescription>Users mapped to {selectedNode?.groupName}</DialogDescription> */}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedNode?.mappedUser && selectedNode.mappedUser.length > 0 ? (
              <div className="space-y-4">
                {selectedNode.mappedUser.map((user, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{user.userDetail.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.userDetail}</span>
                      <span className="text-sm text-gray-500">Code: {user.userCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No users mapped to this group</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMappedUsersDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NonCorporateOfficeChart;
