import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, User } from 'lucide-react';
import { FlattenedNode } from '@/types/orgChart';

const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface HODSectionProps {
  node: FlattenedNode | null;
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}

const HODSection: React.FC<HODSectionProps> = ({ node, onEdit, onAdd }) => {
  if (!node) return null;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        {node.mappedUser && node.mappedUser.length > 0 ? (
          <div className="text-sm text-gray-600">
            {node.mappedUser.map((user, idx) => (
              <div key={idx}>{capitalizeWords(user.userDetail)}</div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No user assigned</div>
        )}
        {node.mappedUser && node.mappedUser.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
            <Pencil className="h-6 w-6 p-0" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onAdd(node)}>
            <User className="w-4 h-4" />+
          </Button>
        )}
      </div>
    </div>
  );
};

export default HODSection;
