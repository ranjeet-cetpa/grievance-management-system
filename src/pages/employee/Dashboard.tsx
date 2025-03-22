import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, MessageCircle, TimerReset } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import toast from 'react-hot-toast';
import axiosInstance from '@/services/axiosInstance';
import Loader from '@/components/ui/loader';
import { useNavigate } from 'react-router';

const Dashboard = () => {
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/Grievance/GetMyDashboardData?userCode=${user?.EmpCode}`);
      setDashboardData(response?.data?.data);
      console.log(response?.data?.data);
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const grievanceChartData = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().getMonth() + 1;
    if (currentYear) {
      return (
        dashboardData?.monthlyGrievances
          ?.filter((month) => {
            const monthNumber = new Date(`2023-${month.monthName}-01`).getMonth() + 1;
            return monthNumber <= currentMonth;
          })
          .map((month) => ({
            name: month.monthName.substring(0, 3),
            total: month.totalCount,
          })) || []
      );
    }
  }, [dashboardData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Heading type={4}>My Grievances Dashboard</Heading>
          <p className="text-gray-500">Overview of your grievance submissions</p>
        </div>
      </div>
      {loading && <Loader />}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Total Submitted</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-blue-800">{dashboardData?.totalGrievance || 0}</p>
              </div>
            </div>
            <div className="p-2 bg-blue-200 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-800" />
            </div>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-orange-100 to-orange-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">In Progress</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-orange-800">{dashboardData?.inProgress || 0}</p>
                <span className="ml-2 text-xs text-orange-700">Active</span>
              </div>
            </div>
            <div className="p-2 bg-orange-200 rounded-full">
              <Clock className="h-6 w-6 text-orange-800" />
            </div>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-green-100 to-green-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Resolved</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-green-800">{dashboardData?.resolved || 0}</p>
                <span className="ml-2 text-xs text-green-700">Complete</span>
              </div>
            </div>
            <div className="p-2 bg-green-200 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-800" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
            <div className="space-y-1">
              <Heading type={5}>My Grievances History</Heading>
              <p className="text-sm text-gray-600">Monthly submission overview</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grievanceChartData}>
                <XAxis dataKey="name" stroke="#1e40af" />
                <YAxis stroke="#1e40af" />
                <Bar dataKey="total" fill="#1e40af" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-violet-100 to-purple-200">
            <div className="space-y-1">
              <Heading type={5}>My Recent Grievances</Heading>
              <p className="text-sm text-gray-600">Latest updates on your submissions</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {dashboardData?.recentGrievances?.map((grievance, i) => (
                <div
                  key={grievance.id || i}
                  onClick={() => navigate(`/grievances/${grievance.id}`)}
                  className="flex items-center gap-4 border-b pb-4 last:border-0 cursor-pointer hover:bg-gray-100"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{grievance.title}</p>
                    <p className="text-xs text-muted-foreground">Submitted: {formatDate(grievance.createdDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      Status:{' '}
                      <span
                        className={
                          grievance.statusId === 1
                            ? 'text-green-600'
                            : grievance.statusId === 2
                            ? 'text-yellow-600'
                            : grievance.statusId === 3
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                        }
                      >
                        {grievance.statusId === 1
                          ? 'Open'
                          : grievance.statusId === 2
                          ? 'In Progress'
                          : grievance.statusId === 3
                          ? 'Closed'
                          : 'Unknown'}
                      </span>
                    </p>
                  </div>
                  {/* Removed the separate View button */}
                </div>
              )) || <p className="text-sm text-muted-foreground">No recent grievances</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
