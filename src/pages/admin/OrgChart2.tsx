import { AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { Plus } from 'lucide-react';
import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';

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

  const addChild = (parentNode: OrgNode) => {
    // Create a deep copy of the current chart data
    const newData = JSON.parse(JSON.stringify(chartData));

    // Helper function to find and update the target node
    const updateNode = (node: OrgNode): boolean => {
      if (node === parentNode) {
        // Initialize children array if it doesn't exist
        if (!node.children) {
          node.children = [];
        }
        // Add new child
        node.children.push({
          name: 'New Member',
          role: 'New Role',
          children: [],
        });
        return true;
      }

      if (node.children) {
        for (let child of node.children) {
          if (updateNode(child)) return true;
        }
      }
      return false;
    };

    updateNode(newData);
    setChartData(newData);
  };

  const RenderNode = ({ node }: { node: OrgNode }) => {
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
          {!node.isCommittee && (
            <Button
              variant="ghost"
              className="ml-auto px-1 p-2"
              onClick={(e) => {
                e.stopPropagation();
                addChild(node);
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </StyledNode>
    );
  };

  const RenderTree = ({ data }: { data: OrgNode }) => {
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
                  <RenderNode key={`left-${index}`} node={member} />
                ))}
              </MembersList>

              {/* Committee role */}
              <RenderNode node={data} />

              {/* Right Members */}
              <MembersList style={{ alignItems: 'flex-start' }}>
                {rightMembers.map((member, index) => (
                  <RenderNode key={`right-${index}`} node={member} />
                ))}
              </MembersList>
            </CommitteeLayout>
          }
        >
          {data.children?.map((child, index) => (
            <RenderTree key={index} data={child} />
          ))}
        </TreeNode>
      );
    }

    return (
      <TreeNode label={<RenderNode node={data} />}>
        {data.children?.map((child, index) => (
          <RenderTree key={index} data={child} />
        ))}
      </TreeNode>
    );
  };

  return (
    <div style={{ padding: '40px', background: '#f9f9f9', minHeight: '100vh', overflowX: 'auto' }}>
      <Tree lineWidth={'2px'} lineColor={'#2196f3'} lineBorderRadius={'10px'} label={<RenderNode node={chartData} />}>
        {chartData.children?.map((child, index) => (
          <RenderTree key={index} data={child} />
        ))}
      </Tree>
    </div>
  );
};

export default OrgChart2;
