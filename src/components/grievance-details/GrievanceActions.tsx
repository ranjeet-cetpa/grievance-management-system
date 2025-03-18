import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/ui/heading';
import { Paperclip } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import useUserRoles from '@/hooks/useUserRoles';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { environment } from '@/config';
import { useParams } from 'react-router';
import { findEmployeeDetails } from '@/lib/helperFunction';

interface GroupMaster {
  id: number;
  groupName: string;
  isHOD: boolean;
  parentGroupId: number;
}

interface GrievanceActionsProps {
  isNodalOfficer: boolean;
  grievance: any;
  isCreator: boolean;
  canAcceptReject: boolean;
  unitId?: number;
  onAcceptReject: (accept: boolean, feedback?: string) => void;
  onResolutionSubmit: (resolution: string) => void;
  onTransfer: (commentText: string, attachments: File[]) => void;
  onTransferToCGM?: (commentText: string, attachments: File[]) => void;
  onTransferToHOD?: (formData: FormData) => void;
  onCommentSubmit: (comment: string, attachments: File[]) => void;
  onStatusChange?: (status: number, commentText?: string) => void;
  status: string;
  setStatus: (status: string) => void;
  handleHodAssignToMembers: (selectedMember: any, commentText: string, attachments: File[]) => void;
  handleGroupChangeByCGM?: (selectedUnit: string) => void;
  setGrievance: any;
}

