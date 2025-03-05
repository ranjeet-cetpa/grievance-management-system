import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatTaskStatus, getStatusColor, getStatusText } from '@/lib/helperFunction';

interface Props {
  statusId: number;
}

const StatusBadge: React.FC<Props> = ({ statusId }) => (
  <div>
    <Badge variant="outline" className={`px-4 py-1 text-sm font-medium ${getStatusColor(getStatusText(statusId))}`}>
      {getStatusText(statusId)}
    </Badge>
  </div>
);

export default StatusBadge;
