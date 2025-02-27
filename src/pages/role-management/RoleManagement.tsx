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
import { ChevronDown, ChevronRight, Plus, Users, UserPlus } from 'lucide-react';
import { RootState } from '@/app/store';
import { extractUniqueDepartments, extractUniqueUnits } from '@/lib/helperFunction';

const UserRoleManagement = () => {
  // Dummy data for groups
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Administrators',
      description: 'System administrators with full access',
      parentId: null,
      createdAt: '2025-01-15',
      users: [],
    },
    {
      id: 2,
      name: 'Developers',
      description: 'Software development team',
      parentId: null,
      createdAt: '2025-01-20',
      users: [],
    },
    { id: 3, name: 'Frontend Team', description: 'UI/UX specialists', parentId: 2, createdAt: '2025-01-25', users: [] },
    {
      id: 4,
      name: 'Backend Team',
      description: 'API and database specialists',
      parentId: 2,
      createdAt: '2025-02-01',
      users: [],
    },
    {
      id: 5,
      name: 'Content Managers',
      description: 'Content creation and management',
      parentId: null,
      createdAt: '2025-02-10',
      users: [],
    },
    {
      id: 6,
      name: 'Editors',
      description: 'Content review and publishing',
      parentId: 5,
      createdAt: '2025-02-15',
      users: [],
    },
  ]);

  // This would come from Redux in a real implementation
  // For this example, we'll simulate the data that would come from useSelector

  // State for dialog and form
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [mapUserOpen, setMapUserOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  console.log(employeeList);
  console.log(user);
  const unitsDD = extractUniqueUnits(employeeList);
  const deptDD = extractUniqueDepartments(employeeList);
  console.log('this is dept DD , ', deptDD);
  const formatEmployeeForSelect = (employee) => {
    const option = {
      value: employee.empCode.toString(),
      label: `${employee.empName ?? 'Unnamed'} ${employee.empCode ? `(${employee.empCode})` : ''} ${
        employee.designation ? `- ${employee.designation}` : ''
      } ${employee.department ? `| ${employee.department}` : ''}`,
      original: employee,
    };
    console.log(option);
  };

  const formattedEmployeeList = employeeList?.map(formatEmployeeForSelect);
  const [formData, setFormData] = useState({
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
      // Mock API call
      // const response = await fetch('/api/groups');
      // const data = await response.json();
      // setGroups(data);

      // Using dummy data for now
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

  // Handle group creation
  const handleCreateGroup = async () => {
    try {
      setLoading(true);
      const newGroup = {
        id: groups.length + 1, // This would be assigned by the API in a real scenario
        name: formData.name,
        description: formData.description,
        parentId: formData.isParent ? null : formData.parentId,
        createdAt: new Date().toISOString().split('T')[0],
        users: [],
      };

      console.log('Creating new group with data:', newGroup);

      // Mock API call
      // const response = await fetch('/api/groups', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newGroup),
      // });
      // const createdGroup = await response.json();

      // Using local state for now
      setGroups((prev) => [...prev, newGroup]);
      console.log('Group created successfully:', newGroup);

      // Reset form
      setFormData({
        name: '',
        description: '',
        isParent: true,
        parentId: null,
      });
      setCreateGroupOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error creating group:', error);
      setLoading(false);
    }
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

      console.log('Mapping users to group:', {
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,

        selectedUsers,
      });

      // Mock API call
      // const response = await fetch(`/api/groups/${selectedGroup.id}/users`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ userIds }),
      // });
      // const updatedGroup = await response.json();

      // Using local state for now
      setGroups((prevGroups) =>
        prevGroups.map((group) => (group.id === selectedGroup.id ? { ...group, users: userIds } : group))
      );
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
    } else if (dialogType === 'map') {
      setMapUserOpen(false);
      setSelectedGroup(null);
      setSelectedUsers([]);
    }
  };

  // Filter parent groups
  const parentGroups = groups.filter((group) => group.parentId === null);

  // Get child groups for a parent
  const getChildGroups = (parentId) => {
    return groups.filter((group) => group.parentId === parentId);
  };

  // Get parent group options for select
  const parentGroupOptions = groups.filter((group) => group.parentId === null);

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
              <Button className="flex items-center gap-2" onClick={() => console.log('Create group button clicked')}>
                <Plus size={16} />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>Add a new user group to the system</DialogDescription>
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
                  <ShadSelect
                    onValueChange={handleIsParentChange}
                    defaultValue={formData.isParent ? 'parent' : 'child'}
                  >
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
                    <ShadSelect onValueChange={handleParentSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent group" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentGroupOptions.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
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
                <Button onClick={handleCreateGroup} disabled={!formData.name || loading}>
                  {loading ? 'Creating...' : 'Create Group'}
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
                <TableHead className="text-white">Users</TableHead>
                <TableHead className="w-48 text-white">Actions</TableHead>
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
                    <TableCell className="font-medium flex items-center gap-2">
                      <Users size={16} />
                      {group.name}
                    </TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>{group.createdAt}</TableCell>
                    <TableCell>{group.users.length}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Edit button clicked for group:', group)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => openMapUserDialog(group)}
                        >
                          <UserPlus size={14} />
                          Map User
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Child groups */}
                  {expandedGroups[group.id] &&
                    getChildGroups(group.id).map((childGroup) => (
                      <TableRow key={childGroup.id} className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="font-medium pl-10">{childGroup.name}</TableCell>
                        <TableCell>{childGroup.description}</TableCell>
                        <TableCell>{childGroup.createdAt}</TableCell>
                        <TableCell>{childGroup.users.length}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => console.log('Edit button clicked for child group:', childGroup)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => openMapUserDialog(childGroup)}
                            >
                              <UserPlus size={14} />
                              Map User
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
                <Select>
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
                  {selectedGroup ? selectedGroup.name : 'No group selected'}
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
