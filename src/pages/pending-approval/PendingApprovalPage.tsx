import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import logger from '@/lib/logger';

import { differenceInDays } from 'date-fns';

import TaskTable from '@/components/overview/TaskTable';
import { STATIC } from '@/constant/static';
import Loader from '@/components/ui/loader';
import TableTaskCard from '@/components/task/TableTaskCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PendingApprovalPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to Fetch Tasks
  const fetchTasks = useCallback(async () => {
    if (!user?.EmpCode) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/TaskManager/GetTaskByCreator/${user?.EmpCode}`);
      const allTasks = response.data.data || [];

      // Filter only pending tasks
      const underReviewTasks = allTasks
        ?.filter(
          (task) =>
            task.status === STATIC.TASK_STATUS.UNDER_REVIEW || task.status === STATIC.TASK_STATUS.PENDING_EXTENSION
        )
        ?.reverse();

      setTasks(underReviewTasks);
      logger.log('Pending tasks fetched:', underReviewTasks);
    } catch (error) {
      logger.error('Error fetching pending tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.EmpCode]);

  // Fetch tasks on mount & refresh

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refresh]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(
        (task) => task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchTerm, tasks]);
  // Refresh function
  const refreshTasks = () => setRefresh((prev) => !prev);
  return (
    <>
      <div className="p-2">
        <Card className="p-6 = rounded-md">
          <div className="flex flex-col gap-14">
            <Heading className=" " type={4}>
              Pending Approval
            </Heading>
            <div className="relative sm:hidden w-full ">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by task name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {loading && <Loader />}
            <div className="flex justify-between hidden sm:block items-center">
              <TaskTable
                mode={'createdByMe'}
                tasks={tasks.map((t) => ({
                  ...t,
                  dueDays: differenceInDays(new Date(t?.dueDate), new Date()),
                }))}
              />
            </div>
            <div className="sm:hidden">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => <TableTaskCard key={task.srNo} task={task} />)
              ) : (
                <div className="text-center py-4 text-gray-500">No tasks matching your search criteria</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default PendingApprovalPage;
