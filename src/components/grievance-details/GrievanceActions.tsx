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

interface GroupMaster {
  id: number;
  groupName: string;
  isHOD: boolean;
}

interface GrievanceActionsProps {
  isNodalOfficer: boolean;
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
}

export const GrievanceActions = ({
  isNodalOfficer,
  status,
  setStatus,
  isCreator,
  canAcceptReject,
  onAcceptReject,
  onResolutionSubmit,
  onTransfer,
  onTransferToCGM,
  onTransferToHOD,
  onCommentSubmit,
  onStatusChange,
}: GrievanceActionsProps) => {
  const [commentText, setCommentText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isHodDialogOpen, setIsHodDialogOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [hodGroups, setHodGroups] = useState<GroupMaster[]>([]);
  const [selectedHodGroup, setSelectedHodGroup] = useState<string>('');
  const user = useSelector((state: RootState) => state.user);
  const unitId = user?.unitId;

  useEffect(() => {
    const fetchHodGroups = async () => {
      try {
        const response = await axiosInstance.get('/Admin/GetGroupMasterList');
        if (response.data.statusCode === 200) {
          const hodGroupsList = response.data.data.filter((group: GroupMaster) => group.isHOD);
          setHodGroups(hodGroupsList);
        }
      } catch (error) {
        console.error('Error fetching HOD groups:', error);
      }
    };

    fetchHodGroups();
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
                    {attachments.map((file, index) => (
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
                <Button
                  onClick={handleTransfer}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-4"
                  disabled={!isCommentValid}
                >
                  Transfer to Nodal Officer
                </Button>
                {isNodalOfficer && unitId !== '396' && (
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
                {isNodalOfficer && unitId === '396' && (
                  <Button
                    onClick={() => setIsHodDialogOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white h-9 px-4"
                    disabled={!isCommentValid}
                  >
                    Transfer to HOD Group
                  </Button>
                )}
              </div>
            </div>
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
                  {hodGroups.map((group) => (
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
      </CardContent>
    </Card>
  );
};
