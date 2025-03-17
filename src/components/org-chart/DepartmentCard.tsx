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
import Select from 'react-select';
import { Checkbox } from '@/components/ui/checkbox';
import { extractUniqueUnits } from '@/lib/helperFunction';

interface DepartmentCardProps {
  departmentName: string;
  hod: FlattenedNode | null;
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
  onFetchData: () => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  departmentName,
  hod,
  categories,
  onEdit,
  onAdd,
  onFetchData,
}) => {
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('');
  const [selectedUsers, setSelectedUsers] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [nominateFromOtherUnits, setNominateFromOtherUnits] = React.useState(false);
  const [selectedUnits, setSelectedUnits] = React.useState<string[]>(['396']); // Default to Corporate Office
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const user = useSelector((state: RootState) => state.user);
  const { fetchData } = useOrgChart({
    unitId: '396',
    unitName: 'Corporate Office',
  });
  const unitsDD = extractUniqueUnits(employeeList);
  console.log('unitsDD', unitsDD);
  // Filter employees based on selected units
  const filteredEmployees = React.useMemo(() => {
    if (!nominateFromOtherUnits) {
      // When checkbox is unchecked, show only Corporate Office employees
      return employeeList.filter((emp) => emp.unitId === 396);
    }
    // When checkbox is checked, show only employees from selected units
    return employeeList.filter((emp) => selectedUnits.includes(emp.unitId.toString()));
  }, [employeeList, nominateFromOtherUnits, selectedUnits]);

  // Filter out Corporate Office and prepare options for react-select
  const unitOptions = React.useMemo(
    () =>
      unitsDD
        .filter((unit) => unit.unitId !== 396) // Remove Corporate Office
        .map((unit) => ({
          value: unit.unitId.toString(),
          label: unit.unitName,
        })),
    [unitsDD]
  );

  // Convert selectedUnits to format needed by react-select
  const selectedUnitOptions = React.useMemo(
    () => unitOptions.filter((option) => selectedUnits.includes(option.value)),
    [unitOptions, selectedUnits]
  );

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

      // Reset form state first
      setAddCategoryDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setSelectedUsers([]);
      setNominateFromOtherUnits(false);
      setSelectedUnits(['396']);

      // Then show success message
      toast.success('Category added successfully');

      // Finally refresh the data
      await onFetchData();
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
        <CategoriesSection categories={categories} onEdit={onEdit} onAdd={onAdd} onFetchData={onFetchData} />
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-xl">
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nominateOtherUnits"
                checked={nominateFromOtherUnits}
                onCheckedChange={(checked) => {
                  setNominateFromOtherUnits(checked as boolean);
                  if (!checked) {
                    setSelectedUnits(['396']);
                  }
                }}
              />
              <Label htmlFor="nominateOtherUnits">Nominate from other units</Label>
            </div>

            {nominateFromOtherUnits && (
              <div className="grid gap-2">
                <Label>Select Units</Label>
                <Select
                  isMulti
                  value={selectedUnitOptions}
                  onChange={(newValue) => {
                    const selectedValues = (newValue as { value: string; label: string }[]).map((v) => v.value);
                    setSelectedUnits(selectedValues.length ? selectedValues : []); // Don't include Corporate Office
                  }}
                  options={unitOptions}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Select units"
                />
              </div>
            )}

            <div className="grid gap-2">
              <UserSelect
                employees={filteredEmployees}
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
                label="Select Complaint Handlers"
              />
              {selectedUsers.length === 0 && (
                <Label className="text-red-500 text-xs">Minimum one complaint handler is required</Label>
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
