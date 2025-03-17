import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Paperclip, ExternalLink, Download, Image as ImageIcon, FileText, Clock, X } from 'lucide-react';
import Heading from '@/components/ui/heading';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { environment } from '@/config';
import { findEmployeeDetails } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CommentDetail {
  comment: string;
  commentType: string;
  commentedById: number;
  commentedByName: string;
  commentedDate: string;
  attachment: string[] | null;
}

interface GrievanceHistory {
  grievanceProcessId: number;
  commentDetails: CommentDetail[];
  caseName: string | null;
  changeBy: string | null;
  modifyDate: string | null;
}

interface CommentsProps {
  grievanceId: number;
}

export const Comments = ({ grievanceId }: CommentsProps) => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachments, setSelectedAttachments] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(
          `/Grievance/GrievanceHistory?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );

        if (response.data.statusCode === 200) {
          const allComments = response.data.data.map((item: GrievanceHistory) => item.commentDetails[0]);
          console.log(allComments, 'allComments');
          if (allComments[0] === undefined) {
            setComments([]);
          } else {
            setComments(allComments);
          }
        } else {
          toast.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [grievanceId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="bg-white border-none shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white mt-2 border-black-600 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <Heading type={6} className="text-gray-800">
                Discussion ({comments.length})
              </Heading>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8 col-span-2">No comments found</div>
            ) : (
              [...comments]?.map((comment, index) => {
                if (comment)
                  return (
                    <div
                      key={index}
                      className="group animate-fadeIn hover:bg-blue-100/100 p-3 rounded-xl transition-all duration-50 border border-gray-100 bg-blue-50/50"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          className="h-8 w-8 ring-2 ring-primary/10 shrink-0 
                                 shadow-sm group-hover:ring-primary/20 transition-all"
                        >
                          <AvatarImage
                            src={`/avatars/${comment?.commentedByName?.toLowerCase().replace(/\s+/g, '-')}.png`}
                            alt={comment?.commentedByName}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs">
                            {comment?.commentedByName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-semibold text-gray-900 text-xs">{comment?.commentedByName}</span>
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(comment?.commentedDate)}
                              </span>
                            </div>
                            {comment?.attachment && comment?.attachment.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-primary p-1 h-auto"
                                onClick={() => setSelectedAttachments(comment.attachment)}
                              >
                                <Paperclip className="w-3 h-3" />
                                <span>({comment.attachment.length})</span>
                              </Button>
                            )}
                          </div>
                          <p
                            className="mt-2 text-xs text-gray-600 whitespace-pre-wrap break-words leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: comment?.comment }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                else {
                  return null;
                }
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAttachments} onOpenChange={() => setSelectedAttachments(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Attachments</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {selectedAttachments?.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded-lg
                         border border-gray-100 hover:border-primary/30
                         hover:shadow-sm transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-lg bg-gray-50 
                           flex items-center justify-center 
                           ring-1 ring-gray-200"
                >
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">Attachment {index + 1}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary/90 
                               hover:text-primary flex items-center gap-1.5
                               hover:underline transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
