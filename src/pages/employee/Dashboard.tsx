import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, AlertTriangle, Calendar, Sheet } from 'lucide-react';
import CreateTask from './CreateTask';
import logger from '@/lib/logger';
import Heading from '@/components/ui/heading';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import DashboardTaskTable from '@/components/common/DashboardTakTable';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('thisWeek');

  useEffect(() => {
    logger.debug('Debugging: Component mounted');
    logger.info('Info: Component is running');
    logger.warn('Warning: Something might be off');
    logger.error('Error: Something went wrong!');

    // Simulating API call
    setTimeout(() => {
      fetchDashboardData();
    }, 500);
  }, []);

  const fetchDashboardData = () => {
    const apiResponse = {
      statusCode: 200,
      message: 'Dashboard Data fetched Successfully.',
      data: {
        totalTaskCount: 1,
        newTaskCount: 0,
        inProgressTaskCount: 1,
        underReviewTaskCount: 0,
        completedTaskCount: 0,
        overDueTask: {
          taskCount: 0,
          taskList: [],
        },
        dueInNext7Days: {
          taskCount: 1,
          taskList: [
            {
              taskId: 2,
              title: 'KAMNA THAKUR TESTING TASK',
              dueDate: '2025-02-26T18:30:00',
              status: 'in_progress',
              description: '<p>testing task for kamna thakur this is a sample description </p>',
            },
          ],
        },
        dueThisMonth: {
          taskCount: 1,
          taskList: [],
        },
        dueNextMonth: {
          taskCount: 0,
          taskList: [],
        },
      },
    };

    // Remove duplicate tasks across categories
    const seenTaskIds = new Set();
    const removeDuplicates = (tasks) =>
      tasks.filter((task) => {
        if (seenTaskIds.has(task.taskId)) {
          return false;
        }
        seenTaskIds.add(task.taskId);
        return true;
      });

    apiResponse.data.dueInNext7Days.taskList = removeDuplicates(apiResponse.data.dueInNext7Days.taskList);
    apiResponse.data.dueThisMonth.taskList = removeDuplicates(apiResponse.data.dueThisMonth.taskList);
    apiResponse.data.dueNextMonth.taskList = removeDuplicates(apiResponse.data.dueNextMonth.taskList);

    setDashboardData(apiResponse.data);
  };

  if (!dashboardData) return <div className="text-center mt-10 text-gray-500">Loading dashboard data...</div>;

  const getSelectedTaskList = () => {
    if (selectedFilter === 'thisWeek') return dashboardData.dueInNext7Days.taskList;
    if (selectedFilter === 'thisMonth') return dashboardData.dueThisMonth.taskList;
    if (selectedFilter === 'nextMonth') return dashboardData.dueNextMonth.taskList;
    return [];
  };

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Heading type={3} className="font-normal">
            Dashboard
          </Heading>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Track, manage, and collaborate on your tasks efficiently.
          </p>
        </div>
        <CreateTask />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-b from-blue-600 to-violet-800 shadow-xl border border-white/20 p-6 text-white">
          <CardHeader className="text-xl font-semibold flex items-center justify-between">My Tasks</CardHeader>
          <CardContent className="text-center text-6xl font-extrabold">{dashboardData.totalTaskCount}</CardContent>
        </Card>

        <Card className="bg-green-100 dark:bg-gray-800 shadow-md p-4 hover:scale-[1.02] transition">
          <CardHeader className="flex items-center space-x-3">
            <CheckCircle className="text-green-600 w-8 h-8" />
            <h3 className="text-lg font-semibold">Completed Tasks</h3>
          </CardHeader>
          <CardContent className="text-center text-4xl font-bold">{dashboardData.completedTaskCount}</CardContent>
        </Card>

        <Card className="bg-blue-100 dark:bg-gray-800 shadow-md p-4 hover:scale-[1.02] transition">
          <CardHeader className="flex items-center space-x-3">
            <Clock className="text-yellow-600 w-8 h-8" />
            <h3 className="text-lg font-semibold">In Progress</h3>
          </CardHeader>
          <CardContent className="text-center text-4xl font-bold">{dashboardData.inProgressTaskCount}</CardContent>
        </Card>

        <Card className="bg-red-100 dark:bg-gray-800 shadow-md p-4 hover:scale-[1.02] transition">
          <CardHeader className="flex items-center space-x-3">
            <AlertTriangle className="text-red-600 w-8 h-8" />
            <h3 className="text-lg font-semibold">Overdue</h3>
          </CardHeader>
          <CardContent className="text-center text-4xl font-bold">{dashboardData.overDueTask.taskCount}</CardContent>
        </Card>
      </div>

      {/* Task Sections */}
      <div className="grid grid-cols-1  gap-6 mt-10">
        <div className="bg-white p-6 rounded-lg shadow-lg h-auto">
          <h2 className="text-2xl font-bold text-red-600 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Overdue Tasks
          </h2>
          {dashboardData.overDueTask.taskList.length > 0 ? (
            <DashboardTaskTable tasks={dashboardData.overDueTask.taskList} />
          ) : (
            <div className="italic text-gray-500">There are no overdue tasks.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg h-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
              <Sheet className="w-6 h-6" /> Upcoming Task
            </h2>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="thisWeek">Next 7 days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="nextMonth">Next Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            {getSelectedTaskList().length > 0 ? (
              <DashboardTaskTable tasks={getSelectedTaskList()} />
            ) : (
              <div className="italic text-gray-500">There are no tasks in the selected category.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
