import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import Loader from '@/components/ui/loader';
import axiosInstance from '@/services/axiosInstance';
import useUserRoles from '@/hooks/useUserRoles';
import TableList from '@/components/ui/data-table';
import SortingButton from '@/components/ui/SortingButton';
import { format } from 'date-fns';
import StatusBadge from '@/components/common/StatusBadge';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const FILTER_OPTIONS = {
  OPEN: 'open',
  InProgress: 'inprogress',
  Closed: 'closed',
};

const STATUS_IDS = {
  OPEN: 1,
  IN_PROGRESS: 2,
  CLOSED: 5,
} as const;

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
  const { isNodalOfficer, isSuperAdmin, isAdmin, isUnitCGM, isHOD, isAddressal, isCommittee } = useUserRoles();
  const [grievances, setGrievances] = useState<GrievanceResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchGrievances = async () => {
    setLoading(true);
    const response = await axiosInstance.get(
      `/Grievance/GetGrievanceList?userCode=${user.EmpCode}&pageNumber=1&pageSize=99999999`
    );
    setGrievances(response?.data?.data?.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGrievances();
  }, []);
  const updateGrievanceStatus = async (rowData: any, user) => {
    console.log('inside update status func');
    try {
      const formData = new FormData();

      // Append all grievance properties to FormData
      Object.entries(rowData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Update status
      formData.set('statusId', '2');

      formData.set('grievanceMasterId', rowData.id.toString());

      const response = await axiosInstance.post('/Grievance/AddUpdateGrievance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        toast.success('Grievance is now in progress');
      }
      console.log('this is updated grievance', Object.fromEntries(formData));
    } catch (error) {
      console.error('Error updating grievance status:', error);
      toast.error('Failed to update grievance status');
    }
  };

  const columns = useMemo(
    () => [
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
        cell: ({ row }) => <div className="max-w-52 text-sm">{row.original.title}</div>,
      },

      {
        id: 'unitName',
        accessorKey: 'unitName',
        header: 'Unit',
        cell: ({ row }) => <div className="text-sm">{row.original.unitName}</div>,
      },
      {
        id: 'statusId',
        accessorKey: 'statusId',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge statusId={row.original.statusId} />
          </div>
        ),
      },
    ],
    []
  );

  const filteredGrievances = useMemo(() => {
    return {
      [FILTER_OPTIONS.OPEN]: grievances?.filter((g) => g.statusId === STATUS_IDS.OPEN),
      [FILTER_OPTIONS.InProgress]: grievances?.filter((g) => g.statusId === STATUS_IDS.IN_PROGRESS),
      [FILTER_OPTIONS.Closed]: grievances?.filter((g) => g.statusId === STATUS_IDS.CLOSED),
    };
  }, [grievances]);

  console.log('grievances', grievances);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Redressal Grievances</CardTitle>
            </div>
          </div>
        </CardHeader>
        <div className="flex p-6">
          {loading ? (
            <Loader />
          ) : (
            <Tabs className="w-full" defaultValue={FILTER_OPTIONS.OPEN}>
              <TabsList className="w-[400px]">
                <TabsTrigger className=" w-full transition" value={FILTER_OPTIONS.OPEN}>
                  Open
                </TabsTrigger>
                <TabsTrigger className=" w-full transition" value={FILTER_OPTIONS.InProgress}>
                  In Progress
                </TabsTrigger>
                <TabsTrigger className="w-full transition" value={FILTER_OPTIONS.Closed}>
                  Closed
                </TabsTrigger>
              </TabsList>
              <TabsContent value={FILTER_OPTIONS.OPEN}>
                <TableList
                  data={filteredGrievances[FILTER_OPTIONS.OPEN]}
                  columns={columns}
                  inputPlaceholder="Search by Title..."
                  onRowClick={async (rowData) => {
                    if (
                      rowData?.assignedUserCode === user?.EmpCode?.toString() &&
                      rowData?.statusId === 1 &&
                      rowData?.createdBy?.toString() !== user?.EmpCode?.toString()
                    ) {
                      await updateGrievanceStatus(rowData, user);
                    }
                    navigate(`/redressal-grievances/${rowData.id.toString().trim()}`);
                  }}
                />
              </TabsContent>
              <TabsContent value={FILTER_OPTIONS.InProgress}>
                <TableList
                  data={filteredGrievances[FILTER_OPTIONS.InProgress]}
                  columns={columns}
                  inputPlaceholder="Search by Title..."
                  onRowClick={(rowData) => navigate(`/redressal-grievances/${rowData.id.toString().trim()}`)}
                />
              </TabsContent>
              <TabsContent value={FILTER_OPTIONS.Closed}>
                <TableList
                  data={filteredGrievances[FILTER_OPTIONS.Closed]}
                  columns={columns}
                  inputPlaceholder="Search by Title..."
                  onRowClick={(rowData) => {
                    navigate(`/redressal-grievances/${rowData.id.toString().trim()}`);
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyGrievances;
