import { RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { extractUniqueUnits } from '@/lib/helperFunction';
import UserSelect from '@/components/org-chart/UserSelect';
import axiosInstance from '@/services/axiosInstance';
import { Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Loader from '@/components/ui/loader';
import toast from 'react-hot-toast';

interface Admin {
  userCode: string;
  userDetails: string;
  unitId: number;
  unitName: string;
}

interface Employee {
  empId: number;
  empCode: string;
  empName: string | null;
  department: string;
  designation: string;
  unitName: string;
  unitId: number;
}

const ManageRoles = () => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);
  const [unitwiseAdminData, setUnitwiseAdminData] = useState<Admin[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<{ userCode: string; userDetail: string }[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Fetch existing admins
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/Admin/GetRoleDetail?roleId=1');
      if (response.data.statusCode === 200) {
        setUnitwiseAdminData(response.data.data.mappedUsers);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  // Handle adding/editing an admin
  const handleAddOrEditAdmin = async () => {
    if (!selectedUnit || selectedUser.length === 0) {
      toast.error('Please select a unit and a user');
      return;
    }

    const payload = {
      userCode: selectedUser[0].userCode,
      userDetails: selectedUser[0].userDetail,
      unitId: selectedUnit,
      unitName: unitsDD.find((unit) => unit.unitId === Number(selectedUnit))?.unitName || '',
      roleId: [1], // Role ID 1 for Admin
    };

    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/Admin/UpdateUserRoleMapping', payload);
      if (response.data.statusCode === 200) {
        toast.success(isEditing ? 'Admin updated successfully' : 'Admin added successfully');
        // Refresh the admin list
        await fetchAdmins();
        // Reset form
        resetForm();
        setDialogOpen(false);
      } else {
        toast.error('Failed to update admin: ' + response.data?.message);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin');
    }
    setIsLoading(false);
  };

  // Handle editing an existing admin
  const handleEditAdmin = (admin: Admin) => {
    setEditAdmin(admin);
    setSelectedUnit(admin.unitId.toString());
    setSelectedUser([{ userCode: admin.userCode, userDetail: admin.userDetails }]);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedUnit('');
    setSelectedUser([]);
    setIsEditing(false);
    setEditAdmin(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="p-4">
      {isLoading && <Loader />}
      <Card className="rounded-lg shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Manage Unit Admins</CardTitle>
            <Button onClick={handleOpenAddDialog}>+ Add Admin</Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Display existing admins in a shadcn table */}
          <div className="mb-6 mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Unit Name</TableHead>
                  <TableHead className="text-white">Admin Name</TableHead>
                  <TableHead className="text-white">User Code</TableHead>
                  <TableHead className="w-16 text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitwiseAdminData.map((admin, index) => (
                  <TableRow key={index}>
                    <TableCell>{admin.unitName}</TableCell>
                    <TableCell>{admin.userDetails}</TableCell>
                    <TableCell>{admin.userCode}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditAdmin(admin)} variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Add/Edit Admin */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Unit Selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Unit</label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={isEditing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitsDD.map((unit) => (
                    <SelectItem key={unit.unitId} value={unit.unitId.toString()}>
                      {unit.unitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select User</label>
              <UserSelect employees={employeeList} value={selectedUser} onChange={setSelectedUser} isMulti={false} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleAddOrEditAdmin}>{isEditing ? 'Update Admin' : 'Add Admin'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageRoles;
