import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, MessageCircle, TimerReset } from 'lucide-react';
import React from 'react';

// Mock data - replace with actual data from your API
const grievanceChartData = [
  { name: 'Jan', total: 2 },
  { name: 'Feb', total: 1 },
  { name: 'Mar', total: 0 },
  { name: 'Apr', total: 3 },
  { name: 'May', total: 10 },
  { name: 'Jun', total: 2 },
];

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Heading type={4}>My Grievances Dashboard</Heading>
          <p className="text-gray-500">Overview of your grievance submissions</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Total Submitted</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-blue-800">9</p>
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
                <p className="text-2xl font-bold text-orange-800">2</p>
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
                <p className="text-2xl font-bold text-green-800">6</p>
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
              {[
                {
                  title: 'Work Schedule Adjustment Request',
                  date: '2024-03-15',
                  status: 'Under Review',
                  statusColor: 'bg-yellow-600',
                  lastUpdate: 'HR reviewing your request',
                },
                {
                  title: 'Training Opportunity Request',
                  date: '2024-03-10',
                  status: 'In Progress',
                  statusColor: 'bg-blue-600',
                  lastUpdate: 'Meeting scheduled with department head',
                },
                {
                  title: 'Equipment Request',
                  date: '2024-03-05',
                  status: 'Resolved',
                  statusColor: 'bg-green-600',
                  lastUpdate: 'New laptop approved',
                },
              ].map((grievance, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${grievance.statusColor}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{grievance.title}</p>
                    <p className="text-xs text-muted-foreground">Submitted: {grievance.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: <span className="font-medium">{grievance.status}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{grievance.lastUpdate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
