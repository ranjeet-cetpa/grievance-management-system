import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import Heading from '@/components/ui/heading';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

interface GrievanceHeaderProps {
  title: string;
  statusId: number;
  assignedUserCode: string;
}

export const GrievanceHeader = ({ title, statusId, assignedUserCode }: GrievanceHeaderProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  const getStatusBadge = () => {
    if (statusId === 3) {
      return <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">Closed</span>;
    }

    if (assignedUserCode?.toString() === user?.EmpCode?.toString()) {
      return <span className="px-2 py-1 text-xs font-medium text-white bg-primary rounded-full">Open</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium text-white bg-yellow-600 rounded-full">In Progress</span>;
  };

  return (
    <div className="border-b w-full">
      <div className="container  p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to Grievances</span>
        </Button>
        <div className="flex items-center justify-between">
          <Heading type={4} className="text-gray-800">
            {title}
          </Heading>
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};
