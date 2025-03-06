import React, { useState, useEffect, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Building2, Info } from 'lucide-react';
import { RootState } from '@/app/store';
import { extractUniqueUnits, extractUniqueDepartments } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import Loader from './ui/loader';

interface MappedUser {
  userCode: string;
  userDetail: string;
  unitId: string;
  unitName: string;
}

interface DepartmentMapping {
  department: string;
  mappedUser: MappedUser[];
}

interface GroupMaster {
  id: number;
  groupName: string;
  description: string;
  isActive: boolean;
}

interface GroupDetail {
  group: GroupMaster;
  groupMapping: Array<{
    id: number;
    groupId: number;
    userCode: string;
    userDetails: string;
    unitId: string;
    unitName: string;
  }>[];
}

const DepartmentManagement = () => {
  const [departmentMappings, setDepartmentMappings] = useState<DepartmentMapping[]>([]);
  const [mapUserOpen, setMapUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [groups, setGroups] = useState<GroupMaster[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);

  // Get unique departments using useMemo to prevent unnecessary recalculations
  const departmentsList = useMemo(() => {
    const uniqueDepts = new Set(employeeList?.map((emp) => emp.department?.trim()).filter(Boolean));
    return Array.from(uniqueDepts)
      .sort()
      .map((dept) => ({
        departmentName: dept,
      }));
  }, [employeeList]);

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

  // Fetch department mappings
  const fetchDepartmentMappings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/Admin/GetDepartmentMappingList');
      if (response?.data?.statusCode === 200) {
        setDepartmentMappings(response?.data?.data || []);
      } else {
        toast.error('Failed to fetch department mappings');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department mappings:', error);
      toast.error('Failed to fetch department mappings');
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDepartmentMappings();
  }, []);

  // Fetch groups data
  const fetchGroups = async () => {
    try {
      const response = await axiosInstance.get('/Admin/GetGroupMasterList');
      if (response?.data?.statusCode === 200) {
        setGroups(response?.data?.data || []);
      } else {
        toast.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    }
  };

  // Fetch groups when dialog opens
  useEffect(() => {
    if (mapUserOpen) {
      fetchGroups();
    }
  }, [mapUserOpen]);

  // Fetch group details when group is selected
  const fetchGroupDetails = async (groupId: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${groupId}`);
      if (response?.data?.statusCode === 200) {
        setGroupDetail(response?.data?.data);
      } else {
        toast.error('Failed to fetch group details');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error('Failed to fetch group details');
      setLoading(false);
    }
  };

  // Handle group selection change
  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    if (value) {
      fetchGroupDetails(value);
    } else {
      setGroupDetail(null);
    }
  };

  // Get filtered users based on selected unit and group
  const getFilteredUsers = () => {
    if (!groupDetail || !selectedUnit) return [];

    // Flatten the groupMapping array and filter by selected unit
    const usersInGroup = groupDetail.groupMapping.flat().filter((user) => user.unitId === selectedUnit);

    // Convert to the format expected by ReactSelect
    return usersInGroup.map((user) => ({
      value: user.userCode,
      label: user.userDetails,
    }));
  };

  // Handle user selection change
  const handleUserSelectionChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions || []);
  };

  // Get mapped users for selected department
  const getMappedUsersForDepartment = () => {
    if (!selectedDepartment) return [];
    const departmentData = departmentMappings.find((d) => d.department === selectedDepartment);
    return departmentData?.mappedUser || [];
  };

  // Handle mapping users to department
  const handleMapUsers = async () => {
    if (!selectedDepartment || !selectedUsers.length) return;

    try {
      setLoading(true);

      const userCodes = selectedUsers.map((user) => ({
        userCode: user.value,
        userDetails: user.label,
      }));

      const payload = {
        department: selectedDepartment,
        unitId: selectedUnit,
        unitName: unitsDD?.find((u) => u.unitId.toString() === selectedUnit)?.unitName,
        userCodes,
      };

      const response = await axiosInstance.post('/Admin/UpdateUserDepartmentMapping', payload);
      if (response.data?.statusCode === 200) {
        toast.success('Users mapped successfully to the department');
        await fetchDepartmentMappings();
      } else {
        toast.error('Error in mapping users to the department');
      }

      setMapUserOpen(false);
      setSelectedUsers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error mapping users to department:', error);
      toast.error('Failed to map users to department');
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setMapUserOpen(false);
    setSelectedUsers([]);
    setSelectedUnit(null);
    setSelectedDepartment(null);
    setSelectedGroup(null);
  };

  return (
    <CardContent className="p-6">
      {loading && <Loader />}

      {/* Top Action Bar */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          {/* Department Dropdown */}
          <div className="max-w-xs flex-1">
            <Select value={selectedDepartment || ''} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Departments</SelectLabel>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept.departmentName} value={dept.departmentName}>
                      {dept.departmentName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => setMapUserOpen(true)} variant="default">
          <UserPlus size={16} className="mr-1" />
          Map Users to Department
        </Button>
      </div>

      {/* Mapped Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            {selectedDepartment ? `Users Mapped to ${selectedDepartment}` : 'Select a Department to View Mapped Users'}
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-primary">
              <TableHead className="font-medium text-white">Unit</TableHead>
              <TableHead className="font-medium text-white">User Codes</TableHead>
              <TableHead className="font-medium text-white">User Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedDepartment ? (
              (() => {
                // Group users by unit
                const usersByUnit = getMappedUsersForDepartment().reduce((acc, user) => {
                  const unit = user.unitName;
                  if (!acc[unit]) {
                    acc[unit] = {
                      unitName: unit,
                      userCodes: [],
                      userDetails: [],
                    };
                  }
                  acc[unit].userCodes.push(user.userCode);
                  acc[unit].userDetails.push(user.userDetail);
                  return acc;
                }, {});

                const groupedUsers = Object.values(usersByUnit);

                return groupedUsers.length > 0 ? (
                  groupedUsers.map((group, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{group.unitName}</TableCell>
                      <TableCell className="text-gray-600">{group.userCodes.join(', ')}</TableCell>
                      <TableCell className="text-gray-600">{group.userDetails.join(', ')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      <Users size={32} className="mx-auto mb-2 text-gray-400" />
                      <p>No users mapped to this department</p>
                    </TableCell>
                  </TableRow>
                );
              })()
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  <Info size={32} className="mx-auto mb-2 text-gray-400" />
                  <p>Please select a department to view mapped users</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Map User Dialog */}
      <Dialog open={mapUserOpen} onOpenChange={setMapUserOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex font-bold">Map Users to Department</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select department, unit and group to create mapping
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Department, Unit and Group Selection */}
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Unit Dropdown */}
              <div>
                <Label className="mb-2 block font-medium">Unit:</Label>
                <Select value={'396'} onValueChange={setSelectedUnit} disabled>
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

              {/* Department Dropdown */}
              <div>
                <Label className="mb-2 block font-medium">Department:</Label>
                <Select value={selectedDepartment || ''} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      {departmentsList.map((dept) => (
                        <SelectItem key={dept.departmentName} value={dept.departmentName}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Group Dropdown */}
              <div>
                <Label className="mb-2 block font-medium">Group:</Label>
                <Select value={selectedGroup || ''} onValueChange={handleGroupChange}>
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Groups</SelectLabel>
                      {groups
                        .filter((g) => !(g.isHOD || g.isCommitee))
                        .map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.groupName}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* User Selection - Only show if department, unit and group are selected */}
            {selectedDepartment && selectedUnit && selectedGroup && (
              <div>
                <Label htmlFor="users" className="mb-2 block font-medium">
                  Select Users
                </Label>
                <ReactSelect
                  id="users"
                  options={getFilteredUsers()}
                  value={selectedUsers}
                  isMulti
                  onChange={handleUserSelectionChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select users to map to this department"
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
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose} className="border-gray-300 hover:bg-gray-100">
              Cancel
            </Button>
            <Button
              onClick={handleMapUsers}
              disabled={loading || !selectedUsers?.length || !selectedUnit || !selectedDepartment || !selectedGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Mapping...' : 'Map Users'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default DepartmentManagement;
