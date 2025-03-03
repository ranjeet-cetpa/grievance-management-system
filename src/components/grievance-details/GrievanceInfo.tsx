import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { UserCircle, Calendar, UserCog, Clock } from 'lucide-react';

interface GrievanceInfoProps {
  userDetails: string;
  createdDate: string;
  assignedUserDetails: string;
  modifiedDate: string;
}

export const GrievanceInfo = ({ userDetails, createdDate, assignedUserDetails, modifiedDate }: GrievanceInfoProps) => {
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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 animate-fadeIn">
      <InfoCard label="Created By" value={userDetails} icon={UserCircle} />
      <InfoCard label="Created Date" value={formatDate(createdDate)} icon={Calendar} />
      <InfoCard label="Assigned To" value={assignedUserDetails || 'Not Assigned'} icon={UserCog} />
      <InfoCard label="Last Modified" value={modifiedDate ? formatDate(modifiedDate) : 'Not Modified'} icon={Clock} />
    </div>
  );
};
