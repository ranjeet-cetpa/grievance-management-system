import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import Heading from '@/components/ui/heading';
import StatusBadge from '../common/StatusBadge';

interface GrievanceHeaderProps {
  title: string;
  statusId: number;
}

export const GrievanceHeader = ({ title, statusId }: GrievanceHeaderProps) => {
  const navigate = useNavigate();

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
          <StatusBadge statusId={statusId} />
        </div>
      </div>
    </div>
  );
};
