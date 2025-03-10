import { AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { Group, Plus, UserPlus, Users, User, Pencil } from 'lucide-react';
import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';
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

const StyledNode = styled.div<{ isCommittee?: boolean; role?: string }>`
  padding: 10px 15px;
  border-radius: ${(props) => (props.isCommittee && props.role === 'Committee Member' ? '40%' : '16px')};
  border: 1px solid ${(props) => (props.isCommittee ? '#ff9800' : '#2196f3')};
  display: inline-block;
  background: ${(props) => (props.role !== 'Committee Member' ? '#ff9800' : 'white')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;

  &:hover {
    background: ${(props) => (props.role !== 'Committee Member' ? '#f57c00' : '#f5f5f5')};
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

const NodeLabel = styled.div<{ role?: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.role !== 'Committee Member' ? 'white' : '#333')};
`;

const RoleText = styled.div<{ role?: string }>`
  font-size: 12px;
  color: ${(props) => (props.role !== 'Committee Member' ? 'rgba(255, 255, 255, 0.9)' : '#666')};
`;

const CommitteeLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  min-width: 1200px;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: #2196f3;
  }

  &::before {
    right: calc(50% + 100px);
  }

  &::after {
    left: calc(50% + 100px);
  }
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  position: relative;
  justify-content: flex-end;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 20px;
    height: 2px;
    background-color: #2196f3;
  }

  &:first-child::after {
    right: -20px;
  }

  &:last-child {
    justify-content: flex-start;
    &::after {
      left: -20px;
    }
  }
