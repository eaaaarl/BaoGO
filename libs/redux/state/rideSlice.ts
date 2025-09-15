import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RideState {
  driverInfo: {
    id: string;
    full_name: string;
    avatar_url: string;
    vehicle: {
      type: string;
      color: string;
      license_number: string;
      year: string;
    };
  };
}

const initialState: RideState = {
  driverInfo: {
    id: "",
    full_name: "",
    avatar_url: "",
    vehicle: {
      type: "",
      color: "",
      license_number: "",
      year: "",
    },
  },
};

export const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    setDriverInfo: (state, action: PayloadAction<RideState["driverInfo"]>) => {
      state.driverInfo = action.payload;
    },
  },
});

export const { setDriverInfo } = rideSlice.actions;
export const rideReducer = rideSlice.reducer;
