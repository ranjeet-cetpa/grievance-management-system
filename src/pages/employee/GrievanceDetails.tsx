import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Paperclip, MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { environment } from '@/config';
import Loader from '@/components/ui/loader';

interface GrievanceDetails {
  grievanceId: number;
  grievanceProcessId: number;
  title: string;
  description: string;
  attachments: string[];
  userCode: string;
  userDetails: string;
  serviceId: number;
  round: number;
  assignedUserCode: string;
  assignedUserDetails: string;
  status: number;
  createdBy: string;
  createdDate: string;
  modifiedBy: number;
  modifiedDate: string;
}

const GrievanceDetails = () => {
  const navigate = useNavigate();
  const { grievanceId } = useParams();
  const [grievance, setGrievance] = useState<GrievanceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrievanceDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (response.data.statusCode === 200) {
          setGrievance(response.data.data);
        } else {
          toast.error('Failed to fetch grievance details');
        }
      } catch (error) {
        console.error('Error fetching grievance details:', error);
        toast.error('Something went wrong while fetching grievance details');
      } finally {
        setLoading(false);
      }
    };

    fetchGrievanceDetails();
  }, [grievanceId]);

  const getStatusText = (status: number): string => {
    switch (status) {
      case 1:
        return 'New';
      case 2:
        return 'In Progress';
      case 3:
        return 'Resolved';
      case 4:
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  // Example comments data - replace with actual data from your backend
  const comments = [
    {
      id: 1,
      user: {
        name: 'Ram Krishna',
        designation: 'HR Manager',
        avatar: '/avatars/john.png',
      },
      comment: 'This issue needs immediate attention.',
      timestamp: '2024-03-20T10:00:00',
    },
    {
      id: 1,
      user: {
        name: 'Ram Krishna',
        designation: 'HR Manager',
        avatar: '/avatars/john.png',
      },
      comment: 'This issue needs immediate attention.',
      timestamp: '2024-03-20T10:00:00',
    },
    {
      id: 1,
      user: {
        name: 'Ram Krishna',
        designation: 'HR Manager',
        avatar: '/avatars/john.png',
      },
      comment: 'This issue needs immediate attention.',
      timestamp: '2024-03-20T10:00:00',
    },
    {
      id: 1,
      user: {
        name: 'Ram Krishna',
        designation: 'HR Manager',
        avatar: '/avatars/john.png',
      },
      comment: 'This issue needs immediate attention.',
      timestamp: '2024-03-20T10:00:00',
    },
    {
      id: 1,
      user: {
        name: 'Ram Krishna',
        designation: 'HR Manager',
        avatar: '/avatars/john.png',
      },
      comment: 'This issue needs immediate attention.',
      timestamp: '2024-03-20T10:00:00',
    },

    // Add more comments as needed
  ];

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <Card className="rounded-lg shadow-md">
        <div className="border-b p-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back to Grievances</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[600px]">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8 p-6">
            {/* Left Section - Grievance Details */}
            <div className="col-span-2 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <Heading type={4} className="text-gray-800">
                    {grievance?.title || 'Title'}
                  </Heading>
                  <Badge
                    variant="outline"
                    className={`px-4 py-1 text-sm font-medium ${
                      grievance?.status === 3
                        ? 'bg-green-100 text-green-800'
                        : grievance?.status === 2
                        ? 'bg-blue-100 text-blue-800'
                        : grievance?.status === 4
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {grievance ? getStatusText(grievance.status) : 'Unknown'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <Label className="text-sm text-gray-500">Created By</Label>
                    <p className="font-medium mt-1">{grievance?.userDetails || 'Created By'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <Label className="text-sm text-gray-500">Created Date</Label>
                    <p className="font-medium mt-1">
                      {grievance?.createdDate
                        ? new Date(grievance.createdDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Created Date'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-md shadow-sm">
                  <Heading type={6} className="text-gray-700 mb-3">
                    Description
                  </Heading>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: grievance?.description || 'Description' }}
                  ></div>
                </div>

                {grievance?.attachments && grievance.attachments.length > 0 && (
                  <div className="bg-white p-6 rounded-md shadow-sm mt-6">
                    <Heading type={6} className="text-gray-700 mb-3 flex items-center">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attachments
                    </Heading>
                    <div className="flex flex-wrap gap-3">
                      {grievance.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors text-blue-600"
                        >
                          <Paperclip className="w-4 h-4 mr-2" />
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">Submit</Button>
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6">
                    Appeal
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Section - Comments */}
            <div className="border-l">
              <div className="p-6">
                <Heading type={6} className="flex items-center text-gray-700 mb-4">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </Heading>
                <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">{comment.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{comment.user.name}</span>
                            <span className="text-sm text-gray-500">{comment.user.designation}</span>
                          </div>
                          <p className="text-sm mt-2 text-gray-600">{comment.comment}</p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {new Date(comment.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="mt-6">
                  <textarea
                    className="w-full min-h-[120px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
                    placeholder="Add your comment..."
                  />
                  <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white w-full">Post Comment</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
};

export default GrievanceDetails;
