import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  Roles: string | null;
  unique_name: string | null;
  EmpCode: string | null;
  Designation: string | null;
  Unit: string | null;
  unitId: string | null;
  Lavel: string | null; // Assuming "Level" was intended, but keeping as provided
  Department: string | null;
  exp: number | null;
}

const initialState: UserState = {
  Roles: null,
  unique_name: null,
  EmpCode: null,
  Designation: null,
  Unit: null,
  unitId: null,
  Lavel: null,
  Department: null,
  exp: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    resetUser() {
      return initialState;
    },
  },
});

export const { updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
