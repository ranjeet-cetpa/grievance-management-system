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
import { findEmployeeDetails } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface GrievanceDetails {
  grievanceId: number;
  statusId: string;
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
  unitId?: string;
}

interface RoleDetail {
  roleDetail: {
    id: number;
    roleName: string;
    description: string;
    remark: string | null;
    createdBy: number;
    createdDate: string;
    modifyBy: number | null;
    modifyDate: string | null;
    isActive: boolean;
  };
  mappedUsers: Array<{
    userCode: string;
    userDetails: string;
    unitId: string;
    unitName: string;
  }>;
}

const GrievanceDetails = () => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const user = useSelector((state: RootState) => state.user);

  const navigate = useNavigate();
  const { grievanceId } = useParams();
  const [grievance, setGrievance] = useState<GrievanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('2'); // Default to "In Progress"

  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionInput, setShowResolutionInput] = useState(false);
  const [roleDetails, setRoleDetails] = useState<RoleDetail | null>(null);

  useEffect(() => {
    const fetchGrievanceDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (response.data.statusCode === 200) {
          setGrievance(response.data.data);
          setStatus(response.data.data.statusId.toString());
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

  useEffect(() => {
    const fetchRoleDetails = async () => {
      try {
        const response = await axiosInstance.get('/Admin/GetRoleDetail?roleId=1');
        if (response.data.statusCode === 200) {
          setRoleDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching role details:', error);
        toast.error('Failed to fetch role details');
      }
    };

    fetchRoleDetails();
  }, []);

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

  //console.log('grievance', grievance);
  const handleResolutionSubmit = async (resolution: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, {
        ...grievance,
        CommentText: resolution,
        StatusId: 2,
      });
      //console.log('resolution', response);
      toast.success('Resolution submitted successfully');
    } catch (error) {
      toast.error('Failed to submit resolution');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      const addressalUnit = findEmployeeDetails(employeeList, user?.EmpCode.toString()).employee?.unitId;
      //console.log(addressalUnit);
      //console.log('addressalUnit', addressalUnit);
      if (!addressalUnit) {
        toast.error('Unit information or role details not available');
        return;
      }

      // Find the nodal officer for the current unit
      const unitNodalOfficer = roleDetails.mappedUsers.find((user) => user.unitId === addressalUnit.toString());

      if (!unitNodalOfficer) {
        toast.error('No nodal officer found for your unit');
        return;
      }

      setLoading(true);
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

      // Update specific fields for transfer
      formData.set('assignedUserCode', unitNodalOfficer.userCode);
      formData.set('assignedUserDetails', unitNodalOfficer.userDetails);
      formData.set('statusId', grievance?.statusId);
      formData.set('userCode', user?.EmpCode.toString());

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Grievance transferred to nodal officer successfully');
        // Refresh grievance details
        const updatedResponse = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (updatedResponse.data.statusCode === 200) {
          setGrievance(updatedResponse.data.data);
        }
      } else {
        toast.error('Failed to transfer grievance');
      }
    } catch (error) {
      console.error('Error transferring grievance:', error);
      toast.error('Failed to transfer grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReject = async (isAccepted: boolean, feedback?: string) => {
    try {
      // Add your API call here
      toast.success(`Grievance ${isAccepted ? 'accepted' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to process request');
    }
  };

  const handleStatusChange = async (status: number) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Append all grievance properties to FormData
      Object.entries(grievance || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Update status
      formData.set('StatusId', status.toString());
      formData.set('userCode', user?.EmpCode.toString());

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Status updated successfully');
        // Refresh grievance details
        const updatedResponse = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (updatedResponse.data.statusCode === 200) {
          setGrievance(updatedResponse.data.data);
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (comment: string, attachments: File[]) => {
    try {
      setLoading(true);
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

      // Update comment and status
      formData.set('CommentText', comment);

      formData.set('StatusId', status);
      formData.set('userCode', user?.EmpCode.toString());

      // Add baseUrl if status is 4
      if (status === '4') {
        formData.set('baseUrl', environment.baseUrl + '/grievance');
      }

      // Append attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Comment posted successfully');
        // Refresh grievance details
        const updatedResponse = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (updatedResponse.data.statusCode === 200) {
          setGrievance(updatedResponse.data.data);
        }
      } else {
        toast.error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <Card className="w-full shadow-md p-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-[600px]">
            <Loader />
          </div>
        ) : (
          <>
            <GrievanceHeader
              title={grievance?.title || ''}
              status={grievance?.status || 0}
              getStatusText={getStatusText}
            />
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
                <Comments grievanceId={Number(grievanceId)} />
              </TabsContent>
            </Tabs>
            <GrievanceActions
              status={status}
              setStatus={setStatus}
              isCreator={grievance?.isCreator || false}
              canAcceptReject={grievance?.canAcceptReject || false}
              onAcceptReject={handleAcceptReject}
              onResolutionSubmit={handleResolutionSubmit}
              onTransfer={handleTransfer}
              onCommentSubmit={handleCommentSubmit}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default GrievanceDetails;
