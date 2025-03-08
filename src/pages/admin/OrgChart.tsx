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
          isExpanded: true,
        };
        return {
          ...node,
          children: [...node.children, newNode],
        };
      }

      return {
        ...node,
        children: node.children.map(addNode),
      };
    };

    setOrgData(addNode(orgData));
  };

  const handleDeleteNode = (nodeId: string) => {
    const deleteNode = (node: OrgNode, parent: OrgNode | null = null): OrgNode | null => {
      if (node.id === nodeId) {
        // If the node is found, return its children so they can be merged into the parent
        return null;
      }

      return {
        ...node,
        children: node.children
          .flatMap((child) => (child.id === nodeId ? child.children : [deleteNode(child, node)]))
          .filter((child): child is OrgNode => child !== null),
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
      };
    };

    setOrgData(toggleNode(orgData));
  };

  const NodeCard: React.FC<{ node: OrgNode }> = ({ node }) => (
    <Card className="relative flex items-center gap-4 p-4 bg-white rounded-full shadow-lg min-w-[300px]">
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
          className="rounded-full bg-blue-100 hover:bg-blue-200"
          onClick={() => handleAddNode(node.id)}
        >
          <Plus className="w-4 h-4 text-blue-600" />
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

  const renderOrgNode = (node: OrgNode, level: number = 0, isMainBranch: boolean = true) => (
    <div className="flex flex-col items-center relative">
      {level === 1 && isMainBranch && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow duration-200 border border-blue-400">
            Committee
          </div>
        </div>
      )}
      <div className="flex mt-2">
        <NodeCard node={node} />
      </div>
      {node.isExpanded && node.children.length > 0 && (
        <div className="relative flex flex-col items-center">
          <div className="w-px h-6 bg-gray-300"></div>

          <div className="flex items-start relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gray-300" />

            <div className="flex gap-8">
              {node.children.map((child, index) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-6 bg-gray-300"></div>
                  {renderOrgNode(child, level + 1, false)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 min-w-[1200px] overflow-auto bg-gray-50">
      <div className="flex justify-center mt-8">{renderOrgNode(orgData)}</div>
    </div>
  );
};

export default OrgChart;
