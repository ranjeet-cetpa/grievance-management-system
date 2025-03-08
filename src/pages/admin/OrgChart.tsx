import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Employee {
  id: string;
  name: string;
  position: string;
  avatar?: string;
}

interface OrgNode {
  id: string;
  employee: Employee;
  children: OrgNode[];
  leftNodes: OrgNode[];
  rightNodes: OrgNode[];
  isExpanded?: boolean;
}

const OrgChart: React.FC = () => {
  const [orgData, setOrgData] = useState<OrgNode>({
    id: '1',
    employee: {
      id: '1',
      name: 'Alok Shankar Pandey',
      position: 'MD',
      avatar: '/path/to/avatar.jpg',
    },
    children: [],
    leftNodes: [],
    rightNodes: [],
    isExpanded: true,
  });

  const handleAddNode = (parentId: string) => {
    const addNode = (node: OrgNode): OrgNode => {
      if (node.id === parentId) {
        const newNode: OrgNode = {
          id: Math.random().toString(36).substr(2, 9),
          employee: {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Employee Name',
            position: 'Role',
            avatar: '/path/to/default-avatar.jpg',
          },
          children: [],
          leftNodes: [],
          rightNodes: [],
          isExpanded: true,
        };
        return {
          ...node,
          children: [...node.children, newNode],
          leftNodes: node.leftNodes.map(addNode),
          rightNodes: node.rightNodes.map(addNode),
        };
      }

      return {
        ...node,
        children: node.children.map(addNode),
        leftNodes: node.leftNodes.map(addNode),
        rightNodes: node.rightNodes.map(addNode),
      };
    };

    setOrgData(addNode(orgData));
  };

  const handleDeleteNode = (nodeId: string) => {
    const deleteNode = (node: OrgNode, parent: OrgNode | null = null): OrgNode | null => {
      if (node.id === nodeId) {
        return null;
      }

      return {
        ...node,
        children: node.children
          .flatMap((child) => (child.id === nodeId ? child.children : [deleteNode(child, node)]))
          .filter((child): child is OrgNode => child !== null),
        leftNodes: node.leftNodes.filter((leftNode) => leftNode.id !== nodeId),
        rightNodes: node.rightNodes.filter((rightNode) => rightNode.id !== nodeId),
      };
    };

    const newOrgData = deleteNode(orgData);
    if (newOrgData) setOrgData(newOrgData);
  };

  const handleToggleExpand = (nodeId: string) => {
    const toggleNode = (node: OrgNode): OrgNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          isExpanded: !node.isExpanded,
        };
      }

      return {
        ...node,
        children: node.children.map(toggleNode),
        leftNodes: node.leftNodes.map(toggleNode),
        rightNodes: node.rightNodes.map(toggleNode),
      };
    };

    setOrgData(toggleNode(orgData));
  };

  const handleAddLeftNode = (parentId: string) => {
    const addNode = (node: OrgNode): OrgNode => {
      if (node.id === parentId) {
        const newNode: OrgNode = {
          id: Math.random().toString(36).substr(2, 9),
          employee: {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Left Employee',
            position: 'Left Role',
            avatar: '/path/to/default-avatar.jpg',
          },
          children: [],
          leftNodes: [],
          rightNodes: [],
          isExpanded: true,
        };
        return {
          ...node,
          leftNodes: [...node.leftNodes, newNode],
        };
      }

      return {
        ...node,
        children: node.children.map(addNode),
        leftNodes: node.leftNodes.map(addNode),
        rightNodes: node.rightNodes.map(addNode),
      };
    };

    setOrgData(addNode(orgData));
  };

  const handleAddRightNode = (parentId: string) => {
    const addNode = (node: OrgNode): OrgNode => {
      if (node.id === parentId) {
        const newNode: OrgNode = {
          id: Math.random().toString(36).substr(2, 9),
          employee: {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Right Employee',
            position: 'Right Role',
            avatar: '/path/to/default-avatar.jpg',
          },
          children: [],
          leftNodes: [],
          rightNodes: [],
          isExpanded: true,
        };
        return {
          ...node,
          rightNodes: [...node.rightNodes, newNode],
        };
      }

      return {
        ...node,
        children: node.children.map(addNode),
        leftNodes: node.leftNodes.map(addNode),
        rightNodes: node.rightNodes.map(addNode),
      };
    };

    setOrgData(addNode(orgData));
  };

  const NodeCard: React.FC<{ node: OrgNode }> = ({ node }) => (
    <Card className="relative flex items-center gap-4 p-2 bg-white rounded-full shadow-lg min-w-[300px]">
      <Avatar className="w-12 h-12">
        <AvatarImage src={node.employee.avatar} />
        <AvatarFallback className="bg-blue-100 text-blue-600">
          {node.employee.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-semibold">{node.employee.name}</div>
        <div className="text-sm text-gray-500">{node.employee.position}</div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-green-100 hover:bg-green-200"
          onClick={() => handleAddLeftNode(node.id)}
        >
          <ChevronDown className="w-4 h-4 -rotate-90 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-blue-100 hover:bg-blue-200"
          onClick={() => handleAddNode(node.id)}
        >
          <Plus className="w-4 h-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-green-100 hover:bg-green-200"
          onClick={() => handleAddRightNode(node.id)}
        >
          <ChevronDown className="w-4 h-4 rotate-90 text-green-600" />
        </Button>
        {node.id !== '1' && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-red-100 hover:bg-red-200"
            onClick={() => handleDeleteNode(node.id)}
          >
            <Minus className="w-4 h-4 text-red-600" />
          </Button>
        )}
        {node.children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => handleToggleExpand(node.id)}
          >
            {node.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </Card>
  );

  const renderOrgNode = (node: OrgNode) => (
    <div className="flex flex-col items-center relative">
      <div className="flex items-center justify-center">
        <div className="flex flex-col gap-16 relative">
          {node.leftNodes.map((leftNode, index) => (
            <div key={leftNode.id} className="relative">
              <div className="relative flex items-center">
                <div
                  className="absolute right-0 w-8 h-[2px] bg-gray-300"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                />

                {index < node.leftNodes.length - 1 && (
                  <div className="absolute right-8 h-16 w-[2px] bg-gray-300" style={{ top: '50%' }} />
                )}

                <div className="mr-8">{renderOrgNode(leftNode)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative flex flex-col items-center">
          <NodeCard node={node} />

          {node.isExpanded && node.children.length > 0 && <div className="w-[2px] h-8 bg-gray-300 " />}
        </div>

        <div className="flex flex-col gap-16 relative">
          {node.rightNodes.map((rightNode, index) => (
            <div key={rightNode.id} className="relative">
              <div className="relative flex items-center">
                <div
                  className="absolute left-0 w-8 h-[2px] bg-gray-300"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                />

                {index < node.rightNodes.length - 1 && (
                  <div className="absolute left-8 h-16 w-[2px] bg-gray-300" style={{ top: '50%' }} />
                )}

                <div className="ml-8">{renderOrgNode(rightNode)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {node.isExpanded && node.children.length > 0 && (
        <div className="flex flex-col items-center ">
          {node.children.length > 1 && (
            <div className="relative w-full flex justify-center items-center">
              <div
                className="absolute h-[2px] bg-gray-300"
                style={{
                  width: `${(node.children.length - 1) * 320}px`,
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          )}

          <div className="flex gap-16 mt-8">
            {node.children.map((child, index) => (
              <div key={child.id} className="relative flex flex-col items-center">
                <div className="absolute top-[-32px] w-[2px] h-8 bg-gray-300" />
                {renderOrgNode(child)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-8 min-w-[1200px] overflow-auto">
      <div className="flex justify-center p-16">{renderOrgNode(orgData)}</div>
    </Card>
  );
};

export default OrgChart;
