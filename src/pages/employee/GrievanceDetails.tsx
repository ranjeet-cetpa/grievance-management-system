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
import { GrievanceHeader } from '@/components/grievance-details/GrievanceHeader';
import { GrievanceInfo } from '@/components/grievance-details/GrievanceInfo';
import { GrievanceDescription } from '@/components/grievance-details/GrievanceDescription';
import { GrievanceActions } from '@/components/grievance-details/GrievanceActions';
import { Comments } from '@/components/grievance-details/Comments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  isCreator: boolean;
  resolutionText?: string;
  canAcceptReject: boolean;
}

const GrievanceDetails = () => {
  const navigate = useNavigate();
  const { grievanceId } = useParams();
  const [grievance, setGrievance] = useState<GrievanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionInput, setShowResolutionInput] = useState(false);

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

  console.log('grievance', grievance);
  const handleResolutionSubmit = async (resolution: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, {
        ...grievance,
        CommentText: resolution,
        StatusId: 2,
      });
      console.log('resolution', response);
      toast.success('Resolution submitted successfully');
    } catch (error) {
      toast.error('Failed to submit resolution');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      // Add your API call here
      toast.success('Grievance transferred to nodal officer');
    } catch (error) {
      toast.error('Failed to transfer grievance');
    }
  };

  const handleAcceptReject = async (isAccepted: boolean) => {
    try {
      // Add your API call here
      toast.success(`Grievance ${isAccepted ? 'accepted' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to process request');
    }
  };

  const handleCommentSubmit = async (comment: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, {
        ...grievance,
        CommentText: comment,
      });
      toast.success('Comment posted successfully');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <Card className="w-full shadow-md p-4">
        {loading && (
          <div className="flex justify-center items-center min-h-[600px]">
            <Loader />
          </div>
        )}

        <GrievanceHeader title={grievance?.title || ''} status={grievance?.status || 0} getStatusText={getStatusText} />
        <Tabs defaultValue="info">
          <TabsList className="mb-4 w-[200px] mx-auto mt-4">
            <TabsTrigger value="info" className="w-full">
              Info
            </TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <GrievanceInfo
              userDetails={grievance?.userDetails || ''}
              createdDate={grievance?.createdDate || ''}
              assignedUserDetails={grievance?.assignedUserDetails || ''}
              modifiedDate={grievance?.modifiedDate || ''}
            />
            <GrievanceDescription description={grievance?.description || ''} attachments={grievance?.attachments} />
          </TabsContent>
          <TabsContent value="comments">
            <Comments comments={comments} />
          </TabsContent>
        </Tabs>
        <GrievanceActions
          isCreator={false}
          canAcceptReject={false}
          onAcceptReject={handleAcceptReject}
          onResolutionSubmit={handleResolutionSubmit}
          onTransfer={handleTransfer}
          onCommentSubmit={handleCommentSubmit}
        />
      </Card>
    </div>
  );
};

export default GrievanceDetails;
