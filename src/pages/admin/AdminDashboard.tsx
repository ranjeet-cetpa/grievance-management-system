import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AlertCircle, Clock, CheckCircle2, Users, Building2, AlertTriangle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { environment } from '@/config';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import Loader from '@/components/ui/loader';
import toast from 'react-hot-toast';
import { setSelectedWorkspace } from '@/features/workspace/workspaceSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useUserRoles from '@/hooks/useUserRoles';
import useAdminUnits from '@/hooks/useAdminUnits';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const selectedUnit = useSelector((state: RootState) => state.workspace.selectedWorkspace);
  const units = useSelector((state: RootState) => state.units.units);
  const { isAdmin, isSuperAdmin } = useUserRoles();
  const { adminUnits, isLoading } = useAdminUnits(user?.EmpCode);

  const departmentsList = useMemo(() => {
    const uniqueDepts = new Set(employeeList?.map((emp) => emp.department?.trim()).filter(Boolean));
    return Array.from(uniqueDepts)
      .sort()
      .map((dept) => ({
        departmentName: dept,
      }));
  }, [employeeList]);

  const handleWorkspaceChange = (workspaceName: string, workspaceId: number) => {
    dispatch(setSelectedWorkspace({ unitName: workspaceName, unitId: workspaceId }));
  };

  const filteredUnits = useMemo(() => {
    return isSuperAdmin ? units : units.filter((unit) => adminUnits.includes(unit.unitId));
  }, [units, isSuperAdmin, adminUnits]);

  useEffect(() => {
    // Set default unit based on user role and permissions
    if (isAdmin && !isSuperAdmin && adminUnits.length > 0) {
      const defaultUnit = units.find((unit) => unit.unitId === Number(adminUnits[0]));
      if (defaultUnit) {
        dispatch(setSelectedWorkspace({ unitName: defaultUnit.unitName, unitId: defaultUnit.unitId }));
      }
    } else {
      dispatch(setSelectedWorkspace({ unitName: user.Unit, unitId: Number(user.unitId) }));
    }
  }, [isAdmin, isSuperAdmin, adminUnits]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userCode: user?.EmpCode,
        year: Number(selectedYear).toString(),
      });
      if (selectedUnit?.unitId && selectedUnit.unitId !== 0) {
        params.append('unitId', selectedUnit.unitId.toString());
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('department', selectedDepartment);
      }
      const response = await axiosInstance.get(`/Grievance/GetDashboardData?${params.toString()}`);
      const data = response?.data?.data;
      setDashboardData(data);
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedUnit, selectedDepartment]);

  const grievanceChartData = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().getMonth() + 1;
    if (selectedYear === currentYear) {
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

    return (
      dashboardData?.monthlyGrievances?.map((month) => ({
        name: month.monthName.substring(0, 3),
        total: month.totalCount,
      })) || []
    );
  }, [dashboardData, selectedYear]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          {loading && <Loader />}
          <Heading type={4}>Dashboard</Heading>
          <p className="text-gray-500">Overview of grievance management system</p>
        </div>{' '}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-4 py-2 border rounded-md  bg-white flex items-center gap-2">
              <span>{selectedUnit?.unitName || 'Select Unit'}</span>
              <Building2 className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {filteredUnits.map((unit) => (
                <DropdownMenuItem
                  key={unit.unitId}
                  className="px-4 py-2 text-sm text-gray-700  cursor-pointer"
                  onClick={() => handleWorkspaceChange(unit.unitName, unit.unitId)}
                >
                  <span className="capitalize">{unit.unitName.toLowerCase()}</span>
                </DropdownMenuItem>
              ))}{' '}
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="border-gray-300 w-[300px] focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Departments</SelectLabel>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentsList.map((dept) => (
                  <SelectItem key={dept.departmentName} value={dept.departmentName}>
                    {dept.departmentName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card className="transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br from-blue-100 to-blue-200 border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Total Grievances</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-blue-800">{dashboardData?.totalGrievance || 0}</p>
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
              <p className="text-sm font-medium text-gray-700">Open</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-yellow-800">{dashboardData?.pending || 0}</p>
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
                <p className="text-2xl font-bold text-orange-800">{dashboardData?.inProgress || 0}</p>
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
                <p className="text-2xl font-bold text-green-800">{dashboardData?.resolved || 0}</p>
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
            <div className="flex justify-end">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: new Date().getFullYear() - 2024 }, (_, i) => {
                    const year = 2025 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

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
              <div className="font-bold text-3xl text-red-700">
                {(dashboardData?.over30Days || 0) + (dashboardData?.thisMonth || 0)}
              </div>
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
                <p className="text-2xl font-bold text-red-700">{dashboardData?.over7Days || 0}</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-orange-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Over 14 Days</p>
                </div>
                <p className="text-2xl font-bold text-orange-700">{dashboardData?.over14Days || 0}</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">This Month</p>
                </div>
                <p className="text-2xl font-bold text-yellow-700">{dashboardData?.thisMonth || 0}</p>
                <p className="text-sm text-gray-700 mt-1">Cases pending</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-red-100 to-red-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700">Previous All</p>
                </div>
                <p className="text-2xl font-bold text-red-700">{dashboardData?.over30Days || 0}</p>
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
