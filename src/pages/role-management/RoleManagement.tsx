import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactSelect from 'react-select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  Select,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight, Plus, Users, UserPlus, Edit } from 'lucide-react';
import { RootState } from '@/app/store';
import { extractUniqueDepartments, extractUniqueUnits } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import logger from '@/lib/logger';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserRoleManagement = () => {
  // Dummy data for groups
  const [groups, setGroups] = useState([]);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [mapUserOpen, setMapUserOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);
  console.log(unitsDD);
  const deptDD = extractUniqueDepartments(employeeList);
  const formatEmployeeForSelect = (employee) => {
    const option = {
      value: employee.empCode.toString(),
      label: `${employee.empName ?? 'Unnamed'} ${employee.empCode ? `(${employee.empCode})` : ''} ${
        employee.designation ? `- ${employee.designation}` : ''
      } ${employee.department ? `| ${employee.department}` : ''}`,
      original: employee,
    };
    return option;
  };

  const formattedEmployeeList = employeeList?.map(formatEmployeeForSelect);
  const [formData, setFormData] = useState({
    id: '0',
    name: '',
    description: '',
    isParent: true,
    parentId: null,
  });

  // Mock API functions for integration
  const fetchGroups = async () => {
    try {
      setLoading(true);
      console.log('Fetching groups from API...');

      const response = await axiosInstance.get('/Admin/GetGroupMasterList');
      const data = await response?.data?.data;
      logger.log('this is data ', data);
      setGroups(data);

      console.log('Groups fetched successfully:', groups);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log('Form field updated:', { field: name, value });
  };

  // Handle parent/child selection
  const handleIsParentChange = (value) => {
    setFormData((prev) => ({ ...prev, isParent: value === 'parent' }));
    console.log('Group type changed:', { isParent: value === 'parent' });
  };

  // Handle parent group selection
  const handleParentSelection = (value) => {
    const parentId = parseInt(value);
    setFormData((prev) => ({ ...prev, parentId }));
    console.log('Parent group selected:', { parentId });
  };

  // Handle group creation or update
  const handleSaveGroup = async () => {
    try {
      setLoading(true);
      const groupData = {
        id: formData.id || '0',
        groupName: formData.name,
        description: formData.description,
        parentGroupId: formData.isParent ? '0' : formData.parentId,
        userCode: user?.EmpCode,
      };

      const response = await axiosInstance.post('/Admin/AddUpdateGroupMaster', groupData);

      if (response.data?.statusCode === 200) {
        toast.success(isEditing ? 'Group updated successfully' : 'New group created successfully');
        await fetchGroups();
      } else {
        toast.error(isEditing ? 'Error in Editing group ' : 'Error in creating new Group');
      }

      // Reset form
      resetForm();
      setCreateGroupOpen(false);
      setLoading(false);
      setIsEditing(false);
    } catch (error) {
      console.error(isEditing ? 'Error updating group:' : 'Error creating group:', error);
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: '0',
      name: '',
      description: '',
      isParent: true,
      parentId: null,
    });
    setIsEditing(false);
  };

  // Open create/edit dialog
  const openGroupDialog = (group = null) => {
    if (group) {
      // Edit mode - populate form with group data
      setFormData({
        id: group.id,
        name: group.groupName,
        description: group.description,
        isParent: group.parentGroupId === null,
        parentId: group.parentGroupId,
      });
      setIsEditing(true);
    } else {
      // Create mode - reset form
      resetForm();
    }
    setCreateGroupOpen(true);
  };

  // Toggle expanded state for a group
  const toggleGroupExpansion = (groupId) => {
    console.log('Toggling group expansion for group ID:', groupId);
    setExpandedGroups((prev) => {
      const newState = {
        ...prev,
        [groupId]: !prev[groupId],
      };
      console.log('New expanded groups state:', newState);
      return newState;
    });
  };

  // Open map user dialog
  const openMapUserDialog = (group) => {
    console.log('Opening map user dialog for group:', group);
    setSelectedGroup(group);

    // Pre-select users that are already mapped to this group
    // const preSelectedUsers = employeeList.filter((employee) => group.users.includes(parseInt(employee.value)));
    const preSelectedUsers = [];
    console.log('Pre-selected users:', preSelectedUsers);

    setSelectedUsers(preSelectedUsers);
    setMapUserOpen(true);
  };

  // Handle user selection change
  const handleUserSelectionChange = (selectedOptions) => {
    console.log('User selection changed:', selectedOptions);
    setSelectedUsers(selectedOptions);
  };

  // Handle mapping users to group
  const handleMapUsers = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);

      const payload = {
        groupMasterId: selectedGroup.id,
        unitId: selectedUnit,
        unitName: unitsDD?.find((u) => Number(u.unitId) === Number(selectedUnit))?.unitName,
        userCodes: [{ userCode: selectedUsers.value, userDetails: selectedUsers.label?.trim() }],
      };

      // Mock API call
      const response = await axiosInstance.post('/Admin/UpdateUserGroupMapping', payload);
      if (response.data?.statusCode === 200) {
        toast.success('Users are mapped successfully to the group ');
      } else {
        toast.error('Error in mapping users to the group');
      }
      console.log('Users mapped successfully to group');

      setMapUserOpen(false);
      setSelectedGroup(null);
      setSelectedUsers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error mapping users to group:', error);
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = (dialogType) => {
    console.log(`Closing ${dialogType} dialog`);
    if (dialogType === 'create') {
      setCreateGroupOpen(false);
      resetForm();
    } else if (dialogType === 'map') {
      setMapUserOpen(false);
      setSelectedGroup(null);
      setSelectedUsers([]);
    }
  };

  // Filter parent groups
  const parentGroups = groups.filter((group) => group.parentGroupId === null);
  // Get child groups for a parent
  const getChildGroups = (parentId) => {
    return groups.filter((group) => group.parentGroupId === parentId);
  };

  // Get parent group options for select
  const parentGroupOptions = groups.filter((group) => group.parentGroupId === null);

  return (
    <Card className=" mt-2 mx-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Manage User Roles</CardTitle>
            <CardDescription>Manage user groups and role assignments</CardDescription>
          </div>

          {/* Section 1: Create Group Button and Dialog */}
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => openGroupDialog()}>
                <Plus size={16} />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Group' : 'Create New Group'}</DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Update existing user group' : 'Add a new user group to the system'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter group name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Group Type</Label>
                  <ShadSelect onValueChange={handleIsParentChange} value={formData.isParent ? 'parent' : 'child'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent Group</SelectItem>
                      <SelectItem value="child">Child Group</SelectItem>
                    </SelectContent>
                  </ShadSelect>
                </div>

                {!formData.isParent && (
                  <div className="grid gap-2">
                    <Label htmlFor="parentId">Parent Group</Label>
                    <ShadSelect
                      onValueChange={handleParentSelection}
                      value={formData.parentId ? formData.parentId.toString() : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent group" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentGroupOptions.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.groupName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </ShadSelect>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => handleDialogClose('create')}>
                  Cancel
                </Button>
                <Button onClick={handleSaveGroup} disabled={!formData.name || loading}>
                  {loading ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Group' : 'Create Group'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Section 2: Group Listing */}
        <div className="bg-white rounded-md border shadow-sm">
          <Table>
            <TableHeader className="text-white">
              <TableRow className="text-white">
                <TableHead className="w-12 text-white"></TableHead>
                <TableHead className="text-white">Group Name</TableHead>
                <TableHead className="text-white">Description</TableHead>
                <TableHead className="text-white">Created Date</TableHead>
                <TableHead className="w-48 text-white">Actions</TableHead>
                <TableHead className="w-48 text-white">Map User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parentGroups.map((group) => (
                <React.Fragment key={group.id}>
                  <TableRow>
                    <TableCell>
                      {getChildGroups(group.id).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleGroupExpansion(group.id)}
                        >
                          {expandedGroups[group.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium flex items-center gap-2">{group.groupName}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>{format(group.createdDate, 'dd-MM-yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openGroupDialog(group)}>
                        <Edit />
                      </Button>
                    </TableCell>

                    <TableCell>
                      {' '}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => openMapUserDialog(group)}
                      >
                        <UserPlus size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Child groups */}
                  {expandedGroups[group.id] &&
                    getChildGroups(group.id).map((childGroup) => (
                      <TableRow key={childGroup.id} className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="font-medium pl-10">{childGroup.groupName}</TableCell>
                        <TableCell>{childGroup.description}</TableCell>
                        <TableCell>{childGroup.createdAt}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openGroupDialog(childGroup)}>
                            <Edit />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {' '}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => openMapUserDialog(childGroup)}
                          >
                            <UserPlus size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Map User Dialog */}
      <Dialog open={mapUserOpen} onOpenChange={setMapUserOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Map Users to Group</DialogTitle>
            <DialogDescription>{selectedGroup && `Select user to map to ${selectedGroup.name}`}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Unit Dropdown */}
              <div>
                <Label className="mb-1 block">Unit:</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Units</SelectLabel>
                      {unitsDD.map((unit) => (
                        <SelectItem key={unit.unitId} value={unit.unitId.toString()}>
                          {unit.unitName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Group Display */}
              <div>
                <Label className="mb-1 block">Selected Group:</Label>
                <div className="p-2 bg-gray-100 rounded-md">
                  {selectedGroup ? selectedGroup.groupName : 'No group selected'}
                </div>
              </div>
            </div>

            {/* User Selection */}
            <Label htmlFor="users" className="mb-2 mt-4 block">
              Select User
            </Label>
            <ReactSelect
              id="users"
              options={formattedEmployeeList}
              value={selectedUsers}
              onChange={handleUserSelectionChange}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select user to map to this group"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose('map')}>
              Cancel
            </Button>
            <Button onClick={handleMapUsers} disabled={loading}>
              {loading ? 'Mapping...' : 'Map Users'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserRoleManagement;
