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
  logger.log('Current user:', user);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>(FILTER_OPTIONS.ASSIGNED_TO_ME);
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

      if (filter === FILTER_OPTIONS.CREATED_BY_ME) {
        endpoint = `/Grievance/MyGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
      } else if (filter === FILTER_OPTIONS.ASSIGNED_TO_ME) {
        endpoint = `/Grievance/GetGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
      } else {
        // For ALL, we can use either endpoint or implement a new one if needed
        endpoint = `/Grievance/GetGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
      }

      const response = await axiosInstance.get(endpoint);

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
  }, [filter, user.EmpCode, pagination.pageNumber, pagination.pageSize]);

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
              <TabsContent value={FILTER_OPTIONS.ALL}>
                <GrievanceTable
                  mode={'all'}
                  rightElement={
                    <Tabs className="w-full" defaultValue="table" value={filter} onValueChange={setFilter}>
                      <div className="w-full hidden sm:table">
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
                      </div>
                    </Tabs>
                  }
                  grievances={grievances}
                />
              </TabsContent>
              <TabsContent value={FILTER_OPTIONS.ASSIGNED_TO_ME}>
                <GrievanceTable
                  mode={'assignedToMe'}
                  rightElement={
                    <Tabs className="w-full" defaultValue="table" value={filter} onValueChange={setFilter}>
                      <div className="w-full px-2 hidden sm:table sm:px-0">
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
                      </div>
                    </Tabs>
                  }
                  grievances={grievances}
                />
              </TabsContent>
              <TabsContent value={FILTER_OPTIONS.CREATED_BY_ME}>
                <GrievanceTable
                  mode={'createdByMe'}
                  rightElement={
                    <Tabs className="w-full" defaultValue="table" value={filter} onValueChange={setFilter}>
                      <div className="w-full px-2 hidden sm:table sm:px-0">
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
                      </div>
                    </Tabs>
                  }
                  grievances={grievances}
                />
              </TabsContent>
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
                <Tabs className="w-full" defaultValue="table" value={filter} onValueChange={setFilter}>
                  <div className="w-full mt-4 sm:hidden block">
                    <TabsList className="">
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
                    </TabsList>
                  </div>
                </Tabs>
              </div>
            </div>
            {loading && <Loader />}

            {/* <div className="sm:hidden">
              {filteredGrievances.length > 0 ? (
                filteredGrievances.map((grievance) => <GrievanceCard key={grievance.id} grievance={grievance} />)
              ) : (
                <div className="text-center py-4 text-gray-500">No grievances matching your search criteria</div>
              )}
            </div> */}
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default MyGrievances;
