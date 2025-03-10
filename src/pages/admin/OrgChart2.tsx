import { AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { Group, Plus, UserPlus, Users, User } from 'lucide-react';
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

const StyledNode = styled.div<{ isCommittee?: boolean }>`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.isCommittee ? '#ff9800' : '#2196f3')};
  display: inline-block;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;

  &:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

const NodeLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
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
  name: 'Alok Kumar',
  role: 'Managing Director',
  children: [
    {
      name: 'Executive Committee',
      role: 'Committee',
      isCommittee: true,
      members: [
        { name: 'Rajesh Kumar', role: 'Committee Member', isCommittee: true },
        { name: 'Rajesh Kumar', role: 'Committee Member', isCommittee: true },
        { name: 'Rajesh Kumar', role: 'Committee Member', isCommittee: true },
        { name: 'Rajesh Kumar', role: 'Committee Member', isCommittee: true },
      ],
      children: [
        {
          name: 'Raghuveer Singh',
          role: 'Nodal Officer',
          children: [
            {
              name: 'Naveen Kumar',
              role: 'Head of IT Department',
              children: [],
            },
            {
              name: 'Rajesh Kumar',
              role: 'Head of HR Department',
              children: [],
            },
            {
              name: 'Rajesh Kumar',
              role: 'Head of Finance Department',
              children: [],
            },
            {
              name: 'Rajesh Kumar',
              role: 'Head of Other Department',
              children: [],
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
  const [selectedNode, setSelectedNode] = React.useState<OrgNode | null>(null);
  const [newUserName, setNewUserName] = React.useState('');
  const [newGroupName, setNewGroupName] = React.useState('');
  const [newGroupDescription, setNewGroupDescription] = React.useState('');

  const handleAddUser = () => {
    if (!selectedNode || !newUserName) return;

    const newData = JSON.parse(JSON.stringify(chartData));

    const findNodeAndUpdate = (node: OrgNode): boolean => {
      if (node.name === selectedNode.name && node.role === selectedNode.role) {
        // Always add as a member to the current node
        if (!node.members) {
          node.members = [];
        }
        node.members.push({
          name: newUserName,
          role: 'Member',
          isCommittee: false,
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
    } else if (newData.name === selectedNode.name && newData.role === selectedNode.role) {
      // Handle root node
      if (!newData.members) {
        newData.members = [];
      }
      newData.members.push({
        name: newUserName,
        role: 'Member',
        isCommittee: false,
      });
      setChartData(newData);
    }

    setAddUserDialogOpen(false);
    setNewUserName('');
    setSelectedNode(null);
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

  const RenderNode = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
    return (
      <StyledNode isCommittee={node.isCommittee}>
        <div className="flex flex-row gap-2">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <NodeLabel>{node.name}</NodeLabel>
            <div style={{ fontSize: '12px', color: '#666' }}>{node.role}</div>
          </div>
          {(!node.isCommittee || (node.isCommittee && node.role !== 'Committee Member')) && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="ml-auto px-1 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  setAddUserDialogOpen(true);
                }}
              >
                <div className="flex gap-0 items-center ">
                  <User className="w-4 h-4" />+
                </div>
              </Button>
              {level > 2 && (
                <Button
                  variant="ghost"
                  className="ml-auto px-1 p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                    setAddGroupDialogOpen(true);
                  }}
                >
                  <div className="flex gap-0.5 items-center ">
                    <Users className="w-4 h-4" />+
                  </div>
                </Button>
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
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Add a new user at the same level as {selectedNode?.name} with role: {selectedNode?.role}
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
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
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
            <Button onClick={handleAddGroup}>Add Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrgChart2;
