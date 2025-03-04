import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
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

interface GrievanceActionsProps {
  isCreator: boolean;
  canAcceptReject: boolean;
  onAcceptReject: (accept: boolean, feedback?: string) => void;
  onResolutionSubmit: (resolution: string) => void;
  onTransfer: () => void;
  onCommentSubmit: (comment: string, attachments: File[]) => void;
  onStatusChange?: (status: number) => void;
  status: string;
  setStatus: (status: string) => void;
}

export const GrievanceActions = ({
  status,
  setStatus,
  isCreator,
  canAcceptReject,
  onAcceptReject,
  onResolutionSubmit,
  onTransfer,
  onCommentSubmit,
  onStatusChange,
}: GrievanceActionsProps) => {
  const [commentText, setCommentText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

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

  return (
    <Card className="bg-white shadow-sm mt-6">
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
              <div className="flex gap-4 justify-end items-center">
                <Heading type={6} className="text-gray-700 font-semibold">
                  Change Status
                </Heading>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">In Progress</SelectItem>
                    <SelectItem value="3">Awaiting Info</SelectItem>
                    <SelectItem value="4">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Heading type={6}>Comment</Heading>
              <div className="h-[200px]">
                <ReactQuill theme="snow" style={{ height: '150px' }} value={commentText} onChange={setCommentText} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    Add Attachments
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleCommentSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!commentText.trim()}
                >
                  Submit
                </Button>
                <Button onClick={onTransfer} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Transfer to Nodal Officer
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
