import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface Employee {
  id: number | null;
  empId: number;
  empCode: string;
  empName: string;
  department: string | null;
  designation: string;
  level: string;
  unitName: string;
  unitId: number;
  empMobileNo: string | null;
  empEmail: string | null;
  managerId: number | null;
  managerCode: string | null;
  managerName: string | null;
  totalReportingCount: number;
  title: string | null;
}

interface EmployeeState {
  employees: Employee[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  status: 'idle',
  error: null,
};

// export const fetchEmployees = createAsyncThunk('employee/fetchEmployees', async () => {
//   const response = await fetch('https://orgsvc.dfccil.com/api/Organization/GetOrganizationHierarchy')
//   if (!response.ok) {
//     throw new Error('Failed to fetch employees')
//   }
//   const data = await response.json()
//   //////console.log(data)

//   return data.data
// })

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployeesData: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    clearEmployeesData: (state) => {
      state.employees = [];
    },
  },

  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchEmployees.pending, (state) => {
  //       state.status = 'loading'
  //     })
  //     .addCase(fetchEmployees.fulfilled, (state, action) => {
  //       state.status = 'succeeded'
  //       state.employees = action.payload
  //     })
  //     .addCase(fetchEmployees.rejected, (state, action) => {
  //       state.status = 'failed'
  //       state.error = action.error.message || 'Failed to fetch employees'
  //     })
  // }
});

export const { setEmployeesData, clearEmployeesData } = employeeSlice.actions;
export default employeeSlice.reducer;
