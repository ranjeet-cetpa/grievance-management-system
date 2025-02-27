import { RootState } from '@/app/store';
import { format, parse } from 'date-fns';
import { useSelector } from 'react-redux';

export const setSessionItem = (key: string, value: any) => {
  const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
  sessionStorage.setItem(key, valueToStore);
};

export const getSessionItem = (key: string): any => {
  const value = sessionStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return null;
};

export const removeSessionItem = (key: string) => {
  sessionStorage.removeItem(key);
};

export const clearSessionStorage = () => {
  sessionStorage.clear();
};

export const setCookie = (name: string, value: any) => {
  const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
  document.cookie = `${name}=${valueToStore}; path=/`;
};

export const getCookie = (name: string): any => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

export const getDay = (dateString) => {
  const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
  return format(parsedDate, 'dd');
};

export const getShortMonth = (dateString) => {
  const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
  return format(parsedDate, 'MMM');
};

export const findEmployeeDetails = (employees: any, empCode: string) => {
  const employee = employees.find((emp) => emp?.empCode === empCode);
  if (employee) {
    return {
      employee,
    };
  } else {
    return null;
  }
};

export const formatTaskStatus = (status: string) => {
  const statusMapping = {
    new: 'New',
    in_progress: 'In Progress',
    under_review: 'Under Review',
    reopen: 'Reopen',
    pending_extension: 'Pending Extension',
    completed: 'Completed',
  };

  return statusMapping[status] || 'Unknown Status';
};

export const getPriorityColor = (priority?: string): string => {
  const colors: Record<string, string> = {
    critical: 'font-bold bg-red-50 text-red-600',
    high: 'font-bold bg-orange-50 text-orange-600',
    medium: 'font-bold bg-yellow-50 text-yellow-600',
    low: 'font-bold bg-green-50 text-green-700 ',
  };
  return colors[priority?.toLowerCase()] || 'bg-gray-500 text-gray-700';
};

export const getStatusColor = (status?: string): string => {
  const colors: Record<string, string> = {
    completed: 'bg-green-600 text-white text-xs font-bold',
    in_progress: 'bg-yellow-600 text-white text-xs font-bold',
    under_review: 'bg-blue-600 text-white text-xs font-bold',
    new: 'bg-gray-600 text-white text-xs font-bold',
    reopen: 'bg-purple-600 text-white text-xs font-bold',
    pending_extension: 'bg-purple-600 text-white text-xs font-bold',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-500 text-gray-800 text-xs font-bold';
};

export const adjustforUTC = (date) => {
  const utcDate = new Date(date);
  const offset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const istDate = new Date(utcDate.getTime() + offset);
  return istDate.toISOString().replace('Z', '+05:30');
};

// Helper function to extract unique units from employee list
export const extractUniqueUnits = (employees) => {
  // Create a Map to track unique units by unitId
  const uniqueUnitsMap = new Map();

  // Process each employee
  employees.forEach((employee) => {
    // Only add if both unitId and unitName exist
    if (employee.unitId && employee.unitName) {
      uniqueUnitsMap.set(employee.unitId, {
        unitId: employee.unitId,
        unitName: employee.unitName?.trim(),
      });
    }
  });

  // Convert Map values to array
  return Array.from(uniqueUnitsMap.values());
};

export const extractUniqueDepartments = (employees) => {
  // Create a Set to track unique department values
  const uniqueDepartmentsSet = new Set();

  // Create an array to hold unique department objects
  const uniqueDepartments = [];

  // Process each employee
  employees.forEach((employee) => {
    // Only add if department exists and hasn't been added yet
    if (employee.department && !uniqueDepartmentsSet.has(employee.department)) {
      uniqueDepartmentsSet.add(employee.department);

      uniqueDepartments.push({
        departmentName: employee.department?.trim()?.toUpperCase(),
      });
    }
  });

  return uniqueDepartments;
};
