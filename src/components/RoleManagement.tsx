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
  const [expandedRoles, setExpandedRoles] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [selectedRoleForMapping, setSelectedRoleForMapping] = useState(null);
  const [showMappedUsersTable, setShowMappedUsersTable] = useState(false);
  const [addressalList, setAddressalList] = useState([]);
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
      value: employee?.empCode?.toString(),
      label: `${employee.empName ?? 'Unnamed'} ${employee.empCode ? `(${employee.empCode})` : ''} ${
        employee.designation ? `- ${employee.designation}` : ''
      } ${employee.department ? `| ${employee.department}` : ''}`,
      original: employee,
    };
    return option;
  };

  const formattedEmployeeList = employeeList?.map(formatEmployeeForSelect);

  // Group mapped users by unit
  const groupUsersByUnit = (users) => {
    const groupedUsers = {};
    users.forEach((user) => {
      const unitName = user.unitName || 'N/A';
      if (!groupedUsers[unitName]) {
        groupedUsers[unitName] = {
          unitName,
          userCodes: [],
          userDetails: [],
        };
      }
      groupedUsers[unitName].userCodes.push(user.userCode || 'N/A');
      groupedUsers[unitName].userDetails.push(user.userDetails || 'N/A');
    });
    return Object.values(groupedUsers);
  };

  // Fetch mapped users for a specific role
  const showMappedUsersHandler = async (role) => {
    try {
      setLoading(true);
      // If role ID is 4, we'll handle it differently
      if (role.id === 4) {
        setSelectedRoleForMapping(role);
        setShowMappedUsersTable(true);
        // Set logged-in user's unit ID as default
        if (user?.unitId) {
          setSelectedUnit(user.unitId.toString());
          // Fetch addressal list for the default unit
          await fetchAddressalList(user.unitId.toString());
        }
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/Admin/GetRoleDetail?roleId=${role.id}`);

      if (response?.data?.statusCode === 200) {
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

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/Admin/GetApplicationRole');
      const data = await response?.data?.data;
      logger.log('Roles data:', data);
      setRoles(data);

      //console.log('Roles fetched successfully:', roles);
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

  // Open map user dialog for the currently selected role
  const openMapUserDialog = () => {
    if (!selectedRoleForMapping) return;

    //console.log('Opening map user dialog for role:', selectedRoleForMapping);
    setSelectedRole(selectedRoleForMapping);
    setSelectedUsers([]);
    setMapUserOpen(true);
  };

  // Handle user selection change
  const handleUserSelectionChange = (selectedOptions) => {
    //console.log('User selection changed:', selectedOptions);
    setSelectedUsers(selectedOptions);
  };

  // Handle mapping users to role
  const handleMapUsers = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);

      const payload = {
        roleId: [selectedRole.id],
        unitId: selectedUnit,
        unitName: unitsDD?.find((u) => Number(u.unitId) === Number(selectedUnit))?.unitName,
        userDetails: selectedUsers?.label,
        userCode: selectedUsers.value,
      };

      const response = await axiosInstance.post('/Admin/UpdateUserRoleMapping', payload);
      if (response.data?.statusCode === 200) {
        toast.success('Users are mapped successfully to the role');
        // Refresh the mapped users display
        await showMappedUsersHandler(selectedRole);
      } else {
        toast.error('Error in mapping users to the role');
      }

      setMapUserOpen(false);
      setSelectedUsers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error mapping users to role:', error);
      toast.error('Failed to map users to role');
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
      setSelectedUsers([]);
    }
  };

  // Process mapped users for display - group by unit
  const groupedMappedUsers = groupUsersByUnit(mappedUsers);

  // Fetch addressal list for selected unit
  const fetchAddressalList = async (unitId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/Admin/GetAddressalList?unitId=${unitId}`);

      if (response?.data?.statusCode === 200) {
        setAddressalList(response.data.data);
      } else {
        toast.error('Failed to fetch addressal list');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching addressal list:', error);
      toast.error('Failed to fetch addressal list');
      setLoading(false);
    }
  };

  // Handle unit selection for addressal list
  const handleAddressalUnitChange = (unitId) => {
    setSelectedUnit(unitId);
    if (unitId) {
      fetchAddressalList(unitId);
    }
  };

  return (
    <CardContent className="p-6">
      {loading && <Loader />}

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

      {/* Mapped Users Table or Special Content for Role ID 4 */}
      {showMappedUsersTable && selectedRoleForMapping && (
        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          {selectedRoleForMapping.id === 4 ? (
            // Special content for role ID 4 - Addressal List
            <div className="p-6">
              <div className="flex justify-between bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  Addressal List for Role "{selectedRoleForMapping.roleName}"
                </h3>
                <Button onClick={() => setShowMappedUsersTable(false)} variant="outline">
                  Close
                </Button>
              </div>

              <div className="p-4">
                {/* Unit Selection */}
                <div className="mb-6">
                  <Label className="mb-2 block font-medium">Select Unit:</Label>
                  <Select value={selectedUnit} onValueChange={handleAddressalUnitChange}>
                    <SelectTrigger className="w-1/4 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

                {/* Addressal List Table */}
                {addressalList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="font-medium">Unit Name</TableHead>
                        <TableHead className="font-medium">User Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addressalList.map((item, index) => (
                        <TableRow key={`${item.unitId}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">{item.unitName}</TableCell>
                          <TableCell>
                            <ul className="list-disc list-inside">
                              {item.mappedUserCode.map((user, userIndex) => (
                                <li key={userIndex} className="text-gray-600">
                                  {user.userDetails}
                                </li>
                              ))}
                            </ul>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>No addressal list available for the selected unit</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Original mapping table content
            <>
              <div className="flex justify-between bg-blue-50 p-4 border-b border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  User Mapping for Role "{selectedRoleForMapping.roleName}"
                </h3>

                <div className="flex justify-between">
                  <Button onClick={openMapUserDialog} variant="default">
                    <UserPlus size={16} />
                    Map User to Role
                  </Button>
                </div>
              </div>

              {groupedMappedUsers && groupedMappedUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-medium">Unit Name</TableHead>
                      <TableHead className="font-medium">User Codes</TableHead>
                      <TableHead className="font-medium">User Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedMappedUsers.map((group, index) => (
                      <TableRow key={`${group.unitName}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <TableCell>{group.unitName}</TableCell>
                        <TableCell>{group.userCodes.join(', ')}</TableCell>
                        <TableCell>{group.userDetails.join(', ')}</TableCell>
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

              <div className="flex justify-end pt-4 pr-3 border-t border-gray-200">
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
            </>
          )}
        </div>
      )}

      {/* Map User Dialog */}
      <Dialog open={mapUserOpen} onOpenChange={setMapUserOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex font-bold">Map User to Role</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedRole && `Select user to map to "${selectedRole.roleName}"`}
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
              Select User
            </Label>
            <ReactSelect
              id="users"
              options={formattedEmployeeList}
              value={selectedUsers}
              onChange={handleUserSelectionChange}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select a user to map to this role"
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
            <Button
              onClick={handleMapUsers}
              disabled={loading || !selectedUsers || !selectedUnit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Mapping...' : 'Map User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default RoleManagement;
