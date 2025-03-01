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
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Total Grievances</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-blue-700">95</p>
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-700" />
            </div>
          </CardHeader>
        </Card>
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-yellow-700">28</p>
              </div>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-700" />
            </div>
          </CardHeader>
        </Card>
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-orange-700">15</p>
              </div>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-700" />
            </div>
          </CardHeader>
        </Card>
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-green-50 to-green-100 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-green-700">67</p>
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-700" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts and Additional Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="space-y-1">
              <Heading type={5}>Grievances Overview</Heading>
              <p className="text-sm text-gray-600">Monthly distribution of cases</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grievanceChartData}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Bar dataKey="total" fill="#0D56C5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-violet-50 to-purple-100">
            <div>
              <Heading type={5}>Unresolved Cases</Heading>
              <p className="text-sm text-gray-600 mt-1">Overview of pending grievances</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold text-3xl text-red-600">122</div>
              <p className="text-sm text-gray-600">Total Cases</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 7 Days</p>
                </div>
                <p className="text-2xl font-bold text-red-500">12</p>
                <p className="text-sm text-gray-500 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 14 Days</p>
                </div>
                <p className="text-2xl font-bold text-orange-500">8</p>
                <p className="text-sm text-gray-500 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">This Month</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">25</p>
                <p className="text-sm text-gray-500 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-red-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Previous All</p>
                </div>
                <p className="text-2xl font-bold text-red-500">43</p>
                <p className="text-sm text-gray-500 mt-1">Cases pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
