import React, { useEffect, useState, useMemo } from 'react';
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
import { useNavigate, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { findEmployeeDetails } from '@/lib/helperFunction';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/ui/heading';

const FILTER_OPTIONS = {
  OPEN: 'open',
  InProgress: 'inprogress',
  Closed: 'closed',
  Withdrawn: 'withdrawn', // new tab for withdrawn grievances
  Appeal: 'appeal',
};

const STATUS_IDS = {
  OPEN: 1,
  IN_PROGRESS: 2,
  CLOSED: 3,
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
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [selectedTab, setSelectedTab] = useState(
    mode !== null ? (mode === 'inprogress' ? FILTER_OPTIONS.InProgress : FILTER_OPTIONS.Closed) : FILTER_OPTIONS.OPEN
  );
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  console.log(mode, 'mode');
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
    try {
      const formData = new FormData();
      Object.entries(rowData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      console.log(rowData, 'this is row data .........in progress setter ');
      formData.set('TUnitId', rowData.tUnit);
      formData.set('TDepartment', rowData.tDepartment);
      formData.set('TGroupId', rowData.tGroupId);

      formData.set('statusId', '2');
      formData.set('grievanceMasterId', rowData.id.toString());

      const response = await axiosInstance.post('/Grievance/AddUpdateGrievance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.statusCode === 200) {
        console.log('Grievance is now in progress');
      }
    } catch (error) {
      console.error('Error updating grievance status:', error);
      toast.error('Failed to update grievance status');
    }
  };

  const columns = useMemo(
    () =>
      [
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
            <div className="flex justify-start text-left pl-6">
              <SortingButton headerText="Initiated On" column={column} />
            </div>
          ),
          cell: ({ row }) => <span>{format(new Date(row.original.createdDate), 'dd MMM, yyyy')}</span>,
        },
        {
          id: 'createdBy',
          accessorKey: 'createdBy',
          header: 'Initiated By',
          cell: ({ row }) => (
            <div className="max-w-[300px] text-sm ">
              {' '}
              {findEmployeeDetails(employeeList, row.original?.createdBy?.toString())?.employee?.empName}
            </div>
          ),
        },
        {
          id: 'title',
          accessorKey: 'title',
          header: 'Subject',
          cell: ({ row }) => <div className="max-w-52 text-sm">{row.original.title}</div>,
        },

        // Conditionally show "Currently With" column
        selectedTab !== FILTER_OPTIONS.OPEN &&
          selectedTab !== FILTER_OPTIONS.Closed && {
            id: 'assignedUserDetails',
            accessorKey: 'assignedUserDetails',
            header: 'Currently With',
            cell: ({ row }) => <div className="max-w-[300px] text-sm ">{row.original.assignedUserDetails}</div>,
          },

        selectedTab === FILTER_OPTIONS.Closed && {
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
          id: 'unitName',
          accessorKey: 'unitName',
          header: 'Unit',
          cell: ({ row }) => <div className="text-sm">{row.original.unitName}</div>,
        },
        {
          id: 'type',
          accessorKey: 'isTransferred',
          header: 'Type',
          cell: ({ row }) => (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              {row.original.isTransferred ? 'Transferred' : 'Assigned'}
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
      ].filter(Boolean), // Remove undefined columns
    [selectedTab] // Recalculate when selectedTab changes
  );

  const filteredGrievances = useMemo(() => {
    return {
      [FILTER_OPTIONS.OPEN]: grievances?.filter((g) => {
        if (g.assignedUserCode?.toString() === user?.EmpCode?.toString()) {
          if (g.statusId !== 3) {
            return true;
          }
        }
        return false;
      }),
      [FILTER_OPTIONS.InProgress]: grievances?.filter((g) => {
        if (g.assignedUserCode?.toString() !== user?.EmpCode?.toString()) {
          if (g.statusId !== 3) {
            return true;
          }
        }
        return false;
      }),
      [FILTER_OPTIONS.Closed]: grievances?.filter(
        (g) => g.statusId === STATUS_IDS.CLOSED && g.createdBy?.toString() !== g.modifiedBy?.toString()
      ),
      [FILTER_OPTIONS.Withdrawn]: grievances?.filter(
        (g) => g.statusId === STATUS_IDS.CLOSED && g.createdBy?.toString() === g.modifiedBy?.toString() // new condition for withdrawn grievances
      ),
    };
  }, [grievances]);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <Heading type={5}>Redress Grievances</Heading>
            </div>
          </div>
        </CardHeader>
        <div className="flex p-6">
          {loading ? (
            <Loader />
          ) : (
            <TableList
              data={filteredGrievances[selectedTab]}
              columns={columns}
              inputPlaceholder="Search by Title..."
              onRowClick={async (rowData) => {
                if (
                  selectedTab === FILTER_OPTIONS.OPEN &&
                  rowData?.assignedUserCode === user?.EmpCode?.toString() &&
                  rowData?.statusId === 1 &&
                  rowData?.createdBy?.toString() !== user?.EmpCode?.toString()
                ) {
                  await updateGrievanceStatus(rowData, user);
                }
                navigate(`/redress-grievances/${rowData.id.toString().trim()}`);
              }}
              rightElements={
                <Tabs>
                  <TabsList className="grid w-[500px] grid-cols-4">
                    {' '}
                    <TabsTrigger
                      value={FILTER_OPTIONS.OPEN}
                      onClick={() => setSelectedTab(FILTER_OPTIONS.OPEN)}
                      className={`${selectedTab === FILTER_OPTIONS.OPEN ? 'bg-primary text-white' : ''}`}
                    >
                      Open
                    </TabsTrigger>
                    <TabsTrigger
                      value={FILTER_OPTIONS.InProgress}
                      onClick={() => setSelectedTab(FILTER_OPTIONS.InProgress)}
                      className={`${selectedTab === FILTER_OPTIONS.InProgress ? 'bg-yellow-600 text-white' : ''}`}
                    >
                      In Progress
                    </TabsTrigger>
                    <TabsTrigger
                      value={FILTER_OPTIONS.Closed}
                      onClick={() => setSelectedTab(FILTER_OPTIONS.Closed)}
                      className={`${selectedTab === FILTER_OPTIONS.Closed ? 'bg-red-500 text-white' : ''}`}
                    >
                      Closed
                    </TabsTrigger>
                    <TabsTrigger
                      value={FILTER_OPTIONS.Withdrawn}
                      onClick={() => setSelectedTab(FILTER_OPTIONS.Withdrawn)}
                      className={`${selectedTab === FILTER_OPTIONS.Withdrawn ? 'bg-green-600 text-white' : ''}`}
                    >
                      Withdrawn
                    </TabsTrigger>
                    {/* <TabsTrigger
                      value={FILTER_OPTIONS.Appeal}
                      onClick={() => setSelectedTab(FILTER_OPTIONS.Appeal)}
                      className={`${selectedTab === FILTER_OPTIONS.Appeal ? 'bg-purple-600 text-white' : ''}`}
                    >
                      Appealed
                    </TabsTrigger> */}
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