export const GrievanceActions = ({
  grievance,
  setGrievance,
  isNodalOfficer,
  status,
  setStatus,
  isCreator,
  canAcceptReject,
  onAcceptReject,
  handleHodAssignToMembers,
  onResolutionSubmit,
  onTransfer,
  onTransferToCGM,
  onTransferToHOD,
  onCommentSubmit,
  onStatusChange,
  handleGroupChangeByCGM,
}: GrievanceActionsProps) => {
  const [commentText, setCommentText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [filteredGroupMembers, setFilteredGroupMembers] = useState<any[]>([]);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isHodDialogOpen, setIsHodDialogOpen] = useState(false);
  const [isHodAssignDialogOpen, setIsHodAssignDialogOpen] = useState(false);
  const [groupMasterList, setGroupMasterList] = useState<any[]>([]);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [hodGroups, setHodGroups] = useState<GroupMaster[]>([]);

  const [selectedHodGroup, setSelectedHodGroup] = useState<string>('');

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isGroupChangeDialogOpen, setIsGroupChangeDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [hodChildrenGroups, setHodChildrenGroups] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const { isHOD, isUnitCGM, isCommittee } = useUserRoles();
  const { grievanceId } = useParams();
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  useEffect(() => {
    const fetchHodGroups = async () => {
      try {
        const response = await axiosInstance.get('/Admin/GetGroupMasterList');
        setGroupMasterList(response.data.data);
        setHodChildrenGroups(
          response.data.data.filter((group: GroupMaster) => Number(group.parentGroupId) === Number(grievance?.tGroupId))
        );

        if (response.data.statusCode === 200) {
          const hodGroupsList = response.data.data.filter((group: GroupMaster) => group.roleId === 6);
          setHodGroups(hodGroupsList);
        }
      } catch (error) {
        console.error('Error fetching HOD groups:', error);
      }
    };

    const fetchHodGroupMembers = async () => {
      try {
        const members: any[] = [];

        for (const group of hodChildrenGroups) {
          const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${group.id}`);

          if (response.data.statusCode === 200 && response.data.data.groupMapping.length > 0) {
            const groupMembers = response.data.data.groupMapping.flat();
            const simplifiedMembers = groupMembers.map((member: any) => ({
              groupId: group.id,
              id: member.id,
              userCode: member.userCode,
              userDetails: member.userDetails,
              unitId: member.unitId,
              unitName: member.unitName,
            }));
            members.push(...simplifiedMembers);
          }
        }

        setFilteredGroupMembers(members);
      } catch (error) {
        console.error('Error fetching HOD group members:', error);
      }
    };

    fetchHodGroups();
    fetchHodGroupMembers(); // Call the function to fetch members
  }, [grievance?.tGroupId]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onCommentSubmit(commentText, attachments);
      setCommentText('');
      setAttachments([]);
    }
  };

  const handleTransfer = () => {
    if (commentText.trim()) {
      onTransfer(commentText, attachments);
      setCommentText('');
      setAttachments([]);
    }
  };

  const isCommentValid = commentText.trim().length > 0;

  const handleHodTransfer = async () => {
    try {
      if (selectedHodGroup && isCommentValid) {
        // Fetch group details
        const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${selectedHodGroup}`);

        if (response.data.statusCode === 200 && response.data.data.groupMapping.length > 0) {
          console.log('this is response hod group ', response.data.data);
          const firstUser = response.data.data.groupMapping[0][0];

          // Create form data for transfer
          const formData = new FormData();

          // Set assigned user details from the group
          formData.set('assignedUserCode', firstUser.userCode);
          formData.set('assignedUserDetails', firstUser.userDetails);
          formData.set('TUnitId', findEmployeeDetails(employeeList, firstUser?.userCode.toString())?.employee?.unitId);
          formData.set(
            'TDepartment',
            findEmployeeDetails(employeeList, firstUser?.userCode.toString())?.employee?.department
          );
          formData.set('userCode', user?.EmpCode.toString());
          formData.set('TGroupId', selectedHodGroup);
          formData.set('CommentText', commentText);
          formData.set('isInternal', 'true');

          // Append attachments if any
          attachments.forEach((file) => {
            formData.append('attachments', file);
          });

          // Call the transfer API
          await onTransferToHOD?.(formData);

          // Clear form and close dialog
          setCommentText('');
          setAttachments([]);
          setIsHodDialogOpen(false);
          setSelectedHodGroup('');
        } else {
          console.error('No users found in the selected group');
        }
      }
    } catch (error) {
      console.error('Error transferring to HOD:', error);
    }
  };

  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
    setSelectedGroup('');
  };

  const getFilteredGroups = () => {
    if (selectedUnit === '396') {
      return groupMasterList.filter((group) => group.isHOD === true);
    } else {
      return groupMasterList.filter((group) => !group.isHOD && !group.isCommitee);
    }
  };

  const handleGroupSubmit = async () => {
    try {
      if (!selectedGroup) return;

      const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${selectedGroup}`);

      if (response.data.statusCode === 200 && response.data.data.groupMapping.length > 0) {
        // Get the first user from the first array in groupMapping
        const firstUser = response.data.data.groupMapping[0][0];

        // Create form data for transfer
        const formData = new FormData();

        // Append all grievance properties to FormData
        const excludedFields = [
          'attachments',
          'statusId',
          'userCode',
          'userDetails',
          'grievanceProcessId',
          'createdBy',
          'createdDate',
          'modifiedBy',
          'modifiedDate',
        ];
        Object.entries(grievance || {}).forEach(([key, value]) => {
          if (value !== null && value !== undefined && !excludedFields.includes(key)) {
            formData.append(key, value.toString());
          }
        });

        // Set assigned user details from the group
        formData.set('assignedUserCode', firstUser.userCode);
        formData.set('assignedUserDetails', firstUser.userDetails);
        formData.set('userCode', user?.EmpCode.toString());
        formData.set('statusId', grievance?.statusId);
        formData.set('isInternal', 'true');

        // Make the API call to transfer
        const transferResponse = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (transferResponse.data.statusCode === 200) {
          toast.success('Group changed successfully');
          const updatedResponse = await axiosInstance.get(
            `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment?.baseUrl}`
          );
          if (updatedResponse.data.statusCode === 200) {
            setGrievance(updatedResponse.data.data);
          }
        } else {
          toast.error('Failed to change group');
        }
      }
    } catch (error) {
      console.error('Error changing group:', error);
      toast.error('Failed to change group');
    } finally {
      setIsGroupChangeDialogOpen(false);
      setSelectedUnit('');
      setSelectedGroup('');
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-3 space-y-4">
        {isCreator ? (
          canAcceptReject && (
            <div className="flex gap-4">
              <Button
                onClick={() => setIsAcceptDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Accept Resolution
              </Button>
              <Button onClick={() => setIsRejectDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
                Reject Resolution
              </Button>
              {/* Dialogs for Accept/Reject */}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {/* React Quill Editor */}
            <div className="relative h-[130px]">
              {' '}
              {/* Wrapper for React Quill and Attach Button */}
              {/* React Quill Editor */}
              <ReactQuill
                theme="snow"
                style={{ height: '90px' }} // Adjust height as needed
                value={commentText}
                placeholder="Add Comment"
                onChange={setCommentText}
                modules={{
                  toolbar: {
                    container: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                    ],
                  },
                }}
              />
              {/* Attach Button */}
              <div className="absolute top-1 right-1 z-10">
                {' '}
                {/* Position the button in the top-right corner */}
                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-md flex items-center gap-1"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Attach</span>
                </label>
              </div>
            </div>

            <div className="mt-1">
              {/* Attachments Display (Horizontal Scrollable) */}
              {attachments.length > 0 && (
                <div className="flex gap-2 overflow-x-auto flex-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-1.5 rounded-md min-w-[120px]"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 h-7 px-2 font-bold font-weight-bold"
                      >
                        x
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-3  mt-[10px] gap-3">
              {/* <Button
                onClick={handleCommentSubmit}
                className="bg-green-600 hover:bg-green-700 text-white h-9"
                disabled={!isCommentValid}
              >
                Comment
              </Button> */}
              {!isNodalOfficer &&
                grievance?.round !== 3 &&
                grievance?.createdBy.toString() !== user?.EmpCode.toString() && (
                  <Button
                    onClick={handleTransfer}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-9"
                    disabled={!isCommentValid}
                  >
                    Transfer to Nodal Officer
                  </Button>
                )}
              {isNodalOfficer &&
                user?.unitId !== '396' &&
                grievance?.createdBy.toString() !== user?.EmpCode.toString() && (
                  <Button
                    onClick={() => {
                      if (isCommentValid) {
                        onTransferToCGM(commentText, attachments);
                        setCommentText('');
                        setAttachments([]);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                    disabled={!isCommentValid}
                  >
                    Transfer to Unit CGM
                  </Button>
                )}
              {isNodalOfficer &&
                user?.unitId === '396' &&
                grievance?.createdBy.toString() !== user?.EmpCode.toString() && (
                  <Button
                    onClick={() => setIsHodDialogOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white h-9"
                    disabled={!isCommentValid}
                  >
                    Transfer to HOD Group
                  </Button>
                )}
              {isHOD && grievance?.createdBy.toString() !== user?.EmpCode.toString() && (
                <Button
                  onClick={() => setIsHodAssignDialogOpen(true)}
                  disabled={!isCommentValid}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
                >
                  Assign To Members
                </Button>
              )}
              {isUnitCGM && grievance?.createdBy.toString() !== user?.EmpCode.toString() && (
                <Button
                  onClick={() => setIsGroupChangeDialogOpen(true)}
                  disabled={!isCommentValid}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                >
                  Change Group
                </Button>
              )}
              <Button
                onClick={() => onStatusChange?.(3, commentText)}
                className="bg-red-600 hover:bg-red-700 text-white h-9"
                disabled={!isCommentValid}
              >
                Close Grievance
              </Button>
            </div>
          </div>
        )}
        <Dialog open={isHodAssignDialogOpen} onOpenChange={setIsHodAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign To Members</DialogTitle>
              <DialogDescription>Select a member to assign this grievance</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select
                value={selectedMember?.userCode} // Use userCode as the value
                onValueChange={(value) => {
                  // Find the member by userCode
                  const member = filteredGroupMembers.find((m) => m.userCode.toString() === value);
                  setSelectedMember(member); // Set the selected member
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Member" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGroupMembers.map((member) => (
                    <SelectItem key={member.userCode} value={member.userCode.toString()}>
                      {member.userDetails}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHodAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  if (selectedMember && isCommentValid) {
                    console.log('Selected Member:', selectedMember); // Log the selected member
                    handleHodAssignToMembers(selectedMember, commentText, attachments);
                    // setCommentText('');
                    setAttachments([]);
                    setIsHodAssignDialogOpen(false);
                    setSelectedMember(null);
                  }
                }}
                disabled={!selectedMember || !isCommentValid} // Disable if no member is selected or comment is invalid
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogs for HOD Transfer, Group Change, etc. */}
        <Dialog open={isHodDialogOpen} onOpenChange={setIsHodDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer to HOD Group</DialogTitle>
              <DialogDescription>Please select a HOD group to transfer the grievance</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedHodGroup} onValueChange={setSelectedHodGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select HOD Group" />
                </SelectTrigger>
                <SelectContent>
                  {hodGroups?.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHodDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleHodTransfer}
                disabled={!selectedHodGroup}
              >
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Other Dialogs */}
      </CardContent>
    </Card>
  );
};
