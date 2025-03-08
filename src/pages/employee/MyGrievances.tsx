import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';
import GrievanceTable from '@/components/grievances/GrievanceTable';
import Loader from '@/components/ui/loader';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import CreateGrievance from './CreateGrievance';

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
  const [grievances, setGrievances] = useState<GrievanceResponse['data']>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGrievances, setFilteredGrievances] = useState<GrievanceResponse['data']>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 100000,
    totalRecords: 0,
    totalPages: 1,
  });

  // Function to Fetch Grievances from API
  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = `/Grievance/MyGrievanceList?userCode=${user.EmpCode}&pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
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
  }, [user.EmpCode, pagination.pageNumber, pagination.pageSize]);

  // Fetch grievances when component mounts or refresh changes
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
            <CardTitle className="text-2xl font-bold text-gray-800">My Grievances</CardTitle>
            <CreateGrievance refreshGrievances={refreshGrievances} />
          </div>
        </CardHeader>

        <div className="p-6">
          {loading ? (
            <Loader />
          ) : (
            <GrievanceTable
              mode="createdByMe"
              grievances={searchTerm.trim() === '' ? grievances : filteredGrievances}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default MyGrievances;
