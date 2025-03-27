import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { Label } from './ui/label';
import Heading from './ui/heading';
import { format } from 'date-fns';
import { findEmployeeDetails } from '@/lib/helperFunction';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Hand } from 'lucide-react';

const GrievanceTrajectory = ({ grievanceId, grievance }) => {
  const [trajectory, setTrajectory] = useState([]);
  const [oldTrajectory, setOldTrajectory] = useState([]);
  const [nodeColors, setNodeColors] = useState({});
  const [creator, setCreator] = useState('');
  const containerRef = useRef(null); // Reference for the container
  const employeeList = useSelector((state: RootState) => state.employee.employees);

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 156) + 200; // Ensure light colors (100-255)
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM, yyyy');
  };

  const formatRoleName = (role: string) => {
    console.log(role);
    switch (role?.toLowerCase()) {
      case 'redressal':
        return 'Complaint Handler';
      case 'nodalofficer':
        return 'Nodal Officer';
      case 'managingdirector':
        return 'Managing Director';
      default:
        return role;
    }
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
          let processedData = response.data.data.filter((process) => process.changeList.length > 0);

          // Find processes with Round changes
          const roundChanges = processedData.filter((process) =>
            process.changeList.some((change) => change.column === 'Round')
          );
          const creator = findEmployeeDetails(employeeList, grievance?.createdBy)?.employee?.empName;
          setCreator(creator);

          // For each round change, insert creator's info
          roundChanges.forEach((roundProcess, index) => {
            const roundChangeIndex = processedData.findIndex(
              (p) => p.grievanceProcessId === roundProcess.grievanceProcessId
            );

            if (roundChangeIndex !== -1) {
              const creatorNode = {
                grievanceProcessId: `creator-${roundProcess.grievanceProcessId}`,
                border: true,
                roundchanger: true,
                changeList: [
                  {
                    column: 'AssignedUserCode',
                    oldValue: grievance.createdBy,
                    newValue: grievance.createdBy,
                  },
                  {
                    column: 'AssignedUserDetails',
                    oldValue: creator,
                    newValue: creator,
                  },
                  {
                    column: 'RoleName',
                    oldValue: `${roundChanges.length - index}`,
                    newValue: `${roundChanges.length - index}`,
                  },
                  {
                    column: 'CreatedDate',
                    oldValue: roundProcess.changeList.find((c) => c.column === 'CreatedDate')?.oldValue,
                    newValue: roundProcess.changeList.find((c) => c.column === 'CreatedDate')?.oldValue,
                  },
                ],
              };
              // const part1 = processedData.slice(0, roundChangeIndex);
              // const part2 = processedData.slice(roundChangeIndex + 1);
              // processedData = [...part1, creatorNode, ...part2];
              processedData.splice(roundChangeIndex, 0, creatorNode);
            }
          });

          console.log('Processed Data before swapping', processedData);

          const filteredData = processedData.reverse().filter((current, index, array) => {
            const currentAssignedUserCode = current.changeList.some((change) => change.column === 'AssignedUserCode');
            const nextAssignedUserCode = array[index + 1]?.changeList.find(
              (change) => change.column === 'AssignedUserCode'
            )?.newValue;
            return currentAssignedUserCode && currentAssignedUserCode !== nextAssignedUserCode;
          });

          console.log('filtered trajectory data ', filteredData);
          // setTrajectory(filteredData);
          console.log('Filtered Trajectory Data', filteredData);
          setOldTrajectory(filteredData);

          let newFilteredData = [...filteredData].sort((a, b) => {
            // Find the CreatedDate object in each changeList
            const dateAObj = a.changeList.find((item) => item.column === 'CreatedDate');
            const dateBObj = b.changeList.find((item) => item.column === 'CreatedDate');

            // Get the newValue or fallback to a default date if not found
            const dateA = dateAObj ? new Date(dateAObj.newValue) : new Date(0);
            const dateB = dateBObj ? new Date(dateBObj.newValue) : new Date(0);

            // Sort in ascending order (earliest date first)
            return dateA - dateB;
          });

          setTrajectory(newFilteredData);
          // Generate random colors for each node
          const colors = {};
          newFilteredData.forEach((process) => {
            // Use a specific color for seAppeal nodes
            if (process.grievanceProcessId.toString().includes('creator-')) {
              colors[process.grievanceProcessId] = '#FFE4B5'; // Light orange color for appeal nodes
            } else {
              colors[process.grievanceProcessId] = generateRandomColor();
            }
          });
          setNodeColors(colors);
        }
      } catch (error) {
        console.error('Error fetching grievance history:', error);
      }
    };

    fetchGrievanceHistory();
  }, [grievanceId, grievance]);

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
            ref={containerRef}
            className="flex items-center space-x-6 overflow-x-auto p-6 bg-gray-50 rounded-lg shadow-md"
          >
            <div className="flex items-center">
              {/* Creator Node */}
              <div
                className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                style={{
                  backgroundColor: '#e6ffe6',
                  border: '3px solid green ',
                }}
              >
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatDate(grievance?.createdDate)}</span>
                  <span>{formatTime(grievance?.createdDate)}</span>
                </div>
                <div className="text-center">
                  <div>{creator}</div>
                  <div className="text-xs text-gray-600">Requestor</div>
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-400 px-3">→</span>
              {/* Existing Static Node */}
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
                    {oldTrajectory[0]?.changeList.find((change) => change.column === 'AssignedUserDetails')?.oldValue}
                  </div>
                  <div className="text-xs text-gray-600">
                    {oldTrajectory[0]?.changeList.find((change) => change.column === 'RoleName')?.oldValue ===
                      'Redressal'
                      ? 'Complaint Handler'
                      : formatRoleName(
                        oldTrajectory[0]?.changeList.find((change) => change.column === 'RoleName')?.oldValue
                      )}
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
              const comment = process?.commentList?.comment || ""

              return (
                <div key={process.grievanceProcessId} className="flex items-center">
                  <div
                    className="text-sm font-semibold min-w-[220px] h-[80px] px-3 py-2 rounded-lg shadow flex flex-col justify-between"
                    style={{
                      backgroundColor: nodeColors[process.grievanceProcessId] || '#E5E7EB',
                      color: '#000',
                      border: process.border ? '3px solid red' : 'none',
                    }}
                  >
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatDate(createdDateChange?.newValue)}</span>
                      <div className="flex gap-1 items-center">
                        {process.border && <div className='mb-0.5'><Hand size={16} strokeWidth={1.5} /></div>}
                        {process.border && '(' + assignedUserRoleDetails?.newValue + ')'}
                      </div>
                      <span>{formatTime(createdDateChange?.newValue)}</span>
                    </div>
                    <div className="text-center">
                      <div>{assignedUserDetailsChange?.newValue}</div>
                      {!process.border && <div className="text-xs text-gray-600">{formatRoleName(assignedUserRoleDetails?.newValue)}</div>
                      }
                      {process.border && <div className="text-xs text-gray-600">Requestor</div>}
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
