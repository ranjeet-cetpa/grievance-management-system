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

const updateGrievanceStatus = async (rowData: any, user) => {
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
    formData.set('assignedUserCode', user?.EmpCode?.toString());
    formData.set(
      'assignedUserDetails',
      `${user?.unique_name ?? 'Unnamed'} ${user?.EmpCode ? `(${user?.EmpCode})` : ''} ${
        user?.Designation ? `- ${user?.Designation}` : ''
      } ${user?.Department ? `| ${user?.Department}` : ''}`
    );
    formData.set('grievanceMasterId', rowData.id.toString());

    const response = await axiosInstance.post('/Grievance/AddUpdateGrievance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.statusCode === 200) {
      return;
    }
  } catch (error) {
    console.error('Error updating grievance status:', error);
    toast.error('Failed to update grievance status');
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
      mode !== 'createdByMe' && {
        id: 'userDetails',
        accessorKey: 'userDetails',
        header: 'Created By',
        cell: ({ row }) => (
          <div className="max-w-52 text-sm text-nowrap">{row.original.userDetails?.split('-')[0]}</div>
        ),
      },
      mode !== 'createdByMe' && {
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
    [employeeList]
  )?.filter(Boolean);

  return (
    <TableList
      data={grievances}
      columns={columns}
      rightElements={rightElement}
      onRowClick={async (rowData) => {
        if (
          (rowData?.assignedUserCode === user?.EmpCode?.toString() || rowData?.assignedUserCode === '') &&
          rowData?.statusId === 1 &&
          rowData?.createdBy?.toString() !== user?.EmpCode?.toString()
        ) {
          await updateGrievanceStatus(rowData, user);
        }
        navigate(`/grievances/${rowData.id.toString().trim()}`);
      }}
    />
  );
};

export default GrievanceTable;
