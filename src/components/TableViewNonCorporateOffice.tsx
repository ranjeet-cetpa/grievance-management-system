import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, User, Users } from 'lucide-react';
import Loader from '@/components/ui/loader';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import UserSelect from '@/components/org-chart/UserSelect';
import NonCorporateDepartmentCard from '@/components/org-chart/NonCorporateDepartmentCard';
import axios from 'axios';
import toast from 'react-hot-toast';
import { extractUniqueUnits } from '@/lib/helperFunction';
import { Checkbox } from './ui/checkbox';
import { Label } from '@radix-ui/react-label';

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
  level?: number;
}

// Add department node type
interface DepartmentNode extends OrgNode {
  isCommitee: false;
  isHOD: false;
  isServiceCategory: false;
  childGroups: [];
}

const TableViewNonCorporateOffice = ({ unitId }: { unitId: number }) => {
  const [chartData, setChartData] = React.useState<OrgNode | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<OrgNode | null>(null);
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserCode, setNewUserCode] = React.useState('');
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<UserDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [flattenedData, setFlattenedData] = React.useState<OrgNode[]>([]);
  const [nominateFromOtherUnits, setNominateFromOtherUnits] = React.useState(false);
  const [selectedNominationUnit, setSelectedNominationUnit] = React.useState<number | null>(396);

  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);

  const capitalize = (text: string) => {
    return text
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const flattenOrgData = (node: OrgNode, level = 0): OrgNode[] => {
    let result: OrgNode[] = [{ ...node, level }];
    if (node.childGroups) {
      node.childGroups.forEach((child) => {
        result = result.concat(flattenOrgData(child, level + 1));
      });
    }
    return result;
  };

  const dataFetcher = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/GetOrgGroupHierarchy?unitId=${unitId}`
      );
      const result = await response.data;
      setChartData(result.data);
      setFlattenedData(flattenOrgData(result.data));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch organization data');
      toast.error('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedNode) return;

    try {
      console.log('selectedNode', selectedNode);
      setIsSubmitting(true);
      const requestBody = {
        groupMasterId: selectedNode.id,
        unitId: unitId?.toString(),

        unitName: unitsDD.find((unit) => unit.unitId === Number(unitId))?.unitName,
        userCodes: selectedUsers.map((user) => ({
          userCode: user.userCode,
          userDetails: user.userDetail,
          departments: [],
        })),
      };

      await axios.post('https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/UpdateUserGroupMapping', requestBody);
      toast.success('User mapping updated successfully');
      dataFetcher();
      setAddUserDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user group mapping:', error);
      toast.error('Failed to update user mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewUserName('');
    setNewUserCode('');
    setSelectedUsers([]);
    setSelectedNode(null);
    setIsEditMode(false);
  };

  const getDepartmentDataForName = (deptName: string) => {
    const deptNode = flattenedData.find(
      (node) =>
        node.groupName?.toLowerCase() === deptName.toLowerCase() ||
        node.description?.toLowerCase() === deptName.toLowerCase()
    );

    if (!deptNode) {
      // Create a default department node if not found
      const defaultNode: DepartmentNode = {
        id: 0,
        groupName: deptName,
        description: deptName,
        isCommitee: false,
        isHOD: false,
        isServiceCategory: false,
        childGroups: [],
        mappedUser: [],
        level: 2,
      };
      return defaultNode;
    }

    return deptNode as DepartmentNode;
  };

  useEffect(() => {
    dataFetcher();
  }, [unitId]);

  useEffect(() => {
    if (nominateFromOtherUnits) {
      setSelectedUsers([]);
    }
  }, [nominateFromOtherUnits]);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  // Filter only CGM and Nodal Officer for the main table
  const mainTableData = flattenedData.filter(
    (node) => node.level <= 1 && (node.groupName === 'CGM' || node.groupName === 'Nodal Officer')
  );

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
          {mainTableData.map((node) => (
            <TableRow key={node.id} className={node.level > 0 ? 'pl-' + node.level * 4 : ''}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className={`${node.level > 0 ? 'ml-' + node.level * 4 : ''}`}>{node.groupName}</span>
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
                <div className="flex gap-2">
                  {node.mappedUser && node.mappedUser.length > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNode(node);
                        setIsEditMode(true);
                        setSelectedUsers(node.mappedUser);
                        setAddUserDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNode(node);
                        setIsEditMode(false);
                        setSelectedUsers([]);
                        setAddUserDialogOpen(true);
                      }}
                    >
                      <User className="w-4 h-4" />+
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Departments Section */}
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
                {['IT', 'HR', 'Finance', 'Others'].map((dept) => {
                  const deptNode = getDepartmentDataForName(dept);
                  return (
                    <NonCorporateDepartmentCard
                      key={dept}
                      departmentName={dept}
                      mappedUsers={deptNode.mappedUser}
                      onEdit={() => {
                        setSelectedNode(deptNode);
                        setIsEditMode(true);
                        setSelectedUsers(deptNode.mappedUser);
                        setAddUserDialogOpen(true);
                      }}
                      onAdd={() => {
                        setSelectedNode(deptNode);
                        setIsEditMode(false);
                        setSelectedUsers([]);
                        setAddUserDialogOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Add/Edit User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Users' : 'Add Users'}</DialogTitle>

            <DialogDescription>
              {isEditMode
                ? `Edit users for ${selectedNode?.description || selectedNode?.groupName}`
                : `Add users for ${selectedNode?.description || selectedNode?.groupName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nominate"
                checked={nominateFromOtherUnits}
                onCheckedChange={(checked) => {
                  setNominateFromOtherUnits(checked as boolean);
                }}
              />
              <label
                htmlFor="nominate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nominate from other units
              </label>
            </div>

            {nominateFromOtherUnits && (
              <div className="flex flex-col  gap-2">
                <Label>Select Unit</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-blue-50 text-black px-3  py-2 text-sm ring-offset-background"
                  value={selectedNominationUnit || ''}
                  onChange={(e) => setSelectedNominationUnit(Number(e.target.value))}
                >
                  {unitsDD
                    ?.filter((unit) => unit.unitId !== Number(unitId))
                    .map((unit) => (
                      <option key={unit.unitId} value={unit.unitId}>
                        {unit.unitName}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <UserSelect
              employees={
                nominateFromOtherUnits && selectedNominationUnit
                  ? employeeList.filter((emp) => emp.unitId === selectedNominationUnit)
                  : employeeList.filter((emp) => emp.unitId === Number(unitId))
              }
              value={selectedUsers}
              onChange={(users) =>
                setSelectedUsers(
                  users.map((user) => ({
                    userCode: user.userCode,
                    userDetail: user.userDetail,
                    departments: [],
                  }))
                )
              }
              isMulti={false}
              label="Select Users"
            />
            {selectedUsers.length === 0 && <div className="text-red-500 text-xs">Please select at least one user</div>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUserDialogOpen(false);
                setSelectedNominationUnit(null);
                setNominateFromOtherUnits(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={selectedUsers.length === 0 || isSubmitting}>
              {isSubmitting ? <Loader /> : null}
              {isEditMode ? 'Update Users' : 'Add Users'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableViewNonCorporateOffice;
