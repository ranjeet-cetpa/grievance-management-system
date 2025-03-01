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
    <div className="p-4 space-y-4">
      <div className="flex flex-row items-center justify-between">
        <Heading type={4}>Dashboard</Heading>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">Total Grievances</p>
              <p className="text-2xl font-bold text-black">95</p>
            </div>
            <AlertCircle className="h-6 w-6 text-black" />
          </CardHeader>
        </Card>
        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in [animation-delay:200ms] bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">Pending</p>
              <p className="text-2xl font-bold text-black">28</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-500" />
          </CardHeader>
        </Card>

        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in [animation-delay:300ms] bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">In Progress</p>
              <p className="text-2xl font-bold text-black">15</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </CardHeader>
        </Card>

        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in [animation-delay:400ms] bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">Resolved</p>
              <p className="text-2xl font-bold text-black">67</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </CardHeader>
        </Card>

        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in [animation-delay:800ms] bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">Departments</p>
              <p className="text-2xl font-bold text-black">8</p>
            </div>
            <Building2 className="h-6 w-6 text-purple-500" />
          </CardHeader>
        </Card>
      </div>

      {/* Charts and Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Heading type={5}>Grievances Overview</Heading>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={grievanceChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="total" fill="#0D56C5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-blue-50 to-violet-50">
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
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 7 Days</p>
                </div>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 14 Days</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-red-100 to-red-200 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">This Month</p>
                </div>
                <p className="text-2xl font-bold text-red-600">25</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-red-100 to-red-200 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Previous All</p>
                </div>
                <p className="text-2xl font-bold text-red-600">43</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
