import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, User, Info, Users, Heading } from 'lucide-react';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import UserSelect from '@/components/org-chart/UserSelect';
import toast from 'react-hot-toast';
import { OrgNode, FlattenedNode, UserDetails } from '@/types/orgChart';
import DepartmentCard from './org-chart/DepartmentCard';
import UserDialog from './org-chart/UserDialog';
import { flattenOrgChart, getDepartmentData, shouldAllowMultiSelect } from '@/utils/orgChartUtils';

// New Components
const RenderHOD: React.FC<{
  node: FlattenedNode | null;
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}> = ({ node, onEdit, onAdd }) => {
  if (!node) return null;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        {node.mappedUser && node.mappedUser.length > 0 ? (
          <div className="text-sm text-gray-600">
            {node.mappedUser.map((user, idx) => (
              <div key={idx}>{user.userDetail}</div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No user assigned</div>
        )}
        {node.mappedUser && node.mappedUser.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => onEdit(node)}>
            <Pencil className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onAdd(node)}>
            <User className="w-4 h-4" />+
          </Button>
        )}
      </div>
    </div>
  );
};

const RenderCategories: React.FC<{
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}> = ({ categories, onEdit, onAdd }) => {
  return (
    <>
      {categories.map((node) => (
        <div key={node.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{node.groupName || node.description}</span>
            {node.mappedUser && node.mappedUser.length > 0 ? (
              <Button variant="outline" size="sm" onClick={() => onEdit(node)}>
                <Pencil className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onAdd(node)}>
                <User className="w-4 h-4" />+
              </Button>
            )}
          </div>
          {node.mappedUser && node.mappedUser.length > 0 ? (
            <div className="text-sm text-gray-600">
              {node.mappedUser.map((user, idx) => (
                <div key={idx}>{user.userDetail}</div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No user assigned</div>
          )}
        </div>
      ))}
    </>
  );
};

const TableViewCorporateOffice = () => {
  const [chartData, setChartData] = useState<OrgNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flattenedData, setFlattenedData] = useState<FlattenedNode[]>([]);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FlattenedNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedCategoryUsers, setSelectedCategoryUsers] = useState<UserDetails[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const user = useSelector((state: RootState) => state.user);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/GetOrgGroupHierarchy?unitId=396'
      );
      const result = await response.data;
      console.log(result.data);
      setChartData(result.data);
      setFlattenedData(flattenOrgChart(result.data));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch organization data');
      toast.error('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async () => {
    if (!selectedNode) return;

    try {
      setIsSubmitting(true);

      const requestBody = {
        groupMasterId: selectedNode.id,
        unitId: '396',
        unitName: 'Corporate Office',
        userCodes: selectedUsers.map((user) => ({
          userCode: user.userCode,
          userDetails: user.userDetail,
        })),
      };

      await axios.post('https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/UpdateUserGroupMapping', requestBody);
      toast.success('User mapping updated successfully');

      await fetchData();

      setAddUserDialogOpen(false);
      setSelectedUsers([]);
      setSelectedNode(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating user group mapping:', error);
      toast.error('Failed to update user mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNode = (node: FlattenedNode) => {
    setSelectedNode(node);
    setIsEditMode(true);
    setSelectedUsers(node.mappedUser);
    setAddUserDialogOpen(true);
  };

  const handleAddNode = (node: FlattenedNode) => {
    setSelectedNode(node);
    setIsEditMode(false);
    setSelectedUsers([]);
    setAddUserDialogOpen(true);
  };

  const getDepartmentData = (departmentName: string) => {
    const nodalOfficer = flattenedData.find((node) => node.roleId === 4);
    if (!nodalOfficer) return { hod: null, categories: [] };

    const departmentGroup = flattenedData.find(
      (node) => node.groupName === departmentName && node.parentGroupId === nodalOfficer.id
    );

    if (!departmentGroup) return { hod: null, categories: [] };

    const hodGroup = flattenedData.find((node) => node.parentGroupId === departmentGroup.id && node.roleId === 6);
    const categories = hodGroup
      ? flattenedData.filter((node) => node.parentGroupId === hodGroup.id && node.isServiceCategory)
      : [];

    return {
      hod: hodGroup || null,
      categories: categories,
    };
  };

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
            <TableHead className="w-[300px] text-white">Role/Department</TableHead>
            <TableHead className="text-white">Assigned User(s)</TableHead>
            <TableHead className="w-[100px] text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenedData
            .filter(
              (node) =>
                (node.isRoleGroup && node.groupName !== 'HOD') ||
                node.groupName === 'Committee' ||
                node.groupName === 'Nodal Officer'
            )
            .map((node) => (
              <TableRow key={node.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{node.groupName || node.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {node.mappedUser && node.mappedUser.length > 0 ? (
                    <div className="flex space-x-1">
                      {node.mappedUser.map((user, idx) => (
                        <div key={idx} className="text-sm">
                          {user.userDetail}
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
              <div className="flex justify-end p-4">
                <Button
                  onClick={() => {
                    setSelectedNode({
                      id: 0,
                      groupName: '',
                      description: '',
                      isRoleGroup: false,
                      roleId: null,
                      isServiceCategory: true,
                      mappedUser: [],
                      unitId: '396',
                      createdBy: '',
                    });
                    setIsEditMode(false);
                    setAddUserDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
                    hod={getDepartmentData(dept).hod}
                    categories={getDepartmentData(dept).categories}
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

      {/* Category Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Users in {selectedCategoryName}</DialogTitle>
            <DialogDescription>List of all users assigned to this category</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCategoryUsers.map((user, index) => (
              <div key={index} className="py-2 border-b last:border-b-0">
                <p className="font-medium">{user.userDetail}</p>
                {user.departments && user.departments.length > 0 && (
                  <p className="text-sm text-gray-500">Departments: {user.departments.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableViewCorporateOffice;
