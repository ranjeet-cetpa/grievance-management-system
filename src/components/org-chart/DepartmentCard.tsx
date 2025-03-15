import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { FlattenedNode } from '@/types/orgChart';
import HODSection from './HODSection';
import CategoriesSection from './CategoriesSection';
import toast from 'react-hot-toast';
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
import UserSelect from './UserSelect';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axios from 'axios';
import { useOrgChart } from '@/hooks/useOrgChart';

interface DepartmentCardProps {
  departmentName: string;
  hod: FlattenedNode | null;
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ departmentName, hod, categories, onEdit, onAdd }) => {
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('');
  const [selectedUsers, setSelectedUsers] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const user = useSelector((state: RootState) => state.user);
  const { fetchData } = useOrgChart({
    unitId: '396',
    unitName: 'Corporate Office',
  });
  const handleAddCategory = async () => {
    if (!hod || !newCategoryName || selectedUsers.length === 0) return;

    try {
      setIsSubmitting(true);
      const requestBody = {
        id: 0,
        groupName: newCategoryName,
        description: newCategoryDescription || '',
        isRoleGroup: true,
        roleId: 7,
        isServiceCategory: true,
        parentGroupId: hod.id,
        unitId: '396',
        unitName: 'Corporate Office',
        createdBy: user?.EmpCode,
        childGroup: null,
        mappedUser: selectedUsers.map((user) => ({
          userCode: user.userCode,
          userDetail: user.userDetail,
          departments: user.departments || [],
        })),
      };

      await axios.post('https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/AddUpdateGroupNew', requestBody);
      toast.success('Category added successfully');
      fetchData();

      // Create a new category node for local state update
      const newCategory: FlattenedNode = {
        id: 0,
        groupName: newCategoryName,
        description: newCategoryDescription || '',
        isRoleGroup: false,
        roleId: null,
        isServiceCategory: true,
        mappedUser: selectedUsers,
        parentGroupId: hod.id,
        unitId: hod.unitId || '396',
        createdBy: user?.EmpCode || '',
      };

      onAdd(newCategory);

      // Reset form state
      setAddCategoryDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-1 items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{departmentName}</h3>
        <Button variant="outline" size="sm" className="p-2" onClick={() => setAddCategoryDialogOpen(true)}>
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

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Add a new category for {departmentName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter category description"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <UserSelect
                employees={employeeList}
                value={selectedUsers}
                onChange={(users) =>
                  setSelectedUsers(
                    users.map((user) => ({
                      userCode: user.userCode,
                      userDetail: user.userDetail,
                      departments: [],
                    }))
                  )
                }
                isMulti={true}
                label="Select Redressals"
              />
              {selectedUsers.length === 0 && (
                <Label className="text-red-500 text-xs">Minimum one redressal is required</Label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategoryName || selectedUsers.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentCard;
