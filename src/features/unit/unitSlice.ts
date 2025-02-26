import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Unit {
  unitName: string;
  unitId: number;
}

interface UnitState {
  units: Unit[];
}

const initialState: UnitState = {
  units: [],
};

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.units = action.payload;
    },
    addUnit: (state, action: PayloadAction<Unit>) => {
      state.units.push(action.payload);
    },
    updateUnit: (state, action: PayloadAction<{ unitId: number; unitName: string }>) => {
      const { unitId, unitName } = action.payload;
      const unitIndex = state.units.findIndex((unit) => unit.unitId === unitId);
      if (unitIndex !== -1) {
        state.units[unitIndex].unitName = unitName;
      }
    },
    removeUnit: (state, action: PayloadAction<number>) => {
      state.units = state.units.filter((unit) => unit.unitId !== action.payload);
    },
    clearUnits: (state) => {
      state.units = [];
    },
  },
});

export const { setUnits, addUnit, updateUnit, removeUnit, clearUnits } = unitSlice.actions;
export default unitSlice.reducer;
