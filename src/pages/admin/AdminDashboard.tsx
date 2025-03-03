import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, Users, Building2, AlertTriangle } from 'lucide-react';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data - replace with actual data from your API
const grievanceChartData = [
  { name: 'Jan', total: 15 },
  { name: 'Feb', total: 8 },
  { name: 'Mar', total: 12 },
  { name: 'Apr', total: 19 },
  { name: 'May', total: 25 },
  { name: 'Jun', total: 16 },
];

const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Heading type={4}>Dashboard</Heading>
          <p className="text-gray-500">Overview of grievance management system</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px] bg-white shadow-sm">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Departments</SelectLabel>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="it">IT Department</SelectItem>
              <SelectItem value="hr">HR Department</SelectItem>
              <SelectItem value="finance">Finance Department</SelectItem>
              <SelectItem value="operations">Operations Department</SelectItem>
              <SelectItem value="marketing">Marketing Department</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Total Grievances</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-blue-800">95</p>
              </div>
            </div>
            <div className="p-2 bg-blue-200 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-800" />
            </div>
          </CardHeader>
        </Card>
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-yellow-100 to-yellow-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-yellow-800">28</p>
              </div>
            </div>
            <div className="p-2 bg-yellow-200 rounded-full">
              <Clock className="h-6 w-6 text-yellow-800" />
            </div>
          </CardHeader>
        </Card>
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-orange-100 to-orange-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">In Progress</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-orange-800">15</p>
              </div>
            </div>
            <div className="p-2 bg-orange-200 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-800" />
            </div>
          </CardHeader>
        </Card>
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-green-100 to-green-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Resolved</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-green-800">67</p>
              </div>
            </div>
            <div className="p-2 bg-green-200 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-800" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts and Additional Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
            <div className="space-y-1">
              <Heading type={5}>Grievances Overview</Heading>
              <p className="text-sm text-gray-700">Monthly distribution of cases</p>
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

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-violet-100 to-purple-200">
            <div>
              <Heading type={5}>Unresolved Cases</Heading>
              <p className="text-sm text-gray-700 mt-1">Overview of pending grievances</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold text-3xl text-red-700">122</div>
              <p className="text-sm text-gray-700">Total Cases</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 7 Days</p>
                </div>
                <p className="text-2xl font-bold text-red-700">12</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-orange-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 14 Days</p>
                </div>
                <p className="text-2xl font-bold text-orange-700">8</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">This Month</p>
                </div>
                <p className="text-2xl font-bold text-yellow-700">25</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Previous All</p>
                </div>
                <p className="text-2xl font-bold text-red-700">43</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
