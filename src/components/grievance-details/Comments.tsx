import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Paperclip, ExternalLink, Download, Image as ImageIcon, FileText, Clock } from 'lucide-react';
import Heading from '@/components/ui/heading';

interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'document';
  filename: string;
}

interface Comment {
  id: number;
  user: {
    name: string;
    designation: string;
    avatar: string;
  };
  comment: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface CommentsProps {
  comments: Comment[];
}

export const Comments = ({ comments }: CommentsProps) => {
  const getFileIcon = (type: string) => {
    return type === 'image' ? ImageIcon : FileText;
  };

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

  return (
    <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-300">
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
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="group animate-fadeIn hover:bg-gray-50/50 p-1 rounded-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <Avatar
                  className="h-10 w-10 ring-2 ring-primary/10 shrink-0 
                                                 shadow-sm group-hover:ring-primary/20 transition-all"
                >
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {comment.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-gray-900">{comment.user.name}</span>
                    <span
                      className="text-xs font-medium text-primary/80 bg-primary/5 
                                                       px-2.5 py-1 rounded-full"
                    >
                      {comment.user.designation}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
                    {comment.comment}
                  </p>

                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Paperclip className="w-4 h-4" />
                        <span>Attachments ({comment.attachments.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {comment.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg
                                                                 border border-gray-100 hover:border-primary/30
                                                                 hover:shadow-sm group/attachment transition-all
                                                                 duration-200"
                          >
                            {attachment.type === 'image' ? (
                              <div
                                className="relative w-12 h-12 rounded-lg overflow-hidden 
                                                                          bg-gray-100 ring-1 ring-gray-200"
                              >
                                <img
                                  src={attachment.url}
                                  alt=""
                                  className="object-cover w-full h-full 
                                                                             group-hover/attachment:scale-105 transition-transform"
                                />
                              </div>
                            ) : (
                              <div
                                className="w-12 h-12 rounded-lg bg-gray-50 
                                                                          flex items-center justify-center 
                                                                          ring-1 ring-gray-200"
                              >
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{attachment.filename}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <a
                                  href={attachment.url}
                                  download
                                  className="text-xs font-medium text-primary/90 
                                                                             hover:text-primary flex items-center gap-1.5
                                                                             hover:underline transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </a>
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-primary/90 
                                                                             hover:text-primary flex items-center gap-1.5
                                                                             hover:underline transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Preview
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
