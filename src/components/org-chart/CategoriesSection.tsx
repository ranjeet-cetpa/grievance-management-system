import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, User, Info, ChevronDown, Trash, Trash2, Plus } from 'lucide-react';
import Select from 'react-select';
import { FlattenedNode } from '@/types/orgChart';
import ReactSelect from 'react-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useOrgChart } from '@/hooks/useOrgChart';
import axios from 'axios';
import toast from 'react-hot-toast';
import { extractUniqueDepartments, extractUniqueUnits } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import UserSelect from './UserSelect';
import { Checkbox } from '../ui/checkbox';

const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface CategoriesSectionProps {
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
  onFetchData: () => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories, onEdit, onAdd, onFetchData }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<FlattenedNode | null>(null);
  const [selectedUnits, setSelectedUnits] = React.useState<string[]>(['396']);
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [mapUserDialogOpen, setMapUserDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<{
    userDetail: string;
    userCode?: string;
    userId?: string;
  } | null>(null);
  const [nominateFromOtherUnits, setNominateFromOtherUnits] = React.useState(false);

  const [editCategoryDescription, setEditCategoryDescription] = React.useState('');
  const [editCategoryUsers, setEditCategoryUsers] = React.useState<any[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>(undefined);
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>([]);
  const [isMapping, setIsMapping] = React.useState(false);
  const [mappedDepartmentsDialogOpen, setMappedDepartmentsDialogOpen] = React.useState(false);
  const [userMappedDepartments, setUserMappedDepartments] = React.useState<string[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = React.useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = React.useState(false);
  const { fetchData } = useOrgChart({
    unitId: '396',
    unitName: 'Corporate Office',
  });
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const departmentsDD = extractUniqueDepartments(employeeList);
  console.log('departmentsDD', departmentsDD);
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

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const requestBody = {
        id: selectedCategory.id,
        groupName: selectedCategory.groupName,
        description: editCategoryDescription,
        isRoleGroup: true,
        roleId: 7,
        isServiceCategory: true,
        parentGroupId: selectedCategory.parentGroupId,
        unitId: '396',
        unitName: 'Corporate Office',
        createdBy: user?.EmpCode,
        childGroup: null,
        mappedUser: editCategoryUsers.map((user) => ({
          userCode: user.userCode,
          userDetail: user.userDetail,
          departments: user.departments || [],
        })),
      };

      await axios.post('https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/AddUpdateGroupNew', requestBody);

      // Reset form state first
      setEditCategoryDialogOpen(false);
      setEditCategoryDescription('');
      setEditCategoryUsers([]);

      // Then show success message
      toast.success('Category updated successfully');

      // Finally refresh the data
      await onFetchData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
    }
  };
  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setIsDeleting(true);
      await axios.get(
        `https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/ActiveInactiveGroup?groupId=${selectedCategory.id}&isActive=false`
      );
      await onFetchData();

      // First close the dialog and reset state
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      setOpenAccordion(undefined);

      // Then show success message
      toast.success('Category deleted successfully');

      // Finally refresh the data
      await fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMapUserToDepartments = async () => {
    if (!selectedUser || !selectedCategory) return;

    try {
      setIsMapping(true);
      await axios.post('https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/UpdateUserDepartmentMapping', {
        department: selectedDepartments,
        unitId: '396', // Corporate Office ID
        unitName: 'Corporate Office',
        userCodes: [
          {
            userCode: selectedUser?.userCode,
            userDetails: selectedUser.userDetail,
          },
        ],
      });

      // Reset state and close dialog
      setMapUserDialogOpen(false);
      setSelectedDepartments([]);
      setSelectedUser(null);

      // Show success message
      toast.success('User mapped to departments successfully');

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error mapping user to departments:', error);
      toast.error('Failed to map user to departments');
    } finally {
      setIsMapping(false);
    }
  };

  const fetchUserMappedDepartments = async (userCode: string) => {
    try {
      setIsLoadingDepartments(true);
      const response = await axios.get(
        'https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/GetDepartmentMappingList'
      );

      if (response.data.statusCode === 200) {
        // Filter departments where the user is mapped
        const mappedDepts = response.data.data
          .filter((dept: any) => dept.mappedUser?.some((user: any) => user.userCode === userCode))
          .map((dept: any) => dept.department);

        setUserMappedDepartments(mappedDepts);
      }
    } catch (error) {
      console.error('Error fetching mapped departments:', error);
      toast.error('Failed to fetch mapped departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  return (
    <>
      <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
        {categories.map((node) => (
          <AccordionItem key={node.id} value={node.id.toString()}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium">{node.groupName || node.description}</span>
                <div>
                  {' '}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(node);
                      setInfoDialogOpen(true);
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(node);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedCategory(node);
                      setEditCategoryUsers(node.mappedUser);
                      setEditCategoryDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Complaint Handlers</h4>
                  {/* {node.mappedUser && node.mappedUser.length > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        onEdit(node);
                        console.log(node, 'incoming node ');
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onAdd(node)}>
                      <User className="w-4 h-4" />
                    </Button>
                  )} */}
                </div>
                {node.mappedUser && node.mappedUser.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-1 list-none pl-0">
                    {node.mappedUser.map((user, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{capitalizeWords(user.userDetail)}</span>
                        <div className="flex items-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    fetchUserMappedDepartments(user.userCode!);
                                    setMappedDepartmentsDialogOpen(true);
                                  }}
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View mapped departments</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setSelectedCategory(node);
                                    setMapUserDialogOpen(true);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Map user to departments he will be responsible for </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 italic">No user assigned</div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader></DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600">{selectedCategory.description || 'No description provided'}</p>
              </div>
              <div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map User to Department Dialog */}
      <Dialog open={mapUserDialogOpen} onOpenChange={setMapUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Map User to Departments</DialogTitle>
            <DialogDescription>{selectedUser && `Map ${selectedUser.userDetail} to departments`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ReactSelect
              isMulti
              options={departmentsDD.map((dept) => ({
                value: dept.departmentName,
                label: dept.departmentName,
              }))}
              value={selectedDepartments.map((dept) => ({
                value: dept,
                label: dept,
              }))}
              onChange={(selected) => {
                setSelectedDepartments(selected ? selected.map((option) => option.value) : []);
              }}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select departments..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMapUserDialogOpen(false);
                setSelectedDepartments([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMapUserToDepartments} disabled={selectedDepartments.length === 0 || isMapping}>
              {isMapping ? 'Mapping...' : 'Map User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapped Departments Dialog */}
      <Dialog open={mappedDepartmentsDialogOpen} onOpenChange={setMappedDepartmentsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mapped Departments</DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.userDetail} will handle  complaints for the below departments`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingDepartments ? (
              <div className="text-center py-4">Loading...</div>
            ) : userMappedDepartments.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1">
                {userMappedDepartments.map((dept, index) => (
                  <li key={index} className="text-sm">
                    {dept}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 italic">No departments mapped</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappedDepartmentsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Edit the category details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editCategoryDescription}
                onChange={(e) => setEditCategoryDescription(e.target.value)}
                placeholder="Enter category description"
              />
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
            </div>
            <div className="grid gap-2">
              <UserSelect
                employees={filteredEmployees}
                value={editCategoryUsers}
                onChange={(users) =>
                  setEditCategoryUsers(
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={editCategoryUsers.length === 0}>
              Update Sub Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoriesSection;
