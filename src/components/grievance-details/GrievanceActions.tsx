import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import ReactQuill from 'react-quill';

interface GrievanceActionsProps {
  isCreator: boolean;
  canAcceptReject: boolean;
  onAcceptReject: (accept: boolean, feedback?: string) => void;
  onResolutionSubmit: (resolution: string) => void;
  onTransfer: () => void;
  onCommentSubmit: (comment: string) => void;
}

export const GrievanceActions = ({
  isCreator,
  canAcceptReject,
  onAcceptReject,
  onResolutionSubmit,
  onTransfer,
  onCommentSubmit,
}: GrievanceActionsProps) => {
  const [showResolutionInput, setShowResolutionInput] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const handleResolutionSubmit = () => {
    onResolutionSubmit(resolutionText);
    setShowResolutionInput(false);
    setResolutionText('');
  };

  const handleCommentSubmit = () => {
    onCommentSubmit(commentText);
    setShowCommentInput(false);
    setCommentText('');
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
              {/* Reject Confirmation Dialog */}
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
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowResolutionInput(true);
                  setShowCommentInput(false);
                }}
                className=" bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Resolution
              </Button>
              <Button onClick={onTransfer} className="bg-purple-600 hover:bg-purple-700 text-white">
                Transfer to Nodal Officer
              </Button>
              <Button
                onClick={() => {
                  setShowResolutionInput(false);
                  setShowCommentInput(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Comment
              </Button>
            </div>

            {showResolutionInput && (
              <div className="space-y-4">
                <Heading type={6}>Submit Resolution</Heading>
                <div className="h-[200px]">
                  <ReactQuill
                    theme="snow"
                    style={{ height: '150px' }}
                    value={resolutionText}
                    onChange={setResolutionText}
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleResolutionSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                    Submit
                  </Button>
                  <Button onClick={() => setShowResolutionInput(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {showCommentInput && (
              <div className="space-y-4">
                <Heading type={6}>Comment</Heading>
                <div className="h-[200px]">
                  <ReactQuill theme="snow" style={{ height: '150px' }} value={commentText} onChange={setCommentText} />
                </div>
                <div className="flex gap-4 mt-4">
                  <Button onClick={handleCommentSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                    Comment
                  </Button>
                  <Button onClick={() => setShowCommentInput(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
