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
import { findEmployeeDetails, getStatusText } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import useUserRoles from '@/hooks/useUserRoles';

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
  unitId: string;
  mappedUser: Array<{
    roleId: number;
    roleName: string;
    userCode: string;
    userDetails: string;
    group: {
      groupId: number;
      groupName: string;
    };
  }>;
}

const GrievanceDetails = () => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const user = useSelector((state: RootState) => state.user);
  const { isNodalOfficer, isAdmin, isUnitCGM, isHOD, isAddressal, isCommittee, isUser } = useUserRoles();

  const navigate = useNavigate();
  const { grievanceId } = useParams();
  const [grievance, setGrievance] = useState<GrievanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('2');
  const [activeTab, setActiveTab] = useState('info');
  const [commentText, setCommentText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionInput, setShowResolutionInput] = useState(false);
  const [roleDetails, setRoleDetails] = useState<RoleDetail | null>(null);
  const [unitCGMDetails, setUnitCGMDetails] = useState<RoleDetail | null>(null);

  console.log(isNodalOfficer);
  useEffect(() => {
    const fetchGrievanceDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (response.data.statusCode === 200) {
          setGrievance(response.data.data);
          console.log(response.data.data, 'this is grievance from grievance details');
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

    const fetchRoleDetails = async () => {
      console.log('inside fetch role details');
      try {
        if (!user?.unitId) {
          console.error('User unit ID is not available');
          return;
        }

        const [nodalResponse, cgmResponse] = await Promise.all([
          axiosInstance.get(`/Admin/GetUnitRoleUsers?unitId=${user.unitId}&roleId=4`),
          isNodalOfficer
            ? axiosInstance.get(`/Admin/GetUnitRoleUsers?unitId=${user.unitId}&roleId=5`)
            : Promise.resolve(null),
        ]);
        if (nodalResponse.data.mappedUser.length > 0) {
          console.log(nodalResponse.data, 'this is nodal response');
          setRoleDetails(nodalResponse.data);
        }

        if (cgmResponse && cgmResponse.data.mappedUser.length > 0) {
          console.log(cgmResponse.data, 'this is cgm response');
          setUnitCGMDetails(cgmResponse.data);
        }
      } catch (error) {
        console.error('Error fetching role details:', error);
        toast.error('Failed to fetch role details');
      }
    };

    fetchGrievanceDetails();
    fetchRoleDetails();
  }, [grievanceId, isNodalOfficer, user?.unitId]);

  // Example comments data - replace with actual data from your backend

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

  const handleTransfer = async (commentText, attachments) => {
    try {
      const addressalUnit = findEmployeeDetails(employeeList, user?.EmpCode.toString()).employee?.unitId;

      if (!addressalUnit) {
        toast.error('Unit information or role details not available');
        return;
      }

      // Find the nodal officer for the current unit
      const unitNodalOfficer = roleDetails?.mappedUser?.[0];

      if (!unitNodalOfficer) {
        toast.error('No nodal officer found for your unit');
        return;
      }

      setLoading(true);
      const formData = new FormData();

      // Append all grievance properties to FormData
      const excludedFields = [
        'attachments',

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
      formData.set('tUnitId', findEmployeeDetails(employeeList, unitNodalOfficer.userCode.toString()).employee?.unitId);
      formData.set(
        'tDepartment',
        findEmployeeDetails(employeeList, unitNodalOfficer.userCode.toString()).employee?.department
      );
      formData.set('tGroupId', roleDetails?.mappedUser?.[0]?.group?.groupId.toString());
      formData.set(
        'TDepartment',
        findEmployeeDetails(employeeList, unitNodalOfficer.userCode.toString())?.employee?.department
      );
      formData.set('userCode', user?.EmpCode.toString());
      formData.set('CommentText', commentText);

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      // Log each key-value pair in FormData
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
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

  const handleTransferToCGM = async (commentText: string, attachments: File[]) => {
    try {
      const addressalUnit = findEmployeeDetails(employeeList, user?.EmpCode.toString()).employee?.unitId;

      if (!addressalUnit || !unitCGMDetails) {
        toast.error('Unit information or CGM details not available');
        return;
      }

      // Find the CGM for the current unit
      const unitCGM = unitCGMDetails?.mappedUser?.[0];

      if (!unitCGM) {
        toast.error('No CGM found for your unit');
        return;
      }

      setLoading(true);
      const formData = new FormData();

      // Append all grievance properties to FormData
      const excludedFields = [
        'attachments',

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
      formData.set('assignedUserCode', unitCGM.userCode);
      formData.set('assignedUserDetails', unitCGM.userDetails);
      formData.set('statusId', grievance?.statusId);
      formData.set('userCode', user?.EmpCode.toString());
      formData.set('CommentText', commentText);
      formData.set('isInternal', 'true');
      formData.set('tUnitId', findEmployeeDetails(employeeList, unitCGM.userCode.toString()).employee?.unitId);
      formData.set('tDepartment', findEmployeeDetails(employeeList, unitCGM.userCode.toString()).employee?.department);
      formData.set('tGroupId', unitCGMDetails?.mappedUser?.[0]?.group?.groupId.toString());

      // Append attachments if any
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Grievance transferred to unit CGM successfully');
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

  const handleTransferToHOD = async (formData: FormData) => {
    try {
      setLoading(true);

      // Append all grievance properties to FormData
      const excludedFields = [
        'attachments',
        'tUnitId',
        'tDepartment',
        'tGroupId',
        'userCode',
        'userDetails',
        'assignedUserCode',
        'assignedUserDetails',
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

      // Update status and user code

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Log all FormData fields
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      if (response.data.statusCode === 200) {
        toast.success('Grievance transferred to HOD successfully');
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

  const handleStatusChange = async (status: number, commentText?: string) => {
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
      formData.set('statusId', status.toString());
      formData.set('userCode', user?.EmpCode.toString());
      formData.set('BaseUrl', environment.baseUrl + '/grievance');

      // Add comment if provided
      if (commentText) {
        formData.set('CommentText', commentText);
      }

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Grievance closed successfully');
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

  const handleHodAssignToMembers = async (selectedMember: any, commentText: string, attachments: File[]) => {
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

      // Update specific fields for assignment
      formData.set('assignedUserCode', selectedMember.userCode);
      formData.set('assignedUserDetails', selectedMember.userDetails);
      formData.set('tGroupId', selectedMember.groupId);
      formData.set(
        'tDepartment',
        findEmployeeDetails(employeeList, selectedMember.userCode.toString()).employee?.department
      );
      formData.set('tUnitId', findEmployeeDetails(employeeList, selectedMember.userCode.toString()).employee?.unitId);
      formData.set('statusId', grievance?.statusId);
      formData.set('userCode', user?.EmpCode.toString());
      formData.set('CommentText', commentText);
      formData.set('isInternal', 'true');

      // Append attachments if any
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await axiosInstance.post(`/Grievance/AddUpdateGrievance`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Grievance assigned to member successfully');
        // Refresh grievance details
        const updatedResponse = await axiosInstance.get(
          `/Grievance/GrievanceDetails?grievanceId=${grievanceId}&baseUrl=${environment.baseUrl}`
        );
        if (updatedResponse.data.statusCode === 200) {
          setGrievance(updatedResponse.data.data);
        }
      } else {
        toast.error('Failed to assign grievance');
      }
    } catch (error) {
      console.error('Error assigning grievance:', error);
      toast.error('Failed to assign grievance');
    } finally {
      setLoading(false);
    }
  };
  console.log(grievance, 'this is grievance from action component ');

  const handleCommentSubmit = async (comment: string, attachments: File[]) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Append all grievance properties to FormData
      const excludedFields = [
        'attachments',

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
      formData.set(
        'TUnitId',
        findEmployeeDetails(employeeList, grievance?.assignedUserCode.toString())?.employee?.unitId
      );
      formData.set('userCode', user?.EmpCode?.toString() || '');
      // formData.set('assignedUserCode', user?.EmpCode || '');
      // formData.set('assignedUserDetails',
      //   `${user?.unique_name ?? 'Unnamed'} ${user?.EmpCode ? `(${user?.EmpCode})` : ''} ${
      //     user?.Designation ? `- ${user?.Designation}` : ''
      //   } ${user?.Department ? `| ${user?.Department}` : ''}`
      // );

      // Append attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      // Log each key-value pair in FormData
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

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

  const handleGroupChangeByCGM = (selectedUnit: string) => {
    console.log('Selected Unit:', selectedUnit);
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
            <div className="flex w-full flex-col">
              <GrievanceHeader
                assignedUserCode={grievance?.assignedUserCode || ''}
                title={grievance?.title || ''}
                statusId={Number(grievance?.statusId) || 0}
              />
              <GrievanceInfo
                assignedUserCode={grievance.assignedUserCode || ''}
                createdBy={grievance?.createdBy || ''}
                userDetails={grievance?.userDetails || ''}
                createdDate={grievance?.createdDate || ''}
                assignedUserDetails={grievance?.assignedUserDetails || ''}
                modifiedDate={grievance?.modifiedDate || ''}
              />
            </div>
            <div className="flex  w-full justify-between h-full gap-2 min-h-[200px]">
              {/* Left Column - Info and Description */}
              <div
                className={`space-y-6 ${
                  (grievance?.assignedUserCode === user?.EmpCode ||
                    grievance?.assignedUserCode === '' ||
                    grievance?.createdBy.toString() === user?.EmpCode.toString()) &&
                  grievance?.statusId?.toString() !== '3' &&
                  (isNodalOfficer || isUnitCGM || isHOD || isAddressal || isCommittee || isUser)
                    ? 'w-1/2'
                    : 'w-full'
                } h-full`}
              >
                <GrievanceDescription description={grievance?.description || ''} attachments={grievance?.attachments} />
              </div>

              {/* Right Column - Comments and Actions */}
              {(grievance?.assignedUserCode === user?.EmpCode ||
                grievance?.assignedUserCode === '' ||
                grievance?.createdBy.toString() === user?.EmpCode.toString()) &&
                grievance?.statusId?.toString() !== '3' &&
                (isNodalOfficer || isUnitCGM || isHOD || isAddressal || isCommittee || isUser) && (
                  <div className="space-y-6 w-1/2 h-full">
                    <GrievanceActions
                      grievance={grievance}
                      setGrievance={setGrievance}
                      isNodalOfficer={isNodalOfficer}
                      status={status}
                      setStatus={setStatus}
                      isCreator={grievance?.isCreator || false}
                      canAcceptReject={grievance?.canAcceptReject || false}
                      onAcceptReject={handleAcceptReject}
                      onResolutionSubmit={handleResolutionSubmit}
                      onTransfer={handleTransfer}
                      onTransferToCGM={handleTransferToCGM}
                      onTransferToHOD={handleTransferToHOD}
                      onCommentSubmit={handleCommentSubmit}
                      handleHodAssignToMembers={handleHodAssignToMembers}
                      onStatusChange={handleStatusChange}
                      handleGroupChangeByCGM={handleGroupChangeByCGM}
                    />
                  </div>
                )}
            </div>
            <Comments grievanceId={Number(grievanceId)} />
          </>
        )}
      </Card>
    </div>
  );
};

export default GrievanceDetails;
