import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, User, Users } from 'lucide-react';
import Loader from '@/components/ui/loader';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import DepartmentCard from './org-chart/DepartmentCard';
import UserDialog from './org-chart/UserDialog';
import { useOrgChart } from '@/hooks/useOrgChart';

const TableViewCorporateOffice = () => {
  const capitalize = (text: string) => {
    return text
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const {
    loading,
    error,
    flattenedData,
    addUserDialogOpen,
    selectedNode,
    isEditMode,
    selectedUsers,
    isSubmitting,
    setAddUserDialogOpen,
    setSelectedUsers,
    fetchData,
    handleAddUser,
    handleEditNode,
    handleAddNode,
    handleAddDepartment,
    getDepartmentDataForName,
    shouldAllowMultiSelect,
  } = useOrgChart({
    unitId: '396',
    unitName: 'Corporate Office',
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return error;
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] text-white">Role</TableHead>
            <TableHead className="text-white">Assigned User(s)</TableHead>
            <TableHead className="w-[100px] text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenedData
            .filter((node) => node.roleId === 2 || node.roleId == 3 || node.roleId == 4)
            .map((node) => (
              <TableRow key={node.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{node.groupName || node.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {node.mappedUser && node.mappedUser.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {node.mappedUser.map((user, idx) => (
                        <div key={idx} className="text-sm">
                          {capitalize(user.userDetail)}
                          {idx < node.mappedUser.length - 1 ? ', ' : ''}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No user assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {node.mappedUser && node.mappedUser.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={() => handleEditNode(node)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleAddNode(node)}>
                      <User className="w-4 h-4" />+
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

          <TableRow>
            <TableCell colSpan={3} className="p-0">
              <div className="flex justify-between items-center p-4">
                <span className="text-lg font-bold">Departments</span>
                <Button
                  onClick={() => {}}
                  disabled
                  className="bg-green-600 hover:bg-green-700 text-white hover:text-white"
                  size="sm"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Department +
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-1 px-0">
                {['IT', 'HR', 'Finance', 'Others'].map((dept) => (
                  <DepartmentCard
                    key={dept}
                    departmentName={dept}
                    hod={getDepartmentDataForName(dept).hod}
                    categories={getDepartmentDataForName(dept).categories}
                    onEdit={handleEditNode}
                    onAdd={handleAddNode}
                  />
                ))}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <UserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        isEditMode={isEditMode}
        selectedNode={selectedNode}
        selectedUsers={selectedUsers}
        onUsersChange={setSelectedUsers}
        onSubmit={handleAddUser}
        isSubmitting={isSubmitting}
        shouldAllowMultiSelect={shouldAllowMultiSelect}
      />
    </div>
  );
};

export default TableViewCorporateOffice;
