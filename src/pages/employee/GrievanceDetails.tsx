import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
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
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2 p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="w-auto">
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Left Section - Grievance Details */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <Heading type={5}>Title: {grievance?.title || 'Title'}</Heading>
                <Badge variant="outline">{grievance ? getStatusText(grievance.status) : 'Unknown'}</Badge>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Label className="font-semibold">Created By:</Label>
                <span>{grievance?.userDetails || 'Created By'}</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Label className="font-semibold">Created Date:</Label>
                <span>
                  {grievance?.createdDate ? new Date(grievance.createdDate).toLocaleDateString() : 'Created Date'}
                </span>
              </div>

              <Heading type={6} className="font-semibold mb-2">
                Description
              </Heading>
              <div className="mb-6" dangerouslySetInnerHTML={{ __html: grievance?.description || 'Description' }}></div>

              {grievance?.attachments && grievance.attachments.length > 0 && (
                <div className="mb-6">
                  <Heading type={6} className="font-semibold mb-2">
                    Attachments
                  </Heading>
                  <div className="flex flex-wrap gap-2">
                    {grievance.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button>Submit</Button>
                <Button>Appeal</Button>
              </div>
            </div>

            {/* Right Section - Comments */}
            <div className="border-l pl-6">
              <Heading type={6} className="font-semibold mb-4">
                Comments
              </Heading>
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {comments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{comment.user.name}</span>
                          <span className="text-sm text-muted-foreground">{comment.user.designation}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.comment}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Comment Input */}
              <div className="mt-4">
                <textarea className="w-full min-h-[100px] p-2 border rounded-md" placeholder="Add your comment..." />
                <Button className="mt-2">Post Comment</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GrievanceDetails;
