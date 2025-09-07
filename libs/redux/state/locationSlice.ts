import { createSlice } from "@reduxjs/toolkit";

interface LocationState {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
}

const initialState: LocationState = {
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setUserLocation: (state, action) => {
      state.userLatitude = action.payload.latitude;
      state.userLongitude = action.payload.longitude;
      state.userAddress = action.payload.address;
    },
    setDestinationLocation: (state, action) => {
      state.destinationLatitude = action.payload.latitude;
      state.destinationLongitude = action.payload.longitude;
      state.destinationAddress = action.payload.address;
    },
    clearLocation: (state) => {
      state.userLatitude = null;
      state.userLongitude = null;
      state.userAddress = null;
      state.destinationLatitude = null;
      state.destinationLongitude = null;
      state.destinationAddress = null;
    },
  },
});

export const { setUserLocation, setDestinationLocation, clearLocation } =
  locationSlice.actions;
export const locationReducer = locationSlice.reducer;
