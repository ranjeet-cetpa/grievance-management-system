import React, { useMemo } from 'react';
import TableList from '../ui/data-table';
import SortingButton from '../ui/SortingButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useNavigate } from 'react-router';
import StatusBadge from '../common/StatusBadge';
import { format, formatDate } from 'date-fns';
import { findEmployeeDetails } from '@/lib/helperFunction';
import FilterHeader from '../FilterHeader';
import toast from 'react-hot-toast';
import axiosInstance from '@/services/axiosInstance';

const updateGrievanceStatus = async (status, id) => {
  try {
    const response = await axiosInstance.put(`/GrievanceManager/ChangeGrievanceStatus/${id}?Status=${status}`);
    if (response.data.statusCode === 200) {
      toast.success('Grievance is now in progress');
    }
  } catch (error) {
    console.error('Error updating grievance status:', error);
  }
};

// Sample dummy data with the specified assignedTo IDs
const dummyGrievances = [
  {
    id: 1001,
    createdDate: '2025-02-01T10:30:00',
    title: 'Salary Discrepancy in January Payroll',
    status: 'new',
    assignedTo: '57',
  },
  {
    id: 1002,
    createdDate: '2025-02-05T14:15:00',
    title: 'Workplace Harassment Complaint',
    status: 'in_progress',
    assignedTo: '22',
  },
  {
    id: 1003,
    createdDate: '2025-02-08T09:45:00',
    title: 'Leave Application Rejection Dispute',
    status: 'in_progress',
    assignedTo: '101002',
  },
  {
    id: 1004,
    createdDate: '2025-02-10T11:20:00',
    title: 'Office Equipment Inadequacy',
    status: 'resolved',
    assignedTo: '100571',
  },
  {
    id: 1005,
    createdDate: '2025-02-15T16:30:00',
    title: 'Performance Review Objection',
    status: 'closed',
    assignedTo: '102199',
  },
];

const ResponsiveGrievanceList: React.FC = ({
  grievances = dummyGrievances, // Default to dummy data if none provided
  rightElement,
  mode,
}: {
  grievances?: any;
  rightElement?: React.ReactNode;
  mode?: string;
}) => {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const employeeList = useSelector((state: RootState) => state.employee.employees);

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
            <SortingButton headerText="Created On" column={column} />
          </div>
        ),
        cell: ({ row }) => <span>{format(new Date(row.original.createdDate), 'dd-MM-yyyy')}</span>,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <div className="max-w-52 text-sm">{row.original.title}</div>,
      },
      {
        id: 'assignedTo',
        accessorKey: 'assignedTo',
        // header: ({ column }) => (
        //   <div className="flex items-center gap-2">
        //     <span>Assigned To</span>
        //     {employeeList && (
        //       <FilterHeader
        //         column={column}
        //         grievances={grievances}
        //         employeeList={employeeList}
        //         mode={'filterOnAssignedTo'}
        //       />
        //     )}
        //   </div>
        // ),
        header: 'Assigned To',
        filterFn: (row, id, filterValue) => {
          if (!filterValue?.length) return true;
          return filterValue.includes(row.original.assignedTo);
        },
        cell: ({ row }) => (
          <p className="font-semibold">
            {findEmployeeDetails(employeeList, row?.original?.assignedTo)?.employee?.empName || row.original.assignedTo}
          </p>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.status} />
          </div>
        ),
      },
    ],
    [employeeList, grievances]
  );

  return (
    <TableList
      data={grievances}
      columns={columns}
      rightElements={rightElement}
      onRowClick={async (rowData) => {
        if (rowData?.assignedTo.toString() === user?.EmpCode?.toString() && rowData?.status === 'new') {
          await updateGrievanceStatus('in_progress', rowData?.id);
        }
        navigate(`/grievances/${rowData.id.toString().trim()}`);
      }}
    />
  );
};

export default ResponsiveGrievanceList;
