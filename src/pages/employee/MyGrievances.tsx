import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';
import GrievanceTable from '@/components/grievances/GrievanceTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loader from '@/components/ui/loader';
import Heading from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import CreateGrievance from './CreateTask';

// Dummy data for grievances
const dummyGrievances = [
  {
    id: 'GR-001',
    createdDate: '2025-02-20T10:30:00',
    title: 'Faulty Equipment in IT Department',
    assignedTo: 'John Doe',
    status: 'Open',
  },
  {
    id: 'GR-002',
    createdDate: '2025-02-21T09:15:00',
    title: 'Network Connectivity Issues',
    assignedTo: 'Jane Smith',
    status: 'In Progress',
  },
  {
    id: 'GR-003',
    createdDate: '2025-02-22T14:45:00',
    title: 'Office AC Not Working',
    assignedTo: 'Mike Johnson',
    status: 'Resolved',
  },
  {
    id: 'GR-004',
    createdDate: '2025-02-23T11:20:00',
    title: 'Software License Expiry',
    assignedTo: 'Sarah Williams',
    status: 'Open',
  },
  {
    id: 'GR-005',
    createdDate: '2025-02-24T16:30:00',
    title: 'Broken Chair in Conference Room',
    assignedTo: 'David Brown',
    status: 'In Progress',
  },
  {
    id: 'GR-006',
    createdDate: '2025-02-25T13:10:00',
    title: 'Printer Not Functioning',
    assignedTo: 'John Doe',
    status: 'Open',
  },
];

const FILTER_OPTIONS = {
  ALL: 'all',
  ASSIGNED_TO_ME: 'assignedToMe',
  CREATED_BY_ME: 'createdByMe',
};

const MyGrievances = () => {
  const user = useSelector((state: RootState) => state.user);
  const [filter, setFilter] = useState<string>(FILTER_OPTIONS.ASSIGNED_TO_ME);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to Fetch Grievances (simulated with dummy data)
  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      let responses = [];

      if (filter === FILTER_OPTIONS.ALL) {
        responses = [...dummyGrievances];
      } else if (filter === FILTER_OPTIONS.ASSIGNED_TO_ME) {
        responses = dummyGrievances.filter((g) => g.assignedTo === 'John Doe'); // Assuming current user is John Doe
      } else if (filter === FILTER_OPTIONS.CREATED_BY_ME) {
        // For dummy data, let's assume first 3 grievances were created by the current user
        responses = dummyGrievances.slice(0, 3);
      }

      setGrievances(responses);
      logger.log('Grievances fetched:', responses);
    } catch (error) {
      logger.error('Error fetching grievances:', error);
      toast.error('Something went wrong while fetching grievances');
    } finally {
      setLoading(false);
    }
  }, [filter]);

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
      <Card className="p-6 rounded-md">
        <div className="flex justify-between items-center">
          <Heading className="hidden sm:block" type={4}>
            Grievances
          </Heading>
          <div className="flex gap-2 items-center">
            <div className="mt-4 hidden sm:block">
              <CreateGrievance refreshGrievance={refreshGrievances} />
            </div>
          </div>
        </div>

        <div className="flex">
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
