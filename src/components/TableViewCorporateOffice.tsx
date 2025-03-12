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

interface UserDetails {
  userCode: string;
  userDetail: string;
  departments: string[];
}

interface OrgNode {
  id: number;
  groupName: string;
  description: string;
  isCommitee: boolean;
  isHOD: boolean;
  isServiceCategory: boolean;
  unitId?: string;
  parentGroupId?: number | null;
  childGroups: OrgNode[];
  mappedUser: UserDetails[];
}

interface FlattenedNode {
  id: number;
  groupName: string;
  description: string;
  isCommitee: boolean;
  isHOD: boolean;
  isServiceCategory: boolean;
  level: number;
  mappedUser: UserDetails[];
  parentGroupId?: number | null;
  unitId?: string;
  department?: string;
}

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
        {/* <span className="font-medium">{node.description}</span> */}
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
  const [newUserName, setNewUserName] = useState('');
  const [newUserCode, setNewUserCode] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedCategoryUsers, setSelectedCategoryUsers] = useState<UserDetails[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const employeeList = useSelector((state: RootState) => state.employee.employees);

  const flattenOrgChart = (
    node: OrgNode,
    parentId: number | null = null,
    level: number = 0,
    result: FlattenedNode[] = []
  ): FlattenedNode[] => {
    const currentNode: FlattenedNode = {
      id: node?.id,
      groupName: node?.groupName,
      description: node.description,
      isCommitee: node?.isCommitee,
      isHOD: node.isHOD,
      isServiceCategory: node.isServiceCategory,
      level,
      mappedUser: node.mappedUser || [],
      parentGroupId: parentId,
      unitId: node.unitId,
      department: node.mappedUser.length > 0 ? node.mappedUser[0].departments[0] : undefined,
    };

    result.push(currentNode);

    if (node.childGroups) {
      node.childGroups.forEach((child) => {
        flattenOrgChart(child, node.id, level + 1, result);
      });
    }

    return result;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/GetOrgGroupHierarchy?unitId=396'
      );
      const result = await response.data;
      console.log(result.data);
      setChartData(result.data);

      setFlattenedData(flattenOrgChart(result.data, null, 0, []));
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
        unitId: selectedNode.unitId || '396',
        unitName: selectedNode.groupName,
        userCodes: selectedNode.isCommitee
          ? selectedUsers.map((user) => ({
              userCode: user.userCode,
              userDetails: user.userDetail,
              departments: [],
            }))
          : [
              {
                userCode: newUserCode,
                userDetails: newUserName,
                departments: [],
              },
            ],
      };

      await axios.post('https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/UpdateUserGroupMapping', requestBody);
      toast.success('User mapping updated successfully');

      // Refresh data
      await fetchData();

      // Reset form state
      setAddUserDialogOpen(false);
      setNewUserName('');
      setNewUserCode('');
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
    if (node.isCommitee) {
      setSelectedUsers(node.mappedUser);
    } else {
      setNewUserName(node.mappedUser[0]?.userDetail || '');
      setNewUserCode(node.mappedUser[0]?.userCode || '');
    }
    setAddUserDialogOpen(true);
  };

  const handleAddNode = (node: FlattenedNode) => {
    setSelectedNode(node);
    setIsEditMode(false);
    setNewUserName('');
    setNewUserCode('');
    setAddUserDialogOpen(true);
  };

  const getDepartmentData = (departmentName: string) => {
    // Find the Nodal Officer first
    const nodalOfficer = flattenedData.find((node) => node.groupName === 'Nodal Officer');
    if (!nodalOfficer) return { hod: null, categories: [] };

    // Find the department under Nodal Officer
    const departmentGroup = flattenedData.find(
      (node) => node.groupName === departmentName && node.parentGroupId === nodalOfficer.id
    );

    if (!departmentGroup) return { hod: null, categories: [] };

    // Find the HOD group (it's under the department and has isHOD true)
    const hodGroup = flattenedData.find(
      (node) => node.parentGroupId === departmentGroup.id && node.groupName === 'HOD' && node.isHOD
    );

    // Find categories (they're under the HOD group)
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
          {/* Show only Managing Director and Committee and Nodal Officer in the main table */}
          {flattenedData
            .filter(
              (node) =>
                (!node.isHOD && !node.isServiceCategory) ||
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleEditNode(node);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleAddNode(node);
                      }}
                    >
                      <User className="w-4 h-4" />+
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

          {/* Department-wise Sections */}
          <TableRow>
            <TableCell colSpan={3} className="p-0">
              {/* Add Department Button */}
              <div className="flex justify-end p-4">
                <Button
                  onClick={() => {
                    setSelectedNode({
                      id: 0,
                      groupName: '',
                      description: '',
                      isCommitee: false,
                      isHOD: false,
                      isServiceCategory: true,
                      level: 0,
                      mappedUser: [],
                      unitId: '396',
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
                {/* IT Department */}
                <div className="border rounded-lg p-4">
                  <div className="flex flex-col gap-1    items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">IT Department</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const itDept = getDepartmentData('IT');
                        if (itDept.hod) {
                          setSelectedNode({
                            id: 0,
                            groupName: '',
                            description: '',
                            isCommitee: false,
                            isHOD: false,
                            isServiceCategory: true,
                            level: 0,
                            mappedUser: [],
                            parentGroupId: itDept.hod.id,
                            unitId: '396',
                          });
                          setIsEditMode(false);
                          setAddUserDialogOpen(true);
                        } else {
                          toast.error('Please add HOD first');
                        }
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Category +
                    </Button>
                  </div>
                  {/* HOD Section */}
                  <div className="mb-6">
                    <h4 className="font-medium bg-blue-100 text-center mb-3 text-blue-600">HOD</h4>
                    <RenderHOD node={getDepartmentData('IT').hod} onEdit={handleEditNode} onAdd={handleAddNode} />
                  </div>
                  {/* Categories Section */}
                  <div>
                    <h4 className="font-medium bg-blue-100 text-center mb-3 text-blue-600">Categories</h4>
                    <RenderCategories
                      categories={getDepartmentData('IT').categories}
                      onEdit={handleEditNode}
                      onAdd={handleAddNode}
                    />
                  </div>
                </div>

                {/* HR Department */}
                <div className="border rounded-lg p-4">
                  <div className="flex  flex-col gap-1 items-center justify-between mb-4">
                    <h3 className="font-semibold  text-lg">HR Department</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const hrDept = getDepartmentData('HR');
                        if (hrDept.hod) {
                          setSelectedNode({
                            id: 0,
                            groupName: '',
                            description: '',
                            isCommitee: false,
                            isHOD: false,
                            isServiceCategory: true,
                            level: 0,
                            mappedUser: [],
                            parentGroupId: hrDept.hod.id,
                            unitId: '396',
                          });
                          setIsEditMode(false);
                          setAddUserDialogOpen(true);
                        } else {
                          toast.error('Please add HOD first');
                        }
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Category +
                    </Button>
                  </div>
                  {/* HOD Section */}
                  <div className="mb-6">
                    <h4 className="font-medium text-center  bg-blue-100 mb-3 text-blue-600">HOD</h4>
                    <RenderHOD node={getDepartmentData('HR').hod} onEdit={handleEditNode} onAdd={handleAddNode} />
                  </div>
                  {/* Categories Section */}
                  <div>
                    <h4 className="font-medium text-center  bg-blue-100 mb-3 text-blue-600">Categories</h4>
                    <RenderCategories
                      categories={getDepartmentData('HR').categories}
                      onEdit={handleEditNode}
                      onAdd={handleAddNode}
                    />
                  </div>
                </div>

                {/* Finance Department */}
                <div className="border rounded-lg p-4">
                  <div className="flex flex-col gap-1 items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Finance Department</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const financeDept = getDepartmentData('Finance');
                        if (financeDept.hod) {
                          setSelectedNode({
                            id: 0,
                            groupName: '',
                            description: '',
                            isCommitee: false,
                            isHOD: false,
                            isServiceCategory: true,
                            level: 0,
                            mappedUser: [],
                            parentGroupId: financeDept.hod.id,
                            unitId: '396',
                          });
                          setIsEditMode(false);
                          setAddUserDialogOpen(true);
                        } else {
                          toast.error('Please add HOD first');
                        }
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Category +
                    </Button>
                  </div>
                  {/* HOD Section */}
                  <div className="mb-6">
                    <h4 className="font-medium text-center  bg-blue-100 mb-3 text-blue-600">HOD</h4>
                    <RenderHOD node={getDepartmentData('Finance').hod} onEdit={handleEditNode} onAdd={handleAddNode} />
                  </div>
                  {/* Categories Section */}
                  <div>
                    <h4 className="font-medium mb-3  bg-blue-100 text-center text-blue-600">Categories</h4>
                    <RenderCategories
                      categories={getDepartmentData('Finance').categories}
                      onEdit={handleEditNode}
                      onAdd={handleAddNode}
                    />
                  </div>
                </div>

                {/* Others Department */}
                <div className="border rounded-lg p-4">
                  <div className="flex flex-col gap-1 items-center justify-between mb-4">
                    <h3 className="font-semibold  text-lg">Others Department</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const othersDept = getDepartmentData('Others');
                        if (othersDept.hod) {
                          setSelectedNode({
                            id: 0,
                            groupName: '',
                            description: '',
                            isCommitee: false,
                            isHOD: false,
                            isServiceCategory: true,
                            level: 0,
                            mappedUser: [],
                            parentGroupId: othersDept.hod.id,
                            unitId: '396',
                          });
                          setIsEditMode(false);
                          setAddUserDialogOpen(true);
                        } else {
                          toast.error('Please add HOD first');
                        }
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Category +
                    </Button>
                  </div>
                  {/* HOD Section */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3  bg-blue-100 text-center text-blue-600">HOD</h4>
                    <RenderHOD node={getDepartmentData('Others').hod} onEdit={handleEditNode} onAdd={handleAddNode} />
                  </div>
                  {/* Categories Section */}
                  <div>
                    <h4 className="font-medium mb-3  bg-blue-100 text-center text-blue-600">Categories</h4>
                    <RenderCategories
                      categories={getDepartmentData('Others').categories}
                      onEdit={handleEditNode}
                      onAdd={handleAddNode}
                    />
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Add/Edit User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Edit user for ${selectedNode?.groupName || selectedNode?.description}`
                : `Add a new user for ${selectedNode?.groupName || selectedNode?.description}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <UserSelect
              employees={employeeList}
              value={selectedNode?.isCommitee ? selectedUsers : [{ userCode: newUserCode, userDetail: newUserName }]}
              onChange={(users) => {
                if (selectedNode?.isCommitee) {
                  setSelectedUsers(
                    users.map((user) => ({
                      userCode: user.userCode,
                      userDetail: user.userDetail,
                      departments: [],
                    }))
                  );
                } else {
                  setNewUserCode(users[0]?.userCode || '');
                  setNewUserName(users[0]?.userDetail || '');
                }
              }}
              isMulti={selectedNode?.isCommitee}
              label="Select User"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUserDialogOpen(false);
                setIsEditMode(false);
                setSelectedUsers([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={
                selectedNode?.isCommitee ? selectedUsers.length === 0 : !newUserName || !newUserCode || isSubmitting
              }
            >
              {isSubmitting ? <Loader /> : null}
              {isEditMode ? 'Update User' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
