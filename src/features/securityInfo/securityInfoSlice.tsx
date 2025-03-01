import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  Name: null,
  Mobile: null,
  UnitName: null,
  UnitId: null,
  exp: null,
};

const securityInfoSlice = createSlice({
  name: 'securityInfo',
  initialState,
  reducers: {
    // Action to save security information
    saveSecurityInfo: (state, action) => {
      const { Name, Mobile, UnitName, UnitId, exp } = action.payload;
      state.Name = Name;
      state.Mobile = Mobile;
      state.UnitName = UnitName;
      state.UnitId = UnitId;
      state.exp = exp;
    },

    clearSecurityInfo: (state) => {
      state.Name = null;
      state.Mobile = null;
      state.UnitName = null;
      state.UnitId = null;
      state.exp = null;
    },
  },
});

export const { saveSecurityInfo, clearSecurityInfo } = securityInfoSlice.actions;

export default securityInfoSlice.reducer;
