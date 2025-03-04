import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Guest {
  firstName: string;
  middleName?: string;
  lastName: string;
}

interface moreMeetingDetails {
  whomeToMeet: string;
  dept: string;
  designation: string;
  meetDate: string;
  purposeOfVisit: string;
  duration: string;
  inTime: string;
  outTime: string;
}
interface PersonalDetailsState {
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber: string;
  otp?: string;
  designation?: string;
  organisationName?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  guests: Guest[];
  moreMeetingDetails: moreMeetingDetails[];
}

const initialState: PersonalDetailsState = {
  firstName: '',
  middleName: '',
  lastName: '',
  contactNumber: '',
  otp: '',
  designation: '',
  organisationName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  guests: [],
  moreMeetingDetails: [],
};

const personalDetailsSlice = createSlice({
  name: 'personalDetails',
  initialState,
  reducers: {
    setPersonalDetails(state, action: PayloadAction<PersonalDetailsState>) {
      //////console.log(action.payload);
      Object.assign(state, action.payload);
    },

    addGuest(state, action: PayloadAction<Guest>) {
      state.guests.push(action.payload);
    },

    updateContactNumber(state, action: PayloadAction<{ contactNumber: string; otp: string }>) {
      const { contactNumber, otp } = action.payload;
      state.contactNumber = contactNumber;
      state.otp = otp;
    },

    updateGuest(state, action: PayloadAction<{ index: number; guest: Guest }>) {
      const { index, guest } = action.payload;
      if (state.guests[index]) {
        state.guests[index] = guest;
      }
    },

    removeGuest(state, action: PayloadAction<number>) {
      state.guests.splice(action.payload, 1);
    },

    clearPersonalDetails(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setPersonalDetails, addGuest, updateGuest, removeGuest, clearPersonalDetails, updateContactNumber } =
  personalDetailsSlice.actions;

export default personalDetailsSlice.reducer;
