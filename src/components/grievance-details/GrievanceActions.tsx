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

interface GroupMaster {
  id: number;
  groupName: string;
  isHOD: boolean;
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
  onStatusChange?: (status: number) => void;
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
  const user = useSelector((state: RootState) => state.user);
  const { isHOD, isUnitCGM, isCommittee } = useUserRoles();
  const { grievanceId } = useParams();
  useEffect(() => {
    const fetchHodGroups = async () => {
      try {
        const response = await axiosInstance.get('/Admin/GetGroupMasterList');
        setGroupMasterList(response.data.data);
        if (response.data.statusCode === 200) {
          const hodGroupsList = response.data.data.filter((group: GroupMaster) => group.isHOD);
          setHodGroups(hodGroupsList);
        }
      } catch (error) {
        console.error('Error fetching HOD groups:', error);
      }
    };

    const fetchHodGroupMembers = async () => {
      const response = await axiosInstance.get(`/Admin/GetAddressalList?unitId=396`);
      const filteredGroups = response.data?.data
        ?.flatMap((a) => a?.mappedUserCode)
        ?.filter((b) => b.groupDetails?.isHOD && b.userCode === user?.EmpCode?.toString());
      var arr = [];
      for (let group of filteredGroups) {
        const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${group.groupDetails.hoDofGroupId}`);
        const filteredGroupMembers = response.data.data.groupMapping
          ?.flatMap((mapping) => mapping)
          ?.filter((member) => member.unitId === '396');
        arr.push(filteredGroupMembers);
      }
      setFilteredGroupMembers(...arr);
    };

    fetchHodGroups();
    fetchHodGroupMembers();
  }, []);

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
          const firstUser = response.data.data.groupMapping[0][0];

          // Create form data for transfer
          const formData = new FormData();

          // Set assigned user details from the group
          formData.set('assignedUserCode', firstUser.userCode);
          formData.set('assignedUserDetails', firstUser.userDetails);
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
    <Card className="bg-white shadow-sm ">
      <CardContent className="p-6">
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
              <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Accept Resolution</DialogTitle>
                    <DialogDescription>Are you sure you want to accept this resolution?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        onAcceptReject(true);
                        setIsAcceptDialogOpen(false);
                      }}
                    >
                      Confirm Accept
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Resolution</DialogTitle>
                    <DialogDescription>Please provide feedback for rejecting this resolution</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Enter your feedback here..."
                      value={rejectFeedback}
                      onChange={(e) => setRejectFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsRejectDialogOpen(false);
                        setRejectFeedback('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        onAcceptReject(false, rejectFeedback);
                        setIsRejectDialogOpen(false);
                        setRejectFeedback('');
                      }}
                      disabled={!rejectFeedback.trim()}
                    >
                      Confirm Reject
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Heading type={6} className="text-gray-700">
                    Change Status
                  </Heading>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">In Progress</SelectItem>
                      <SelectItem value="3">Awaiting Info</SelectItem>
                      <SelectItem value="4">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-white bg-gray-800 hover:bg-gray-700 px-2 py-1.5 rounded-md flex items-center gap-1"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Attach</span>
                </label>
              </div>
              <div className="h-[150px]">
                <ReactQuill
                  theme="snow"
                  style={{ height: '100px' }}
                  value={commentText}
                  placeholder=" Add Comment "
                  onChange={setCommentText}
                />
              </div>
              <div className="space-y-2">
                {attachments.length > 0 && (
                  <div className="space-y-1">
                    {attachments?.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-1.5 rounded-md">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 h-7 px-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCommentSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white h-9 px-4"
                  disabled={!isCommentValid}
                >
                  Submit
                </Button>
                {!isNodalOfficer && (
                  <Button
                    onClick={handleTransfer}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-4"
                    disabled={!isCommentValid}
                  >
                    Transfer to Nodal Officer
                  </Button>
                )}
                {isNodalOfficer && user?.unitId !== '396' && (
                  <Button
                    onClick={() => {
                      if (isCommentValid) {
                        onTransferToCGM(commentText, attachments);
                        setCommentText('');
                        setAttachments([]);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
                    disabled={!isCommentValid}
                  >
                    Transfer to Unit CGM
                  </Button>
                )}
                {isNodalOfficer && user?.unitId === '396' && (
                  <Button
                    onClick={() => setIsHodDialogOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white h-9 px-4"
                    disabled={!isCommentValid}
                  >
                    Transfer to HOD Group
                  </Button>
                )}
                {isHOD && (
                  <Button
                    onClick={() => {
                      setIsHodAssignDialogOpen(true);
                    }}
                    disabled={!isCommentValid}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4"
                  >
                    Assign To Members
                  </Button>
                )}
                {isUnitCGM && (
                  <Button
                    onClick={() => setIsGroupChangeDialogOpen(true)}
                    disabled={!isCommentValid}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
                  >
                    Change Group
                  </Button>
                )}
              </div>
            </div>

            <Dialog open={isGroupChangeDialogOpen} onOpenChange={setIsGroupChangeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Group</DialogTitle>
                  <DialogDescription>Please select a unit and group to change</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label>Select Unit</Label>
                    <Select value={selectedUnit} onValueChange={handleUnitChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="396">Corporate Office</SelectItem>
                        <SelectItem value={user?.unitId?.toString() || ''}>{user?.Unit || 'Current Unit'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUnit && (
                    <div>
                      <Label>Select Group</Label>
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredGroups()?.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.groupName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsGroupChangeDialogOpen(false);
                      setSelectedUnit('');
                      setSelectedGroup('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleGroupSubmit}
                    disabled={!selectedUnit || !selectedGroup}
                  >
                    Change Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

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
                      {group.groupName}
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

        <Dialog open={isHodAssignDialogOpen} onOpenChange={setIsHodAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign to Group Member</DialogTitle>
              <DialogDescription>Please select a member to assign the grievance</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Select
                value={selectedMember?.userCode}
                onValueChange={(value) => {
                  const member = filteredGroupMembers.find((m) => m.userCode === value);
                  setSelectedMember(member);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Member" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGroupMembers?.map((member) => (
                    <SelectItem key={member.userCode} value={member.userCode}>
                      {member.userDetails}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsHodAssignDialogOpen(false);
                  setSelectedMember(null);
                  setCommentText('');
                  setAttachments([]);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  if (selectedMember) {
                    handleHodAssignToMembers(selectedMember, commentText, attachments);
                    setIsHodAssignDialogOpen(false);
                    setSelectedMember(null);
                    setCommentText('');
                    setAttachments([]);
                  }
                }}
                disabled={!selectedMember}
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
