import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';

const GrievanceTrajectory = ({ grievanceId }) => {
  const [trajectory, setTrajectory] = useState([]);

  useEffect(() => {
    const fetchGrievanceHistory = async () => {
      try {
        const response = await axiosInstance.get(`/Grievance/GrievanceHistory?grievanceId=${grievanceId}`);
        if (response.data.statusCode === 200) {
          console.log('response.data.data for trajectory', response.data.data);
          let processedData = response.data.data
            .filter((process) => process.changeList.length > 0) // Filter out processes without changes
            .slice(1);
          // Remove the first process

          // Filter data to only include changes related to user assignments
          const filteredData = processedData.filter((current, index, array) => {
            const currentAssignedUserCode = current.changeList.some((change) => change.column === 'AssignedUserCode');
            const nextAssignedUserCode = array[index + 1]?.changeList.find(
              (change) => change.column === 'AssignedUserCode'
            )?.newValue;
            return currentAssignedUserCode && currentAssignedUserCode !== nextAssignedUserCode;
          });

          console.log('filtered trajectory data ', filteredData);
          setTrajectory(filteredData.reverse());
        }
      } catch (error) {
        console.error('Error fetching grievance history:', error);
      }
    };

    fetchGrievanceHistory();
  }, [grievanceId]);

  return (
    <div className="flex items-center space-x-4 overflow-x-auto p-4">
      {trajectory.map((process, index) => {
        const assignedUserChange = process.changeList.find((change) => change.column === 'AssignedUserCode');
        const assignedUserDetailsChange = process.changeList.find((change) => change.column === 'AssignedUserDetails');
        const createdDateChange = process.changeList.find((change) => change.column === 'CreatedDate');

        return (
          <div key={process.grievanceProcessId} className="flex items-center">
            <div className="text-sm font-medium bg-gray-200 px-2 py-1 rounded">
              {assignedUserDetailsChange?.oldValue} ({assignedUserChange?.oldValue}) →{' '}
              {assignedUserDetailsChange?.newValue} ({assignedUserChange?.newValue})
              <br />
              <span className="text-xs text-gray-500">{new Date(createdDateChange?.newValue).toLocaleString()}</span>
            </div>
            {index < trajectory.length - 1 && <span className="text-2xl font-bold text-gray-500 px-4">→</span>}
          </div>
        );
      })}
    </div>
  );
};

export default GrievanceTrajectory;
