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
      name: 'Margaret C. Whitman',
      position: 'President & CEO',
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
            name: 'New Employee',
            position: 'Employee',
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
    const deleteNode = (node: OrgNode): OrgNode | null => {
      if (node.id === nodeId) {
        return null;
      }

      return {
        ...node,
        children: node.children.map(deleteNode).filter((child): child is OrgNode => child !== null),
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

  const renderOrgNode = (node: OrgNode) => (
    <div className="flex flex-col items-center">
      <NodeCard node={node} />
      {node.isExpanded && node.children.length > 0 && (
        <div className="relative mt-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-px bg-gray-300" />
          <div className="relative pt-8">
            <div className="absolute top-0 left-0 w-full h-px bg-gray-300" />
            <div className="flex justify-center gap-16">
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  {renderOrgNode(child)}
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
      <div className="flex justify-center">{renderOrgNode(orgData)}</div>
    </div>
  );
};

export default OrgChart;
