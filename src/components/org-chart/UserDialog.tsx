import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserSelect from './UserSelect';
import Loader from '@/components/ui/loader';
import { FlattenedNode, UserDetails } from '@/types/orgChart';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  selectedNode: FlattenedNode | null;
  selectedUsers: UserDetails[];
  onUsersChange: (users: UserDetails[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  shouldAllowMultiSelect: (node: FlattenedNode | null) => boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  isEditMode,
  selectedNode,
  selectedUsers,
  onUsersChange,
  onSubmit,
  isSubmitting,
  shouldAllowMultiSelect,
}) => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Update' : 'Add New Employee'}</DialogTitle>
          {/* <DialogDescription>
            {isEditMode
              ? `Update user for ${selectedNode?.groupName || selectedNode?.description}`
              : `Add a new user for ${selectedNode?.groupName || selectedNode?.description}`}
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <UserSelect
            employees={employeeList}
            value={selectedUsers}
            onChange={(users) => {
              onUsersChange(
                users.map((user) => ({
                  userCode: user.userCode,
                  userDetail: user.userDetail,
                  departments: [],
                }))
              );
            }}
            isMulti={shouldAllowMultiSelect(selectedNode)}
            label="Select Employee"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={selectedUsers.length === 0 || isSubmitting}>
            {isSubmitting ? <Loader /> : null}
            {isEditMode ? 'Update User' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
