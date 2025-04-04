import { AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { Group, Plus, UserPlus, Users, User, Pencil } from 'lucide-react';
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
import axiosInstance from '@/services/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import UserSelect from '@/components/org-chart/UserSelect';

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

const NonOrgChart = () => {
  const [chartData, setChartData] = React.useState<OrgNode | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = React.useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<OrgNode | null>(null);
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserCode, setNewUserCode] = React.useState('');
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newGroupDescription, setNewGroupDescription] = React.useState('');
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'category' | 'addressal'>('category');
  const [departmentName, setDepartmentName] = React.useState('');
  const [addressalName, setAddressalName] = React.useState('');
  const [isHOD, setIsHOD] = React.useState(false);
  const [isServiceCategory, setIsServiceCategory] = React.useState(false);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/Admin/GetOrgGroupHierarchy?unitId=396');
        const result = await response.data;
        // console.log(result.data);

        setChartData(result.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddUser = () => {
    if (!selectedNode || !newUserName || !newUserCode) return;
    const newData = JSON.parse(JSON.stringify(chartData));
    if (!newData) return;

    const findNodeAndUpdate = (node: OrgNode, level: number): boolean => {
      if (node.id === selectedNode.id) {
        node.groupName = newUserName;

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
        //    console.log(node.mappedUser);
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
    setSelectedNode(null);
    setIsEditMode(false);
  };

  const handleAddGroup = () => {
    if (!selectedNode || !newGroupName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode): boolean => {
      if (node.id === selectedNode.id) {
        // Add new group below the current node
        if (!node.childGroups) {
          node.childGroups = [];
        }
        node.childGroups.push({
          id: Math.max(...node.childGroups.map((g) => g.id)) + 1,
          groupName: newGroupName,
          description: newGroupDescription || 'Group',
          isCommitee: false,
          isHOD: isHOD,
          isServiceCategory: isServiceCategory,
          parentGroupId: node.id,
          unitId: node.unitId,
          childGroups: [],
          mappedUser: [],
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

    setAddGroupDialogOpen(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsHOD(false);
    setIsServiceCategory(false);
    setSelectedNode(null);
  };

  const handleAddCategory = () => {
    if (!selectedNode || !newGroupName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode): boolean => {
      if (node.id === selectedNode.id) {
        if (!node.childGroups) {
          node.childGroups = [];
        }
        node.childGroups.push({
          id: 0,
          groupName: newGroupName,
          description: newGroupDescription || 'Category',
          isCommitee: false,
          isHOD: false,
          isServiceCategory: false,
          parentGroupId: node.id,
          unitId: node.unitId,
          childGroups: [],
          mappedUser: [],
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
    setSelectedNode(null);
  };

  const handleAddAddressal = () => {
    if (!selectedNode || !departmentName || !addressalName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode): boolean => {
      if (node.id === selectedNode.id) {
        if (!node.childGroups) {
          node.childGroups = [];
        }
        node.childGroups.push({
          id: 0,
          groupName: departmentName,
          description: addressalName,
          isCommitee: false,
          isHOD: false,
          isServiceCategory: false,
          parentGroupId: node.id,
          unitId: node.unitId,
          childGroups: [],
          mappedUser: [],
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
    setDepartmentName('');
    setAddressalName('');
    setSelectedNode(null);
  };

  const RenderNode = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
    const hasMember = node.mappedUser && node.mappedUser.length > 0;
    const isSingleMemberRole = level === 0 || level === 2;
    const isHOD = node.description.includes('HOD');
    const canAddGroup = isHOD && node.groupName !== '';

    // Function to check if parent nodes have required data
    const checkParentNodes = (currentNode: OrgNode): boolean => {
      if (level === 0) return true; // Root node is always enabled

      // Find parent node in the tree
      const findParent = (node: OrgNode, targetNode: OrgNode, parent: OrgNode | null = null): OrgNode | null => {
        if (node === targetNode) return parent;

        if (node.childGroups) {
          for (const child of node.childGroups) {
            const result = findParent(child, targetNode, node);
            if (result) return result;
          }
        }
        return null;
      };

      const parent = findParent(chartData, currentNode);
      if (!parent) return true;

      // Check if parent has required data
      if (parent.description === 'Managing Director' || parent.description === 'Nodal Officer') {
        return parent.mappedUser && parent.mappedUser.length > 0;
      }
      if (parent.description === 'HOD') {
        return parent.groupName !== '';
      }
      return true;
    };

    const isParentValid = checkParentNodes(node);

    return (
      <StyledNode isCommittee={node.isCommitee} role={node.description}>
        <div className="flex flex-row gap-2">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{node.groupName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 items-center">
            <NodeLabel role={node.description}>{node.groupName}</NodeLabel>
            {node.description !== 'Committee' && <RoleText role={node.description}>{node.description}</RoleText>}
          </div>
          {(!node.isCommitee || (node.isCommitee && node.description !== 'Committee Member')) && (
            <div className="flex gap-2">
              {/* For MD and Nodal Officer only */}
              {isSingleMemberRole ? (
                hasMember ? (
                  <Button
                    variant="ghost"
                    className="ml-auto px-1 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                      setIsEditMode(true);
                      setNewUserName(node.mappedUser?.[0]?.userDetail || '');
                      setNewUserCode(node.mappedUser?.[0]?.userCode || '');
                      setAddUserDialogOpen(true);
                    }}
                    disabled={!isParentValid}
                  >
                    <div className="flex gap-0 items-center">
                      <Pencil className="w-4 h-4" />
                    </div>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="ml-auto px-1 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                      setIsEditMode(false);
                      setNewUserName('');
                      setNewUserCode('');
                      setAddUserDialogOpen(true);
                    }}
                    disabled={!isParentValid}
                  >
                    <div className="flex gap-0 items-center">
                      <User className="w-4 h-4" />+
                    </div>
                  </Button>
                )
              ) : (
                // Allow adding users to Committee level and other levels except 3 and 4

                level !== 4 && (
                  <Button
                    variant="ghost"
                    className="ml-auto px-1 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                      setIsEditMode(false);
                      setNewUserName('');
                      setNewUserCode('');
                      setAddUserDialogOpen(true);
                    }}
                    disabled={!isParentValid}
                  >
                    <div className="flex gap-0 items-center">
                      <User className="w-4 h-4" />+
                    </div>
                  </Button>
                )
              )}
              {level === 4 && (
                <>
                  <Button
                    variant="ghost"
                    className="ml-auto px-1 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                      setIsEditMode(false);
                      setNewUserName('');
                      setNewUserCode('');
                      setAddUserDialogOpen(true);
                    }}
                    disabled={!isParentValid}
                  >
                    <div className="flex gap-0 items-center">
                      <User className="w-4 h-4" />+
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="ml-auto px-1 p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                      setAddCategoryDialogOpen(true);
                    }}
                    disabled={!isParentValid}
                  >
                    <div className="flex gap-0.5 items-center">
                      <Users /> <Plus className="w-4 h-4" />
                    </div>
                  </Button>
                </>
              )}
            </div>
          )}
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
                  <StyledNode key={`left-${index}`} isCommittee={true} role="Committee Member">
                    <div className="flex flex-row gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{member.userDetail.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 items-center">
                        <NodeLabel role="Committee Member">{member.userDetail}</NodeLabel>
                        <RoleText role="Committee Member">Committee Member</RoleText>
                      </div>
                    </div>
                  </StyledNode>
                ))}
              </MembersList>

              <RenderNode node={data} level={level} />

              <MembersList style={{ alignItems: 'flex-start' }}>
                {rightMembers.map((member, index) => (
                  <StyledNode key={`right-${index}`} isCommittee={true} role="Committee Member">
                    <div className="flex flex-row gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{member.userDetail.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 items-center">
                        <NodeLabel role="Committee Member">{member.userDetail}</NodeLabel>
                        <RoleText role="Committee Member">Committee Member</RoleText>
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
    return <div>Loading...</div>;
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
              value={selectedNode?.mappedUser || []}
              onChange={(users) => {
                if (isEditMode) {
                  setNewUserCode(users[0]?.userCode || '');
                  setNewUserName(users[0]?.userDetail || '');
                } else {
                  setNewUserCode(users[0]?.userCode || '');
                  setNewUserName(users[0]?.userDetail || '');
                }
              }}
              isMulti={false}
              label="Select User"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUserDialogOpen(false);
                setIsEditMode(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={!newUserName || !newUserCode}>
              {isEditMode ? 'Update User' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>Add a new group below {selectedNode?.groupName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isHOD" checked={isHOD} onChange={(e) => setIsHOD(e.target.checked)} />
              <Label htmlFor="isHOD">Is HOD</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isServiceCategory"
                checked={isServiceCategory}
                onChange={(e) => setIsServiceCategory(e.target.checked)}
              />
              <Label htmlFor="isServiceCategory">Is Service Category</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGroup} disabled={!newGroupName}>
              Add Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category/Addressal Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>Add a new item below {selectedNode?.groupName}</DialogDescription>
          </DialogHeader>
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'category' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('category')}
            >
              Add Category
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'addressal' ? 'border-b-2 border-primary' : ''}`}
              onClick={() => setActiveTab('addressal')}
            >
              Add Addressal
            </button>
          </div>
          {activeTab === 'category' ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory} disabled={!newGroupName}>
                  Add Category
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addressalName">Addressal Name</Label>
                  <Input
                    id="addressalName"
                    value={addressalName}
                    onChange={(e) => setAddressalName(e.target.value)}
                    placeholder="Enter addressal name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAddressal} disabled={!departmentName || !addressalName}>
                  Add Addressal
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NonOrgChart;
