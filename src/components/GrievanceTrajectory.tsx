import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Label } from './ui/label';
import Heading from './ui/heading';

const GrievanceTrajectory = ({ grievanceId, grievance }) => {
  const [trajectory, setTrajectory] = useState([]);
  const [nodeColors, setNodeColors] = useState({});
  const containerRef = useRef(null); // Reference for the container

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 156) + 200; // Ensure light colors (100-255)
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchGrievanceHistory = async () => {
      try {
        const response = await axiosInstance.get(`/Grievance/GrievanceHistory?grievanceId=${grievanceId}`);
        if (response.data.statusCode === 200) {
          console.log('response.data.data for trajectory', response.data.data);
          let processedData = response.data.data.filter((process) => process.changeList.length > 0); // Filter out processes without changes

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

          // Generate random colors for each node
          const colors = {};
          filteredData.forEach((process) => {
            colors[process.grievanceProcessId] = generateRandomColor();
          });
          setNodeColors(colors);
        }
      } catch (error) {
        console.error('Error fetching grievance history:', error);
      }
    };

    fetchGrievanceHistory();
  }, [grievanceId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth; // Scroll to the right
    }
  }, [trajectory]); // Trigger scrolling when trajectory updates

  return (
    <div>
      {trajectory[0] && (
        <div className="flex flex-col gap-2 my-2">
          <Heading type={6} className="px-4">
            Grievance Flow History
          </Heading>
          <div
            ref={containerRef} // Attach the ref to the container
            className="flex items-center space-x-6 overflow-x-auto p-6 bg-gray-50 rounded-lg shadow-md"
          >
            <div className="flex items-center">
              <div
                className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                style={{
                  backgroundColor: 'lightblue',
                }}
              >
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatDate(grievance?.createdDate)}</span>
                  <span>{formatTime(grievance?.createdDate)}</span>
                </div>
                <div className="text-center">
                  <div>
                    {trajectory[0]?.changeList.find((change) => change.column === 'AssignedUserDetails')?.oldValue}
                  </div>
                  <div className="text-xs">
                    {trajectory[0]?.changeList.find((change) => change.column === 'RoleName')?.oldValue === 'Redressal'
                      ? 'Complaint Handler'
                      : trajectory[0]?.changeList.find((change) => change.column === 'RoleName')?.oldValue}
                  </div>
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-400 px-3">→</span>
            </div>
            {trajectory.map((process, index) => {
              const assignedUserChange = process.changeList.find((change) => change.column === 'AssignedUserCode');
              const assignedUserDetailsChange = process.changeList.find(
                (change) => change.column === 'AssignedUserDetails'
              );
              const assignedUserRoleDetails = process.changeList.find((change) => change.column === 'RoleName');
              const createdDateChange = process.changeList.find((change) => change.column === 'CreatedDate');

              return (
                <div key={process.grievanceProcessId} className="flex items-center">
                  <div
                    className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                    style={{
                      backgroundColor: nodeColors[process.grievanceProcessId] || '#E5E7EB',
                      color: '#000',
                    }}
                  >
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatDate(createdDateChange?.newValue)}</span>
                      <span>{formatTime(createdDateChange?.newValue)}</span>
                    </div>
                    <div className="text-center">
                      <div>{assignedUserDetailsChange?.newValue}</div>
                      <div className="text-xs">
                        {assignedUserRoleDetails?.newValue === 'Redressal'
                          ? 'Complaint Handler'
                          : assignedUserRoleDetails?.newValue}
                      </div>
                    </div>
                  </div>
                  {index < trajectory.length - 1 && <span className="text-3xl font-bold text-gray-400 px-3">→</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrievanceTrajectory;
