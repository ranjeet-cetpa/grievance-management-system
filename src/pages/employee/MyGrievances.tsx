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

const MyGrievances = () => {
  const user = useSelector((state: RootState) => state.user);
  const [grievances, setGrievances] = useState<GrievanceResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
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
  const openGrievances = grievances.filter((grievance) => [1, 2, 3, 4].includes(grievance.statusId));

  const closedGrievances = grievances.filter((grievance) => grievance.statusId === 5);

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
          <SortingButton headerText="Submission Date" column={column} />
        </div>
      ),
      cell: ({ row }) => <span>{format(new Date(row.original.createdDate), 'dd MMM, yyyy')}</span>,
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Subject',
      cell: ({ row }) => <div className="max-w-[300px] text-sm truncate">{row.original.title}</div>,
    },
  ];

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
            <div>
              <Tabs defaultValue="open">
                <TabsList className="grid w-[300px] grid-cols-2">
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
                <TabsContent value="open" className="mt-6">
                  <TableList
                    data={openGrievances}
                    columns={columns}
                    inputPlaceholder="Search by Title..."
                    onRowClick={(rowData) => navigate(`/grievances/${rowData.id.toString().trim()}`)}
                  />
                </TabsContent>
                <TabsContent value="closed" className="mt-6">
                  <TableList data={closedGrievances} columns={columns} inputPlaceholder="Search by Title..." />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyGrievances;
