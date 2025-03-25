import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';
import GrievanceTable from '@/components/grievances/GrievanceTable';
import Loader from '@/components/ui/loader';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import CreateGrievance from './CreateGrievance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TableList from '@/components/ui/data-table';
import SortingButton from '@/components/ui/SortingButton';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { findEmployeeDetails } from '@/lib/helperFunction';
import { Badge } from '@/components/ui/badge';

interface GrievanceResponse {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Array<{
    id: number;
    title: string;
    description: string;
    serviceId: number;
    userCode: string;
    userEmail: string;
    userDetails: string;
    unitId: string;
    unitName: string;
    round: number;
    statusId: number;
    status: string | null;
    rowStatus: number;
    remark: string | null;
    createdBy: number;
    createdDate: string;
    modifyBy: number | null;
    modifyDate: string | null;
    isActive: boolean | null;
  }>;
}

const FILTER_OPTIONS = {
  OPEN: 'open',
  CLOSED: 'closed',
  WITHDRAWN: 'withdrawn',
};

const STATUS_IDS = {
  OPEN: 1,
  IN_PROGRESS: 2,
  CLOSED: 3,
} as const;

const MyGrievances = () => {
  const user = useSelector((state: RootState) => state.user);
  const [grievances, setGrievances] = useState<GrievanceResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState(FILTER_OPTIONS.OPEN);
  const navigate = useNavigate();

  // Function to Fetch Grievances from API
  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = `/Grievance/MyGrievanceList?userCode=${user.EmpCode}&pageNumber=1&pageSize= 10000000`;
      const response = await axiosInstance.get(endpoint);
      if (response.data.statusCode === 200) {
        const responseData = response.data.data;
        setGrievances(responseData.data);
        logger.log('Grievances fetched:', responseData);
      } else if (response?.data?.statusCode === 404) {
        toast.error('No grievances found');
        setGrievances([]);
      } else {
        toast.error('Failed to fetch grievances');
        setGrievances([]);
      }
    } catch (error) {
      logger.error('Error fetching grievances:', error);
      toast.error('Something went wrong while fetching grievances');
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  }, [user.EmpCode]);

  // Fetch grievances when component mounts or refresh changes
  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances, refresh]);

  // Function to refresh grievances
  const refreshGrievances = () => {
    setRefresh((prev) => !prev);
  };

  // const openGrievances = grievances.filter((grievance) => grievance.statusId === 1 || 2 || 3 || 4);
  const openGrievances = grievances.filter((grievance) => [1, 2, 4].includes(grievance.statusId));

  const closedGrievances = grievances.filter(
    (g) => [3, 5].includes(g.statusId) && g.createdBy?.toString() !== g.modifiedBy?.toString()
  );

  const withdrawnGrievances = grievances.filter(
    (g) => g.statusId === STATUS_IDS.CLOSED && g.createdBy?.toString() === g.modifiedBy?.toString()
  );

  const employeeList = useSelector((state: RootState) => state.employee.employees);

  const columns = [
    {
      id: 'id',
      accessorKey: 'id',
      header: () => <div className="text-nowrap">ID</div>,
      cell: ({ row }) => (
        <div className="flex font-semibold text-sm">
          {'GR-' + (row.original?.id < 1000 ? ('000' + row.original?.id).slice(-4) : row.original?.id)}
        </div>
      ),
    },
    {
      id: 'createdDate',
      accessorKey: 'createdDate',
      header: ({ column }) => (
        <div className="flex justify-start pl-8">
          <SortingButton headerText="Initiated On" column={column} />
        </div>
      ),
      cell: ({ row }) => <span>{format(new Date(row.original.createdDate), 'dd MMM, yyyy')}</span>,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Subject',
      cell: ({ row }) => <div className="max-w-[400px] text-sm text-wrap">{row.original.title}</div>,
    },
    activeTab === 'open' && {
      id: 'assignedUserDetails',
      accessorKey: 'assignedUserDetails',
      header: 'Currently With',
      cell: ({ row }) => <div className="max-w-[300px] text-sm ">{row.original.assignedUserDetails}</div>,
    },
    activeTab === 'closed' && {
      id: 'modifiedBy',
      accessorKey: 'modifiedBy',
      header: 'Closed By',
      cell: ({ row }) => (
        <div className="max-w-[300px] text-sm ">
          {findEmployeeDetails(employeeList, row.original?.modifiedBy?.toString())?.employee?.empName}
        </div>
      ),
    },
    {
      id: 'type',
      accessorKey: 'round',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
          Transferred
        </Badge>
      ),
    },
    {
      id: 'round',
      accessorKey: 'round',
      header: 'Round',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.round > 1
              ? 'bg-purple-50 text-purple-700 hover:bg-purple-50'
              : 'bg-green-50 text-green-700 hover:bg-green-50'
          }
        >
          {row.original.round > 1 ? `Appeal (${row.original.round - 1})` : 'Round 1'}
        </Badge>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">My Grievances</CardTitle>
            <CreateGrievance refreshGrievances={refreshGrievances} />
          </div>
        </CardHeader>
        <div className="p-6">
          {loading ? (
            <Loader />
          ) : (
            <TableList
              data={
                activeTab === FILTER_OPTIONS.OPEN
                  ? openGrievances
                  : activeTab === FILTER_OPTIONS.CLOSED
                  ? closedGrievances
                  : withdrawnGrievances
              }
              columns={columns}
              inputPlaceholder="Search by Title..."
              onRowClick={(rowData) => navigate(`/grievances/${rowData.id.toString().trim()}`)}
              rightElements={
                <Tabs>
                  <TabsList className="grid w-[400px] grid-cols-3">
                    <TabsTrigger
                      value="open"
                      onClick={() => setActiveTab(FILTER_OPTIONS.OPEN)}
                      className={`${activeTab === FILTER_OPTIONS.OPEN ? 'bg-primary text-white' : ''}`}
                    >
                      Open
                    </TabsTrigger>
                    <TabsTrigger
                      value="closed"
                      onClick={() => setActiveTab(FILTER_OPTIONS.CLOSED)}
                      className={`${
                        activeTab === FILTER_OPTIONS.CLOSED ? 'bg-destructive hover:bg-destructive/90 text-white' : ''
                      }`}
                    >
                      Closed
                    </TabsTrigger>
                    <TabsTrigger
                      value="withdrawn"
                      onClick={() => setActiveTab(FILTER_OPTIONS.WITHDRAWN)}
                      className={`${activeTab === FILTER_OPTIONS.WITHDRAWN ? 'bg-green-600 text-white' : ''}`}
                    >
                      Withdrawn
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              }
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyGrievances;
