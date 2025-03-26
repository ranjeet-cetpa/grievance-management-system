import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { UserCircle, Calendar, UserCog, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { extractUniqueDepartments, extractUniqueUnits, findEmployeeDetails } from '@/lib/helperFunction';
import { format } from 'date-fns';

interface GrievanceInfoProps {
  currentgroup: string;
  userDetails: string;
  assignedUserCode: string;
  createdDate: string;
  assignedUserDetails: string;
  modifiedDate: string;
  createdBy: string;
}

export const GrievanceInfo = ({
  currentgroup,
  userDetails,
  createdDate,
  assignedUserDetails,
  assignedUserCode,
  modifiedDate,
  createdBy,
}: GrievanceInfoProps) => {
  console.log(currentgroup, 'this is current group');
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>();
  const [unit, setUnit] = useState<string | null>();
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await axiosInstance.get(`/Admin/GetGroupDetail?groupId=${currentgroup}`);

        const roleId = response.data?.data?.group?.roleId;
        const description = response.data?.data?.group?.description;
        const unit = response.data?.data?.group?.unitId;
        const groupName = response.data?.data?.group?.groupName;
        setDescription(description);
        setUnit(unit);
        setGroupName(groupName);
        const roles = [
          { id: 1, roleName: 'Admin' },
          { id: 2, roleName: 'Managing Director' },
          { id: 3, roleName: 'Committee' },
          { id: 4, roleName: 'Nodal Officer' },
          { id: 5, roleName: 'Unit CGM' },
          { id: 6, roleName: 'HOD' },
          { id: 7, roleName: 'Complaint Handler' },
        ];
        const role = roles.find((r) => r.id === roleId);
        setRoleName(role?.roleName || null);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };
    fetchGroupDetails();
  }, [currentgroup]);

  const InfoCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <Card
      className="bg-white p-4 rounded-lg shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] 
            hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12)] hover:border-primary/20
            transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/8 p-2 rounded-md shrink-0">
          <Icon className="w-4 h-4 text-primary/90" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <Label className="text-xs font-medium text-gray-500 block tracking-wide capitalize">{label}</Label>
          <p className="font-medium text-sm text-gray-800 truncate" title={value}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM, yyyy, hh:mm a');
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2  gap-4 my-2   rounded-lg  animate-fadeIn ${
        user?.EmpCode?.toString() !== createdBy?.toString() ? ' lg:grid-cols-4' : 'lg:grid-cols-3'
      }`}
    >
      {user?.EmpCode?.toString() !== createdBy?.toString() && (
        <InfoCard label="Requested By" value={userDetails} icon={UserCircle} />
      )}
      <InfoCard label="Initiated On" value={formatDate(createdDate)} icon={Calendar} />
      <InfoCard
        label="Currently With"
        value={
          <>
            <div className="flex  flex-col gap-1 ">
              <div>
                {assignedUserDetails || 'Not Assigned'}
                {findEmployeeDetails(employeeList, assignedUserCode.toString())?.employee?.designation
                  ? ` ( ${findEmployeeDetails(employeeList, assignedUserCode.toString())?.employee?.designation} )`
                  : ''}
              </div>
              <div className="flex gap-2">
                <div className="text-xs">{roleName ? `${roleName}` : ''}</div>
                {/* <div className="text-xs">{description ? `(${description})` : ''}</div> */}
                {/* <div className="text-xs">
                  {unit ? `(${unitsDD.find((u) => u.unitId === parseInt(unit)).unitName})` : ''}
                </div> */}
                <div className="text-xs capitalize">
                  {groupName && roleName === 'Complaint Handler' ? `(${groupName})` : ''}
                </div>
              </div>
            </div>
          </>
        }
        icon={UserCog}
      />
      <InfoCard label="Pending Since" value={modifiedDate ? formatDate(modifiedDate) : 'Not Modified'} icon={Clock} />
    </div>
  );
};
