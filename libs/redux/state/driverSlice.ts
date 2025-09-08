import { MarkerData } from "@/types/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DriverState {
  drivers: MarkerData[];
  selectedDriver: number | null;
}

const initialState: DriverState = {
  drivers: [] as MarkerData[],
  selectedDriver: null,
};

export const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    setSelectedDriver: (state, action: PayloadAction<{ driverId: number }>) => {
      state.selectedDriver = action.payload.driverId;
    },
    setDrivers: (state, action: PayloadAction<{ drivers: MarkerData[] }>) => {
      state.drivers = action.payload.drivers;
    },
    clearSelectedDriver: (state) => {
      state.selectedDriver = null;
    },
  },
});

export const { setSelectedDriver, setDrivers, clearSelectedDriver } =
  driverSlice.actions;
export const driverReducers = driverSlice.reducer;
