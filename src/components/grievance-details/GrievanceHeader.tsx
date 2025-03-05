import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/ui/heading';
import StatusBadge from '../common/StatusBadge';
import { getStatusColor } from '@/lib/helperFunction';

interface GrievanceHeaderProps {
  title: string;
  statusId: number;
  getStatusText: (statusId: number) => string;
}

export const GrievanceHeader = ({ title, statusId, getStatusText }: GrievanceHeaderProps) => {
  const navigate = useNavigate();

  // const getStatusColor = (status: number) => {
  //   switch (status) {
  //     case 3:
  //       return 'bg-green-100 text-green-800 border-green-300';
  //     case 2:
  //       return 'bg-blue-100 text-blue-800 border-blue-300';
  //     case 4:
  //       return 'bg-gray-100 text-gray-800 border-gray-300';
  //     default:
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  //   }
  // };

  return (
    <div className="border-b">
      <div className="container  p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to Grievances</span>
        </Button>
        <div className="flex items-center justify-between">
          <Heading type={4} className="text-gray-800">
            {title}
          </Heading>
          <Badge
            variant="outline"
            className={`px-4 py-1.5 text-sm font-medium ${getStatusColor(getStatusText(statusId))}`}
          >
            {getStatusText(statusId)}
          </Badge>
        </div>
      </div>
    </div>
  );
};
