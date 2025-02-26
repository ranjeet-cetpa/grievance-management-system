// types/Employee.ts
export interface Employee {
  empId?: string;
  empCode: string;
  empName: string;
  designation: string;
  department: string;
}

export interface SelectOption {
  value: string;
  label: string;
  empName: string;
  empCode: string;
  designation: string;
  unitName: string;
  unitId: string;
  department: string;
}

export interface SelectedEmployee {
  empName: string;
  empCode: string;
  designation: string;
  department: string;
  lavel: string;
}

export interface AssetAllocationDetails {
  empCode: string;
  roomNo: string;
  floor: string;
  cabinNo: string;
  workStation: string;
  empName?: string;
  designation?: string;
}

export interface AssetRelocationDetails {
  // Define relevant fields based on your application
}

export interface ScannedData {
  assetAllocationDetails?: AssetAllocationDetails;
  assetRelocationDetails?: AssetRelocationDetails;
  allocationStatus?: 'Assigned' | 'UnAssigned';
  // Add other relevant fields if necessary
}
