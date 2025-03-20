import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

            //.reverse() // Reverse the array
            .filter((process) => process.changeList.length > 0) // Filter out processes without changes
            .slice(1); // Remove the first process
          // Skip the first object and filter based on the next object's 'AssignedUserCode' and 'AssignedUserCode' in the current 'changeList'
          const filteredData = processedData.filter((current, index, array) => {
            // Check if the current object has 'AssignedUserCode' in its 'changeList'
            const currentAssignedUserCode = current.changeList.some((change) => change.column === 'AssignedUserCode');

            // If 'AssignedUserCode' exists in the current changeList and the next object exists, compare its 'AssignedUserCode'
            const nextAssignedUserCode = array[index + 1]?.changeList.find(
              (change) => change.column === 'AssignedUserCode'
            )?.newValue;

            // Only include objects that have 'AssignedUserCode' and do not have the same 'AssignedUserCode' as the next object
            return currentAssignedUserCode && currentAssignedUserCode !== nextAssignedUserCode;
          });

          console.log('filtered tragictory data ', filteredData);
          setTrajectory(processedData);
        }
      } catch (error) {
        console.error('Error fetching grievance history:', error);
      }
    };

    fetchGrievanceHistory();
  }, [grievanceId]);

  return (
    <div className="flex items-center space-x-4 overflow-x-auto p-4">
      {trajectory.map((process, index) => (
        <div key={process.grievanceProcessId} className="flex items-center">
          {process.changeList.map((change, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <div className="text-sm font-medium bg-gray-200 px-2 py-1 rounded">
                {change.oldValue} → {change.newValue}
              </div>
              {idx < process.changeList.length - 1 && <span className="text-lg">→</span>}
            </div>
          ))}
          {index < trajectory.length - 1 && <span className="text-2xl font-bold text-gray-500 px-4">→</span>}
        </div>
      ))}
    </div>
  );
};

export default GrievanceTrajectory;
