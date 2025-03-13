import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { FlattenedNode } from '@/types/orgChart';
import HODSection from './HODSection';
import CategoriesSection from './CategoriesSection';
import toast from 'react-hot-toast';

interface DepartmentCardProps {
  departmentName: string;
  hod: FlattenedNode | null;
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ departmentName, hod, categories, onEdit, onAdd }) => {
  const handleAddCategory = () => {
    if (hod) {
      onAdd({
        id: 0,
        groupName: '',
        description: '',
        isRoleGroup: false,
        roleId: null,
        isServiceCategory: true,
        mappedUser: [],
        parentGroupId: hod.id,
        unitId: '396',
        createdBy: '',
      });
    } else {
      toast.error('Please add HOD first');
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col gap-1 items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{departmentName}</h3>
        <Button variant="outline" size="sm" onClick={handleAddCategory}>
          <Users className="w-4 h-4 mr-1" />
          Category +
        </Button>
      </div>
      {/* HOD Section */}
      <div className="mb-6">
        <h4 className="font-medium bg-blue-100 text-center mb-3 text-blue-600">HOD</h4>
        <HODSection node={hod} onEdit={onEdit} onAdd={onAdd} />
      </div>
      {/* Categories Section */}
      <div>
        <h4 className="font-medium bg-blue-100 text-center mb-3 text-blue-600">Categories</h4>
        <CategoriesSection categories={categories} onEdit={onEdit} onAdd={onAdd} />
      </div>
    </div>
  );
};

export default DepartmentCard;
