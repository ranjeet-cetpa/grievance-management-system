import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import StatusBadge from './StatusBadge';
import { format, differenceInDays } from 'date-fns';

const DashboardTaskTable = ({ tasks }) => {
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow className=" text-white">
          <TableHead className="text-white">Sr No</TableHead>
          <TableHead className="text-white">Title</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-right text-white">Due in</TableHead>
          <TableHead className="text-right text-white">Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task, index) => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const daysRemaining = differenceInDays(dueDate, today);

          let dueDayColor = 'text-gray-600';
          let dueDayText;

          if (daysRemaining > 0) {
            dueDayText = `${daysRemaining} days`;
            if (daysRemaining <= 3) dueDayColor = 'text-orange-600'; // Urgent tasks
          } else if (daysRemaining < 0) {
            dueDayText = `Overdue by ${Math.abs(daysRemaining)} days`;
            dueDayColor = 'text-red-600'; // Overdue tasks
          } else {
            dueDayText = 'Due today';
            dueDayColor = 'text-red-600';
          }

          return (
            <TableRow key={task.taskId}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell className="text-nowrap">
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell className={`text-right font-medium ${dueDayColor}`}>{dueDayText}</TableCell>
              <TableCell className="text-right text-nowrap">{format(dueDate, 'dd MMM, yyyy')}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DashboardTaskTable;
