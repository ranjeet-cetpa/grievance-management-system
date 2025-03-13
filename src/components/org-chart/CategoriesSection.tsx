import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, User } from 'lucide-react';
import { FlattenedNode } from '@/types/orgChart';

interface CategoriesSectionProps {
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories, onEdit, onAdd }) => {
  return (
    <>
      {categories.map((node) => (
        <div key={node.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{node.groupName || node.description}</span>
            {node.mappedUser && node.mappedUser.length > 0 ? (
              <Button variant="outline" size="sm" onClick={() => onEdit(node)}>
                <Pencil className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onAdd(node)}>
                <User className="w-4 h-4" />+
              </Button>
            )}
          </div>
          {node.mappedUser && node.mappedUser.length > 0 ? (
            <div className="text-sm text-gray-600">
              {node.mappedUser.map((user, idx) => (
                <div key={idx}>{user.userDetail}</div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No user assigned</div>
          )}
        </div>
      ))}
    </>
  );
};

export default CategoriesSection;
