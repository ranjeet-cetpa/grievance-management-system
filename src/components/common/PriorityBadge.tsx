import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPriorityColor } from '@/lib/helperFunction';

interface Props {
  priority: string;
}

const PriorityBadge: React.FC<Props> = ({ priority }) => (
  <div>
    <Badge variant="outline" className={`capitalize ${getPriorityColor(priority)}`}>
      {priority}
    </Badge>
  </div>
);

export default PriorityBadge;
