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
import { ChevronDown, ChevronRight, Plus, Users, UserPlus, Edit, UserX, Info, Shield } from 'lucide-react';
import { RootState } from '@/app/store';
import { extractUniqueDepartments, extractUniqueUnits } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import logger from '@/lib/logger';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from './ui/loader';
import { Checkbox } from './ui/checkbox';

const GroupManagement = ({ createGroupOpen, setCreateGroupOpen }) => {
  const [groups, setGroups] = useState([]);
  const [mapUserOpen, setMapUserOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tableGroup, setTableGroup] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [viewMappedUsersOpen, setViewMappedUsersOpen] = useState(false);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [selectedGroupForMapping, setSelectedGroupForMapping] = useState(null);
  const [showMappedUsersTable, setShowMappedUsersTable] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);

  const deptDD = extractUniqueDepartments(employeeList);
  const formatEmployeeForSelect = (employee) => {
    const option = {
      value: employee?.empCode?.toString(),
      label: `${employee.empName ?? 'Unnamed'} ${employee.empCode ? `(${employee?.empCode})` : ''} ${
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
    isHOD: false,
    isCommitee: false,
    HODofGroupId: '',
  });

  const showMappedUsersHandler = async (group) => {
    const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${group.id}`);
    if (response?.data?.statusCode === 200) {
      //console.log(response?.data?.data?.groupMapping);
      setMappedUsers(response?.data?.data?.groupMapping);
    }
    setSelectedGroupForMapping(group);
    setShowMappedUsersTable(true);
  };

  // Mock API functions for integration
  const fetchGroups = async () => {
    try {
      setLoading(true);
      //console.log('Fetching groups from API...');
      const response = await axiosInstance.get('/Admin/GetGroupMasterList');
      const data = await response?.data?.data;
      logger.log('this is data ', data);
      setGroups(data);

      //console.log('Groups fetched successfully:', groups);
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
    //console.log('Form field updated:', { field: name, value });
  };

  // Handle parent/child selection
  const handleIsParentChange = (value) => {
    setFormData((prev) => ({ ...prev, isParent: value === 'parent' }));
    //console.log('Group type changed:', { isParent: value === 'parent' });
  };

  // Handle parent group selection
  const handleParentSelection = (value) => {
    const parentId = parseInt(value);
    setFormData((prev) => ({ ...prev, parentId }));
    //console.log('Parent group selected:', { parentId });
  };

  // Handle group creation or update
  const handleSaveGroup = async () => {
    try {
      //console.log('formData', formData);
      setLoading(true);
      const groupData = {
        id: formData.id || '0',
        groupName: formData.name,
        description: formData.description,
        parentGroupId: formData.isParent ? '0' : formData.parentId,
        userCode: user?.EmpCode,
        ...(formData.isHOD && { isHOD: formData.isHOD }),
        ...(formData.isCommitee && { isCommitee: formData.isCommitee }),
        ...(formData.HODofGroupId && { HODofGroupId: Number(formData.HODofGroupId) }),
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

  // Handle user selection change
  const handleUserSelectionChange = (selectedOptions) => {
    if (selectedGroupForMapping?.isHOD && selectedOptions?.length > 1) {
      toast.error('HOD groups can only have one user mapped');
      // Keep only the most recently selected user
      setSelectedUsers(selectedOptions.slice(-1));
      return;
    }
    setSelectedUsers(selectedOptions);
  };

  // Handle mapping users to group
  const handleMapUsers = async () => {
    if (!selectedGroupForMapping) return;

    try {
      setLoading(true);

      // Validation for HOD groups
      if (selectedGroupForMapping.isHOD) {
        if (selectedUsers.length > 1) {
          toast.error('HOD groups can only have one user mapped');
          setLoading(false);
          return;
        }
        if (selectedUnit !== '396') {
          // Assuming '1' is the Corporate Office unit ID
          toast.error('HOD groups can only map users from Corporate Office');
          setLoading(false);
          return;
        }
      }

      const payload = {
        groupMasterId: selectedGroupForMapping.id,
        unitId: selectedUnit,
        unitName: unitsDD?.find((u) => Number(u.unitId) === Number(selectedUnit))?.unitName,
        userCodes: selectedUsers?.map((user) => {
          return { userCode: user?.value, userDetails: user?.label?.trim() };
        }),
      };

      // Mock API call
      const response = await axiosInstance.post('/Admin/UpdateUserGroupMapping', payload);
      if (response.data?.statusCode === 200) {
        toast.success('Users are mapped successfully to the group ');
        showMappedUsersHandler(selectedGroupForMapping);
      } else {
        toast.error('Error in mapping users to the group');
      }
      //console.log('Users mapped successfully to group');

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
    //console.log(`Closing ${dialogType} dialog`);
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
  const parentGroups = groups;
  // Get child groups for a parent
  const getChildGroups = (parentId) => {
    return groups.filter((group) => group.parentGroupId === parentId);
  };

  // Get parent group options for select
  const parentGroupOptions = groups?.filter((group) => group.parentGroupId === null);

  return (
    <CardContent className="p-6">
      {loading && <Loader />}

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
                <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={selectedGroupForMapping?.isHOD}>
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={selectedGroupForMapping?.isHOD ? 'Corporate Office' : 'Select a unit'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Units</SelectLabel>
                      {selectedGroupForMapping?.isHOD ? (
                        <SelectItem value="1">Corporate Office</SelectItem>
                      ) : (
                        unitsDD.map((unit) => (
                          <SelectItem key={unit.unitId} value={unit.unitId.toString()}>
                            {unit.unitName}
                          </SelectItem>
                        ))
                      )}
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

      {/* Create Group Button */}
      <div className="flex justify-end mb-4">
        <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
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
              <div>
                <Label htmlFor="type" className="font-medium">
                  Select Group Type
                </Label>
                <div className="flex flex-row gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="IsHOD"
                      checked={formData.isHOD}
                      onCheckedChange={(checked) => {
                        setFormData((prev) => ({
                          ...prev,
                          isHOD: checked,
                          isCommitee: checked ? false : prev.isCommitee,
                        }));
                      }}
                    />
                    <label
                      htmlFor="IsHOD"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is HOD Group
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="IsCommitee"
                      checked={formData.isCommitee}
                      onCheckedChange={(checked: boolean) => {
                        setFormData((prev) => ({
                          ...prev,
                          isCommitee: checked,
                          isHOD: checked ? false : prev.isHOD,
                        }));
                      }}
                    />
                    <label
                      htmlFor="IsCommitee"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is Committee Group
                    </label>
                  </div>
                </div>
                {formData.isHOD && (
                  <Select
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        HODofGroupId: value,
                      }));
                    }}
                    value={formData.HODofGroupId}
                  >
                    <SelectTrigger className="mt-4">
                      <SelectValue placeholder="Select Group" className="mt-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.groupName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary">
              <TableHead className="text-white font-medium">Group Name</TableHead>
              <TableHead className="text-white font-medium">Description</TableHead>
              <TableHead className="text-white font-medium w-24 text-center">Action </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parentGroups?.map((group) => (
              <React.Fragment key={group.id}>
                <TableRow className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-800 flex items-center gap-2 w-1/3">
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                      {group.groupName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-nowrap">{group.groupName}</span>
                  </TableCell>

                  <TableCell className="text-gray-600 w-1/2">
                    <div className="text-wrap max-w-md">{group.description}</div>
                  </TableCell>

                  <TableCell className="text-center w-1/6">
                    <div className="flex justify-center items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-blue-100 h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedGroupForMapping(group);
                          showMappedUsersHandler(group);
                        }}
                      >
                        <Info size={16} className="text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-blue-100 h-8 w-8 p-0"
                        onClick={() => openGroupDialog(group)}
                      >
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Child groups */}
                {expandedGroups[group.id] &&
                  getChildGroups(group.id).map((childGroup) => (
                    <TableRow key={childGroup.id} className="hover:bg-purple-200 bg-purple-100 transition-colors">
                      <TableCell className="font-medium text-gray-700 pl-10 flex items-center gap-2 w-1/3">
                        <div className="h-5 w-5 rounded-md bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                          {childGroup.groupName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate pl-2">{childGroup.groupName}</span>
                      </TableCell>

                      <TableCell className="text-gray-600 w-1/2">
                        <div className="truncate max-w-md">{childGroup.description}</div>
                      </TableCell>

                      <TableCell className="text-center w-1/6">
                        <div className="flex justify-center items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full hover:bg-purple-100 h-8 w-8 p-0"
                            onClick={() => openGroupDialog(childGroup)}
                          >
                            <Edit size={16} className="text-purple-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {showMappedUsersTable && selectedGroupForMapping && (
        <div className="mt-6 bg-white rounded-lg shadow-lg py-2 overflow-hidden">
          <div className="flex justify-between bg-blue-50 p-4 border-b border-blue-100">
            <h3 className="text-xl  font-bold  text-black-800 flex items-center gap-2">
              <div
                className={`h-6 w-6 rounded-full ${
                  selectedGroup ? 'bg-blue-600' : 'bg-purple-500'
                } flex items-center justify-center text-white text-xs`}
              >
                {selectedGroupForMapping.groupName.charAt(0).toUpperCase()}{' '}
              </div>{' '}
              User Mapping for Group "{selectedGroupForMapping?.groupName}"
            </h3>
            <Button onClick={() => setMapUserOpen(true)}>
              <Plus /> Map Users{' '}
            </Button>
          </div>

          {mappedUsers && mappedUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className=" text-white ">
                  <TableHead className="font-medium text-white">Unit Name</TableHead>
                  <TableHead className="font-medium text-white">User Code</TableHead>
                  <TableHead className="font-medium text-white">User Details</TableHead>
                  <TableHead className="font-medium text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Flatten the array structure and map each user object */}
                {mappedUsers.map((userArray, index) => {
                  // Get the first (and presumably only) item from each inner array
                  const user = userArray;
                  const unitName = userArray[0].unitName;
                  const userCodes = userArray.map((item) => item.userCode)?.join(', ');
                  const userDetails = userArray.map((item) => item.userDetails)?.join(', ');

                  return (
                    <TableRow key={`${user.userCode}-${index}`} className="hover:bg-gray-50  transition-colors">
                      <TableCell>{unitName || 'N/A'}</TableCell>
                      <TableCell>{userCodes || 'N/A'}</TableCell>
                      <TableCell>{userDetails || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" className="rounded-full hover:bg-blue-100 h-8 w-8 p-0 mx-auto">
                          <Edit size={16} className="text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto mb-2 text-gray-400" />
              <p>No users mapped to this group</p>
            </div>
          )}

          <div className=" flex w-full justify-end ">
            <Button
              onClick={() => {
                setShowMappedUsersTable(false);
                setSelectedGroupForMapping(null);
              }}
              variant="outline"
              className="border-black-300 border-2 mt-2 mr-5 hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </div>
      )}
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
                  {selectedGroupForMapping ? (
                    <>
                      <div
                        className={`h-6 w-6 rounded-full ${
                          selectedGroupForMapping.isParent ? 'bg-blue-600' : 'bg-purple-500'
                        } flex items-center justify-center text-white text-xs`}
                      >
                        {selectedGroupForMapping.groupName.charAt(0).toUpperCase()}
                      </div>
                      {selectedGroupForMapping.groupName}
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
              isMulti
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
