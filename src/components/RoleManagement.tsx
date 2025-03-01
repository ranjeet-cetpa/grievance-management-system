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
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, Users, UserPlus, Shield, Info } from 'lucide-react';
import { RootState } from '@/app/store';
import { extractUniqueUnits } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import logger from '@/lib/logger';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from './ui/loader';

const RoleManagement = ({ createRoleOpen, setCreateRoleOpen }) => {
  const [roles, setRoles] = useState([]);
  const [mapUserOpen, setMapUserOpen] = useState(false);
  const [mapUserToRolesOpen, setMapUserToRolesOpen] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedRoleForMapping, setSelectedRoleForMapping] = useState(null);
  const [showMappedUsersTable, setShowMappedUsersTable] = useState(false);
  const user = useSelector((state) => state.user);
  const employeeList = useSelector((state) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);

  const [formData, setFormData] = useState({
    id: '0',
    name: '',
    description: '',
  });

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

  // Fetch mapped users for a specific role
  const showMappedUsersHandler = async (role) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/Admin/GetRoleDetail?roleId=${role.id}`);

      if (response?.data?.statusCode === 200) {
        console.log(response?.data?.data?.mappedUsers, 'see the mapped users here . . .. ');
        setMappedUsers(response?.data?.data?.mappedUsers || []);
        setSelectedRoleForMapping(role);
        setShowMappedUsersTable(true);
      } else {
        toast.error('Failed to fetch mapped users');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mapped users:', error);
      toast.error('Failed to fetch mapped users');
      setLoading(false);
    }
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      console.log('Fetching roles from API...');

      const response = await axiosInstance.get('/Admin/GetApplicationRole');
      const data = await response?.data?.data;
      logger.log('Roles data:', data);
      setRoles(data);

      console.log('Roles fetched successfully:', roles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role creation
  const handleSaveRole = async () => {
    try {
      setLoading(true);
      const roleData = {
        id: '0',
        roleName: formData.name,
        description: formData.description,
        userCode: user?.EmpCode,
      };

      const response = await axiosInstance.post('/Admin/AddUpdateRole', roleData);

      if (response.data?.statusCode === 200) {
        toast.success('New role created successfully');
        await fetchRoles();
      } else {
        toast.error('Error in creating new Role');
      }

      // Reset form
      resetForm();
      setCreateRoleOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: '0',
      name: '',
      description: '',
    });
  };

  // Toggle expanded state for a role
  const toggleRoleExpansion = (roleId) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  // Open map user dialog
  const openMapUserDialog = (role) => {
    console.log('Opening map user dialog for role:', role);
    setSelectedRole(role);
    setSelectedUsers([]);
    setMapUserOpen(true);
  };

  // Open map user to roles dialog
  const openMapUserToRolesDialog = () => {
    setSelectedUser(null);
    setSelectedRoles([]);
    setSelectedUnit(null);
    setMapUserToRolesOpen(true);
  };

  // Handle user selection change
  const handleUserSelectionChange = (selectedOptions) => {
    console.log('User selection changed:', selectedOptions);
    setSelectedUsers(selectedOptions);
  };

  // Handle single user selection change for mapping to multiple roles
  const handleSingleUserSelectionChange = (selectedOption) => {
    console.log('User selection changed:', selectedOption);
    setSelectedUser(selectedOption);
  };

  // Handle role checkbox change
  const handleRoleCheckboxChange = (roleId) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Handle mapping users to role
  const handleMapUsers = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);

      const payload = {
        roleMasterId: selectedRole.id,
        unitId: selectedUnit,
        unitName: unitsDD?.find((u) => Number(u.unitId) === Number(selectedUnit))?.unitName,
        userCodes: [{ userCode: selectedUsers.value, userDetails: selectedUsers.label?.trim() }],
      };

      const response = await axiosInstance.post('/Admin/UpdateUserRoleMapping', payload);
      if (response.data?.statusCode === 200) {
        toast.success('Users are mapped successfully to the role');
      } else {
        toast.error('Error in mapping users to the role');
      }

      setMapUserOpen(false);
      setSelectedRole(null);
      setSelectedUsers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error mapping users to role:', error);
      toast.error('Failed to map users to role');
      setLoading(false);
    }
  };

  // Handle mapping user to multiple roles
  const handleMapUserToRoles = async () => {
    if (!selectedUser || selectedRoles.length === 0 || !selectedUnit) {
      toast.error('Please select a user, at least one role, and a unit');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userCode: selectedUser.value,
        userDetails: selectedUser.label?.trim(),
        unitId: selectedUnit,
        unitName: unitsDD?.find((u) => Number(u.unitId) === Number(selectedUnit))?.unitName,
        roleId: selectedRoles,
      };

      const response = await axiosInstance.post('/Admin/UpdateUserRoleMapping', payload);
      if (response.data?.statusCode === 200) {
        toast.success('User has been successfully mapped to the selected roles');
      } else {
        toast.error('Error in mapping user to roles');
      }

      setMapUserToRolesOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      setSelectedUnit(null);
      setLoading(false);
    } catch (error) {
      console.error('Error mapping user to roles:', error);
      toast.error('Failed to map user to roles');
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = (dialogType) => {
    if (dialogType === 'create') {
      setCreateRoleOpen(false);
      resetForm();
    } else if (dialogType === 'map') {
      setMapUserOpen(false);
      setSelectedRole(null);
      setSelectedUsers([]);
    } else if (dialogType === 'mapToRoles') {
      setMapUserToRolesOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
    }
  };

  return (
    <CardContent className="p-6">
      {loading && <Loader />}

      {/* Top Actions */}

      {/* Create Role Dialog */}
      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Role</DialogTitle>
            <DialogDescription>Add a new user role to the system</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-medium">
                Role Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter role name"
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
                placeholder="Enter role description"
                rows={3}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
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
              onClick={handleSaveRole}
              disabled={!formData.name || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Listing */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary">
              <TableHead className="text-white font-medium">Role Name</TableHead>
              <TableHead className="text-white font-medium">Description</TableHead>
              <TableHead className="text-white font-medium w-24 text-center text-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.map((role) => (
              <TableRow key={role.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-800 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                    <Shield size={14} />
                  </div>
                  {role.roleName}
                </TableCell>
                <TableCell className="text-gray-600 max-w-md truncate">{role.description}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-blue-100 h-8 w-8 p-0 mx-auto"
                    onClick={() => showMappedUsersHandler(role)}
                  >
                    <Info size={16} className="text-blue-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mapped Users Table */}
      {showMappedUsersTable && selectedRoleForMapping && (
        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between bg-blue-50 p-4 border-b border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              User Mapping for Role "{selectedRoleForMapping.roleName}"
            </h3>

            <div className="flex justify-between mb-6">
              <Button onClick={openMapUserToRolesDialog} variant="default">
                <UserPlus size={16} />
                Map Users to Role
              </Button>
            </div>
          </div>

          {mappedUsers && mappedUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="font-medium">Unit Name</TableHead>
                  <TableHead className="font-medium">User Code</TableHead>
                  <TableHead className="font-medium">User Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedUsers.map((user, index) => (
                  <TableRow key={`${user.userCode}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{user.unitName || 'N/A'}</TableCell>
                    <TableCell>{user.userCode || 'N/A'}</TableCell>
                    <TableCell>{user.userDetails || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto mb-2 text-gray-400" />
              <p>No users mapped to this role</p>
            </div>
          )}

          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => {
                setShowMappedUsersTable(false);
                setSelectedRoleForMapping(null);
              }}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
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
            <DialogTitle className="text-xl flex  font-bold">Map Users to Role</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedRole && `Select users to map to "${selectedRole.roleName}"`}
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

              {/* Selected Role Display */}
              <div>
                <Label className="mb-2 block font-medium">Selected Role:</Label>
                <div className="p-3 bg-blue-50 rounded-md font-medium text-blue-800 flex items-center gap-2">
                  {selectedRole ? (
                    <>
                      <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                        <Shield size={14} />
                      </div>
                      {selectedRole.roleName}
                    </>
                  ) : (
                    'No role selected'
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
              placeholder="Select users to map to this role"
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

      {/* Map User to Roles Dialog */}
      <Dialog open={mapUserToRolesOpen} onOpenChange={setMapUserToRolesOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Map User to Multiple Roles</DialogTitle>
            <DialogDescription className="text-gray-600">Select a user and assign multiple roles</DialogDescription>
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

              {/* User Selection */}
              <div>
                <Label htmlFor="singleUser" className="mb-2 block font-medium">
                  Select User
                </Label>
                <ReactSelect
                  id="singleUser"
                  options={formattedEmployeeList}
                  value={selectedUser}
                  onChange={handleSingleUserSelectionChange}
                  className="basic-select"
                  classNamePrefix="select"
                  placeholder="Select a user"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                    }),
                  }}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="mt-6">
              <Label className="mb-2 block font-medium">Select Roles</Label>
              <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
                <div className="space-y-3">
                  {roles?.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => handleRoleCheckboxChange(role.id)}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                          <Shield size={12} />
                        </div>
                        {role.roleName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogClose('mapToRoles')}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMapUserToRoles}
              disabled={loading || !selectedUser || selectedRoles.length === 0 || !selectedUnit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Mapping...' : 'Map to Roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default RoleManagement;
