import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';
import GrievanceTable from '@/components/grievances/GrievanceTable';
import Loader from '@/components/ui/loader';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { Button } from '@/components/ui/button';
import CreateGrievance from './CreateGrievance';
import useUserRoles from '@/hooks/useUserRoles';

const FILTER_OPTIONS = {
  ALL: 'all',
  ASSIGNED_TO_ME: 'assignedToMe',
  CREATED_BY_ME: 'createdByMe',
};

interface GrievanceResponse {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Array<{
    id: number;
    title: string;
    description: string;
    serviceId: number;
    userCode: string;
    userEmail: string;
    userDetails: string;
    unitId: string;
    unitName: string;
    round: number;
    statusId: number;
    status: string | null;
    rowStatus: number;
    remark: string | null;
    createdBy: number;
    createdDate: string;
    modifyBy: number | null;
    modifyDate: string | null;
    isActive: boolean | null;
  }>;
}

const MyGrievances = () => {
  const user = useSelector((state: RootState) => state.user);
  const { isNodalOfficer, isSuperAdmin, isAdmin, isUnitCGM } = useUserRoles();

  // Check if user has any of the special roles
  const hasSpecialRole = isNodalOfficer || isSuperAdmin || isAdmin || isUnitCGM;

  logger.log('Current user:', user);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>(
    hasSpecialRole ? FILTER_OPTIONS.ASSIGNED_TO_ME : FILTER_OPTIONS.CREATED_BY_ME
  );
  const [grievances, setGrievances] = useState<GrievanceResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [filteredGrievances, setFilteredGrievances] = useState<GrievanceResponse['data']>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1,
  });

  // Function to Fetch Grievances from API
  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let response;

      // If user has special role, fetch based on selected filter
      if (hasSpecialRole) {
        if (filter === FILTER_OPTIONS.CREATED_BY_ME) {
          endpoint = `/Grievance/MyGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
          response = await axiosInstance.get(endpoint);
        } else if (filter === FILTER_OPTIONS.ASSIGNED_TO_ME) {
          endpoint = `/Grievance/GetGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
          response = await axiosInstance.get(endpoint);
        } else {
          // For ALL filter, fetch both types of grievances
          const [myGrievancesResponse, assignedGrievancesResponse] = await Promise.all([
            axiosInstance.get(
              `/Grievance/MyGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`
            ),
            axiosInstance.get(
              `/Grievance/GetGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`
            ),
          ]);

          // Combine the data from both responses
          const myGrievances = myGrievancesResponse.data.statusCode === 200 ? myGrievancesResponse.data.data.data : [];
          const assignedGrievances =
            assignedGrievancesResponse.data.statusCode === 200 ? assignedGrievancesResponse.data.data.data : [];

          // Combine and remove duplicates based on id
          const combinedGrievances = [...myGrievances, ...assignedGrievances];
          const uniqueGrievances = combinedGrievances.filter(
            (grievance, index, self) => index === self.findIndex((g) => g.id === grievance.id)
          );

          // Update the state with combined data
          setGrievances(uniqueGrievances);
          setPagination({
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            totalRecords: uniqueGrievances.length,
            totalPages: Math.ceil(uniqueGrievances.length / pagination.pageSize),
          });
          setLoading(false);
          return;
        }
      } else {
        // For regular users, only fetch created grievances
        endpoint = `/Grievance/MyGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
        response = await axiosInstance.get(endpoint);
      }

      if (response.data.statusCode === 200) {
        const responseData = response.data.data;
        setGrievances(responseData.data);
        setPagination({
          pageNumber: responseData.pageNumber,
          pageSize: responseData.pageSize,
          totalRecords: responseData.totalRecords,
          totalPages: responseData.totalPages,
        });
        logger.log('Grievances fetched:', responseData);
      } else if (response?.data?.statusCode === 404) {
        toast.error('No grievances found');
        setGrievances([]);
      } else {
        toast.error('Failed to fetch grievances');
        setGrievances([]);
      }
    } catch (error) {
      logger.error('Error fetching grievances:', error);
      toast.error('Something went wrong while fetching grievances');
      setGrievances([]);
    } finally {
      setLoading(false);
    }
  }, [filter, user.EmpCode, pagination.pageNumber, pagination.pageSize, hasSpecialRole]);

  // Fetch grievances when filter or refresh changes
  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances, refresh]);

  // Function to refresh grievances
  const refreshGrievances = () => {
    setRefresh((prev) => !prev);
  };

  // Filter grievances based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGrievances(grievances);
    } else {
      const filtered = grievances.filter(
        (grievance) => grievance.title && grievance.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGrievances(filtered);
    }
  }, [searchTerm, grievances]);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">My Grievances</CardTitle>
            </div>

            <div className="hidden sm:block">
              <CreateGrievance refreshGrievances={refreshGrievances} />
            </div>
          </div>
        </CardHeader>
        <div className="flex p-6">
          <Tabs className="w-full" defaultValue="table" value={filter} onValueChange={setFilter}>
            <div className="w-full mt-4 px-2 sm:px-0 hidden sm:table">
              {hasSpecialRole ? (
                // Show all tabs for special roles
                <>
                  <TabsContent value={FILTER_OPTIONS.ALL}>
                    <GrievanceTable
                      mode={'all'}
                      rightElement={
                        <TabsList className="">
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.ALL}
                          >
                            All Grievances
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.ASSIGNED_TO_ME}
                          >
                            Assigned to Me
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.CREATED_BY_ME}
                          >
                            Created by Me
                          </TabsTrigger>
                        </TabsList>
                      }
                      grievances={grievances}
                    />
                  </TabsContent>
                  <TabsContent value={FILTER_OPTIONS.ASSIGNED_TO_ME}>
                    <GrievanceTable
                      mode={'assignedToMe'}
                      rightElement={
                        <TabsList className="">
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.ALL}
                          >
                            All Grievances
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.ASSIGNED_TO_ME}
                          >
                            Assigned to Me
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.CREATED_BY_ME}
                          >
                            Created by Me
                          </TabsTrigger>
                        </TabsList>
                      }
                      grievances={grievances}
                    />
                  </TabsContent>
                  <TabsContent value={FILTER_OPTIONS.CREATED_BY_ME}>
                    <GrievanceTable
                      mode={'createdByMe'}
                      rightElement={
                        <TabsList className="">
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.ALL}
                          >
                            All Grievances
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.ASSIGNED_TO_ME}
                          >
                            Assigned to Me
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-full sm:w-[200px] md:w-[220px] transition"
                            value={FILTER_OPTIONS.CREATED_BY_ME}
                          >
                            Created by Me
                          </TabsTrigger>
                        </TabsList>
                      }
                      grievances={grievances}
                    />
                  </TabsContent>
                </>
              ) : (
                // Only show Created by Me tab for regular users
                <TabsContent value={FILTER_OPTIONS.CREATED_BY_ME}>
                  <GrievanceTable
                    mode={'createdByMe'}
                    rightElement={
                      <TabsList className="">
                        <TabsTrigger
                          className="w-full sm:w-[200px] md:w-[220px] transition"
                          value={FILTER_OPTIONS.CREATED_BY_ME}
                        >
                          Created by Me
                        </TabsTrigger>
                      </TabsList>
                    }
                    grievances={grievances}
                  />
                </TabsContent>
              )}
            </div>

            <div className="flex flex-row gap-4 items-center justify-between mb-4">
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <Heading className="sm:hidden" type={4}>
                    Grievances
                  </Heading>
                  <div className="flex flex-row gap-2 md:hidden">
                    <CreateGrievance refreshGrievances={refreshGrievances} />
                  </div>
                </div>
                <div className="relative sm:hidden mt-4 w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by grievance title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                {/* Mobile view tabs */}
                <div className="w-full mt-4 sm:hidden block">
                  <TabsList className="">
                    {hasSpecialRole ? (
                      <>
                        <TabsTrigger className="w-full sm:w-[200px] md:w-[220px] transition" value={FILTER_OPTIONS.ALL}>
                          All Grievances
                        </TabsTrigger>
                        <TabsTrigger
                          className="w-full sm:w-[200px] md:w-[220px] transition"
                          value={FILTER_OPTIONS.ASSIGNED_TO_ME}
                        >
                          Assigned to Me
                        </TabsTrigger>
                        <TabsTrigger
                          className="w-full sm:w-[200px] md:w-[220px] transition"
                          value={FILTER_OPTIONS.CREATED_BY_ME}
                        >
                          Created by Me
                        </TabsTrigger>
                      </>
                    ) : (
                      <TabsTrigger
                        className="w-full sm:w-[200px] md:w-[220px] transition"
                        value={FILTER_OPTIONS.CREATED_BY_ME}
                      >
                        Created by Me
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
              </div>
            </div>
            {loading && <Loader />}
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default MyGrievances;
