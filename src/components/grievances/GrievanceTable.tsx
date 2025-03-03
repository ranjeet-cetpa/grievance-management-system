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

interface GrievanceTableProps {
  grievances?: any[];
  rightElement?: React.ReactNode;
  mode?: string;
}

const updateGrievanceStatus = async (status: string, id: number) => {
  try {
    const response = await axiosInstance.put(`/GrievanceManager/ChangeGrievanceStatus/${id}?Status=${status}`);
    if (response.data.statusCode === 200) {
      toast.success('Grievance is now in progress');
    }
  } catch (error) {
    console.error('Error updating grievance status:', error);
  }
};

const GrievanceTable: React.FC<GrievanceTableProps> = ({ grievances = [], rightElement, mode }) => {
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
        cell: ({ row }) => (
          <span>
            {format(
              new Date(
                new Date(row.original.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              ),
              'dd-MM-yyyy'
            )}
          </span>
        ),
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <div className="max-w-52 text-sm">{row.original.title}</div>,
      },
      {
        id: 'userDetails',
        accessorKey: 'userDetails',
        header: 'Created By',
        cell: ({ row }) => (
          <div className="max-w-52 text-sm text-nowrap">{row.original.userDetails?.split('-')[0]}</div>
        ),
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
            <StatusBadge status={getStatusText(row.original.statusId)} />
          </div>
        ),
      },
    ],
    [employeeList]
  );

  const getStatusText = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return 'new';
      case 2:
        return 'in_progress';
      case 3:
        return 'resolved';
      case 4:
        return 'closed';
      default:
        return 'unknown';
    }
  };

  return (
    <TableList
      data={grievances}
      columns={columns}
      rightElements={rightElement}
      onRowClick={async (rowData) => {
        if (rowData?.userCode === user?.EmpCode?.toString() && rowData?.statusId === 1) {
          await updateGrievanceStatus('in_progress', rowData?.id);
        }
        navigate(`/grievances/${rowData.id.toString().trim()}`);
      }}
    />
  );
};

export default GrievanceTable;
