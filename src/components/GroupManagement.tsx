import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactSelect from 'react-select';
import { CardContent } from '@/components/ui/card';
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
import { ChevronDown, ChevronRight, Plus, Users, UserPlus, Edit, UserX } from 'lucide-react';
import { RootState } from '@/app/store';
import { extractUniqueDepartments, extractUniqueUnits } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import logger from '@/lib/logger';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from './ui/loader';

const GroupManagement = ({ createGroupOpen, setCreateGroupOpen }) => {
  const [groups, setGroups] = useState([]);
  const [mapUserOpen, setMapUserOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [viewMappedUsersOpen, setViewMappedUsersOpen] = useState(false);
  const [mappedUsers, setMappedUsers] = useState([]);
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);

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

  const showMappedUsersHandler = async (id) => {
    const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${id}`);
    if (response?.data?.statusCode === 200) {
      console.log(response?.data?.data.groupMapping[0]);
      setMappedUsers(response?.data?.data?.groupMapping[0]);
    }
    setViewMappedUsersOpen(true);
  };

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
      // Reset form
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
    <CardContent className="p-6">
      {loading && <Loader />}

      {/* Create Group Button */}
      <div className="flex justify-end mb-4">
        <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
          {/* <DialogTrigger asChild>
            <Button variant="default" onClick={() => openGroupDialog()}>
              <Plus size={16} className="mr-1" />
              Create Group
            </Button>
          </DialogTrigger> */}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{isEditing ? 'Edit Group' : 'Create New Group'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update existing user group' : 'Add a new user group to the system'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">
                  Group Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter group description"
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-medium">Group Type</Label>
                <ShadSelect onValueChange={handleIsParentChange} value={formData.isParent ? 'parent' : 'child'}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                  <Label htmlFor="parentId" className="font-medium">
                    Parent Group
                  </Label>
                  <ShadSelect
                    onValueChange={handleParentSelection}
                    value={formData.parentId ? formData.parentId.toString() : undefined}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
              <Button
                variant="outline"
                onClick={() => handleDialogClose('create')}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGroup}
                disabled={!formData.name || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Group' : 'Create Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group Listing */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary">
              <TableHead className="w-12 text-white"></TableHead>
              <TableHead className="text-white font-medium">Group Name</TableHead>
              <TableHead className="text-white font-medium">Description</TableHead>
              <TableHead className="text-white font-medium">Created Date</TableHead>
              <TableHead className="text-white font-medium w-24 text-center text-nowrap">View Users</TableHead>
              <TableHead className="text-white font-medium w-24 text-center">Edit</TableHead>
              <TableHead className="text-white font-medium w-24 text-center text-nowrap">Map Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parentGroups.map((group) => (
              <React.Fragment key={group.id}>
                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    {getChildGroups(group.id).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
                        onClick={() => toggleGroupExpansion(group.id)}
                      >
                        {expandedGroups[group.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                      {group.groupName.charAt(0).toUpperCase()}
                    </div>
                    {group.groupName}
                  </TableCell>
                  <TableCell className="text-gray-600 max-w-md truncate">{group.description}</TableCell>
                  <TableCell className="text-gray-600">{format(group.createdDate, 'dd-MM-yyyy')}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full hover:bg-amber-100 h-8 w-8 p-0 mx-auto"
                      onClick={() => {
                        setSelectedGroup(group);
                        showMappedUsersHandler(group.id);
                      }}
                    >
                      <Users size={16} className="text-amber-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full hover:bg-blue-100 h-8 w-8 p-0 mx-auto"
                      onClick={() => openGroupDialog(group)}
                    >
                      <Edit size={16} className="text-blue-600" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full hover:bg-green-100 h-8 w-8 p-0 mx-auto"
                      onClick={() => openMapUserDialog(group)}
                    >
                      <UserPlus size={16} className="text-green-600" />
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Child groups */}
                {expandedGroups[group.id] &&
                  getChildGroups(group.id).map((childGroup) => (
                    <TableRow key={childGroup.id} className="hover:bg-purple-200 bg-purple-100 transition-colors">
                      <TableCell></TableCell>
                      <TableCell className="font-medium text-gray-700 pl-10 flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md bg-purple-500 flex items-center justify-center text-white text-xs">
                          {childGroup.groupName.charAt(0).toUpperCase()}
                        </div>
                        <span className="pl-2">{childGroup.groupName}</span>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-md truncate">{childGroup.description}</TableCell>
                      <TableCell className="text-gray-600">{childGroup.createdAt}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full hover:bg-amber-100 h-8 w-8 p-0 mx-auto"
                          onClick={() => setViewMappedUsersOpen(true)}
                        >
                          <Users size={16} className="text-amber-600" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full hover:bg-purple-100 h-8 w-8 p-0 mx-auto"
                          onClick={() => openGroupDialog(childGroup)}
                        >
                          <Edit size={16} className="text-purple-600" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full hover:bg-green-100 h-8 w-8 p-0 mx-auto"
                          onClick={() => openMapUserDialog(childGroup)}
                        >
                          <UserPlus size={16} className="text-green-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Map User Dialog */}
      <Dialog open={mapUserOpen} onOpenChange={setMapUserOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Map Users to Group</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedGroup && `Select users to map to "${selectedGroup.groupName}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Unit Dropdown */}
              <div>
                <Label className="mb-2 block font-medium">Unit:</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                <Label className="mb-2 block font-medium">Selected Group:</Label>
                <div className="p-3 bg-blue-50 rounded-md font-medium text-blue-800 flex items-center gap-2">
                  {selectedGroup ? (
                    <>
                      <div
                        className={`h-6 w-6 rounded-full ${
                          selectedGroup.isParent ? 'bg-blue-600' : 'bg-purple-500'
                        } flex items-center justify-center text-white text-xs`}
                      >
                        {selectedGroup.groupName.charAt(0).toUpperCase()}
                      </div>
                      {selectedGroup.groupName}
                    </>
                  ) : (
                    'No group selected'
                  )}
                </div>
              </div>
            </div>

            {/* User Selection */}
            <Label htmlFor="users" className="mb-2 mt-6 block font-medium">
              Select Users
            </Label>
            <ReactSelect
              id="users"
              options={formattedEmployeeList}
              value={selectedUsers}
              onChange={handleUserSelectionChange}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select users to map to this group"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  '&:hover': {
                    borderColor: '#3b82f6',
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#eff6ff',
                  borderRadius: '0.375rem',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#1e40af',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#3b82f6',
                  ':hover': {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                  },
                }),
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogClose('map')}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button onClick={handleMapUsers} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Mapping...' : 'Map Users'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Mapped Users Dialog */}
      <Dialog open={viewMappedUsersOpen} onOpenChange={setViewMappedUsersOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Mapped Users</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedGroup && `Users mapped to "${selectedGroup.groupName}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-96 overflow-y-auto">
            <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center gap-2">
              {selectedGroup && (
                <>
                  <div
                    className={`h-6 w-6 rounded-full ${
                      selectedGroup.isParent ? 'bg-blue-600' : 'bg-purple-500'
                    } flex items-center justify-center text-white text-xs`}
                  >
                    {selectedGroup.groupName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-blue-800">{selectedGroup.groupName}</span>
                </>
              )}
            </div>

            {mappedUsers && mappedUsers.length > 0 ? (
              <div className="space-y-2">
                {mappedUsers.map((user) => (
                  <div key={user.userCode} className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                      {user.userDetails?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.userDetails}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserX size={32} className="mx-auto mb-2 text-gray-400" />
                <p>No users mapped to this group</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setViewMappedUsersOpen(false);
                setSelectedGroup(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default GroupManagement;