`;

// Define the type for our org chart data
interface OrgNode {
  name: string;
  role: string;
  children?: OrgNode[];
  members?: OrgNode[];
  isCommittee?: boolean;
}

// Sample data structure
const orgData: OrgNode = {
  name: '',
  role: 'Managing Director',
  children: [
    {
      name: 'Committee',
      role: 'Committee',
      isCommittee: true,
      members: [],
      children: [
        {
          name: '',
          role: 'Nodal Officer',
          children: [
            {
              name: '',
              role: 'IT ',
              children: [
                {
                  name: '',
                  role: 'HOD',
                  children: [],
                },
              ],
            },
            {
              name: '',
              role: 'HR ',
              children: [
                {
                  name: '',
                  role: 'HOD',
                  children: [],
                },
              ],
            },
            {
              name: '',
              role: 'Finance ',
              children: [
                {
                  name: '',
                  role: 'HOD',
                  children: [],
                },
              ],
            },
            {
              name: '',
              role: 'Miscellaneous ',
              children: [
                {
                  name: '',
                  role: 'HOD',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const OrgChart2 = () => {
  const [chartData, setChartData] = React.useState<OrgNode>(orgData);
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = React.useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<OrgNode | null>(null);
  const [newUserName, setNewUserName] = React.useState('');
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newGroupDescription, setNewGroupDescription] = React.useState('');
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'category' | 'addressal'>('category');
  const [departmentName, setDepartmentName] = React.useState('');
  const [addressalName, setAddressalName] = React.useState('');

  const handleAddUser = () => {
    if (!selectedNode || !newUserName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode, level: number): boolean => {
      if (node.name === selectedNode.name && node.role === selectedNode.role) {
        // For MD (level 0) and Nodal Officer (level 2), update both name and members
        if (level === 0 || level === 2 || level === 3 || level === 4) {
          // Update the node's own name
          node.name = newUserName;

          // Update or  create members array
          if (!node.members) {
            node.members = [];
          }

          if (isEditMode) {
            // In edit mode, update the existing member
            node.members[0] = {
              name: newUserName,
              role: level === 0 ? 'Managing Director' : 'Nodal Officer',
              isCommittee: false,
            };
          } else {
            // In add mode, add new member
            node.members.push({
              name: newUserName,
              role: level === 0 ? 'Managing Director' : 'Nodal Officer',
              isCommittee: false,
            });
          }
        } else {
          // For committees, only update members array
          if (!node.members) {
            node.members = [];
          }
          node.members.push({
            name: newUserName,
            role: 'Committee Member',
            isCommittee: true,
          });
        }
        return true;
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (findNodeAndUpdate(node.children[i], level + 1)) {
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
    setSelectedNode(null);
    setIsEditMode(false);
  };

  const handleAddGroup = () => {
    if (!selectedNode || !newGroupName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode): boolean => {
      if (node.name === selectedNode.name && node.role === selectedNode.role) {
        // Add new group below the current node
        if (!node.children) {
          node.children = [];
        }
        node.children.push({
          name: newGroupName,
          role: newGroupDescription || 'Group',
          children: [],
        });
        return true;
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (findNodeAndUpdate(node.children[i])) {
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
    setSelectedNode(null);
  };

  const handleAddCategory = () => {
    if (!selectedNode || !newGroupName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode): boolean => {
      if (node.name === selectedNode.name && node.role === selectedNode.role) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push({
          name: newGroupName,
          role: newGroupDescription || 'Category',
          children: [],
        });
        return true;
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (findNodeAndUpdate(node.children[i])) {
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
      if (node.name === selectedNode.name && node.role === selectedNode.role) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push({
          name: departmentName,
          role: addressalName,
          children: [],
        });
        return true;
      }

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (findNodeAndUpdate(node.children[i])) {
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
    const hasMember = node.members && node.members.length > 0;
    const isSingleMemberRole = level === 0 || level === 2; // MD and Nodal Officer only
    const isHOD = node.role.includes('HOD');
    const canAddGroup = isHOD && node.name !== '';

    // Function to check if parent nodes have required data
    const checkParentNodes = (currentNode: OrgNode): boolean => {
      if (level === 0) return true; // Root node is always enabled

      // Find parent node in the tree
      const findParent = (node: OrgNode, targetNode: OrgNode, parent: OrgNode | null = null): OrgNode | null => {
        if (node === targetNode) return parent;

        if (node.children) {
          for (const child of node.children) {
            const result = findParent(child, targetNode, node);
            if (result) return result;
          }
        }
        return null;
      };

      const parent = findParent(chartData, currentNode);
      if (!parent) return true;

      // Check if parent has required data
      if (parent.role === 'Managing Director' || parent.role === 'Nodal Officer') {
        return parent.members && parent.members.length > 0;
      }
      if (parent.role === 'HOD') {
        return parent.name !== '';
      }
      return true;
    };

    const isParentValid = checkParentNodes(node);

    return (
      <StyledNode isCommittee={node.isCommittee} role={node.role}>
        <div className="flex flex-row gap-2">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 items-center">
            <NodeLabel role={node.role}>{node.name}</NodeLabel>
            {node.role !== 'Committee' && <RoleText role={node.role}>{node.role}</RoleText>}
          </div>
          {(!node.isCommittee || (node.isCommittee && node.role !== 'Committee Member')) && (
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
                      setNewUserName(node.members?.[0]?.name || '');
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
                // For committee members
                <Button
                  variant="ghost"
                  className="ml-auto px-1 p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setIsEditMode(false);
                    setNewUserName('');
                    setAddUserDialogOpen(true);
                  }}
                  disabled={!isParentValid}
                >
                  <div className="flex gap-0 items-center">
                    <User className="w-4 h-4" />+
                  </div>
                </Button>
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
                      <Plus className="w-4 h-4" />
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
    if (data.isCommittee && data.members) {
      // Split members into left and right groups
      const midPoint = Math.ceil(data.members.length / 2);
      const leftMembers = data.members.slice(0, midPoint);
      const rightMembers = data.members.slice(midPoint);

      return (
        <TreeNode
          label={
            <CommitteeLayout>
              {/* Left Members */}
              <MembersList style={{ alignItems: 'flex-end' }}>
                {leftMembers.map((member, index) => (
                  <RenderNode key={`left-${index}`} node={member} level={level} />
                ))}
              </MembersList>

              {/* Committee role */}
              <RenderNode node={data} level={level} />

              {/* Right Members */}
              <MembersList style={{ alignItems: 'flex-start' }}>
                {rightMembers.map((member, index) => (
                  <RenderNode key={`right-${index}`} node={member} level={level} />
                ))}
              </MembersList>
            </CommitteeLayout>
          }
        >
          {data.children?.map((child, index) => (
            <RenderTree key={index} data={child} level={level + 1} />
          ))}
        </TreeNode>
      );
    }

    return (
      <TreeNode label={<RenderNode node={data} level={level} />}>
        {data.children?.map((child, index) => (
          <RenderTree key={index} data={child} level={level + 1} />
        ))}
      </TreeNode>
    );
  };

  return (
    <div style={{ padding: '40px', background: '#f9f9f9', minHeight: '100vh', overflowX: 'auto' }}>
      <Tree
        lineWidth={'2px'}
        lineColor={'#2196f3'}
        lineBorderRadius={'10px'}
        label={<RenderNode node={chartData} level={0} />}
      >
        {chartData.children?.map((child, index) => (
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
                ? `Edit user for ${selectedNode?.name} with role: ${selectedNode?.role}`
                : `Add a new user ${selectedNode?.name ? `for ${selectedNode.name}` : ''} with role: ${
                    selectedNode?.role
                  }`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">User Name</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
              />
            </div>
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
            <Button onClick={handleAddUser}>{isEditMode ? 'Update User' : 'Add User'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>Add a new group below {selectedNode?.name}</DialogDescription>
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
            <DialogDescription>Add a new item below {selectedNode?.name}</DialogDescription>
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

export default OrgChart2;
