import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatTaskStatus, getStatusColor } from '@/lib/helperFunction';

interface Props {
  status: string;
}

const StatusBadge: React.FC<Props> = ({ status }) => (
  <div>
    <Badge variant="outline" className={`capitalize text-nowrap ${getStatusColor(status)}`}>
      {formatTaskStatus(status)}
    </Badge>
  </div>
);

export default StatusBadge;
