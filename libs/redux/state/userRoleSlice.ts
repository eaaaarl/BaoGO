import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserRoleState {
  userRole: "Driver" | "Rider" | "Guest";
}

const initialState: UserRoleState = {
  userRole: "Guest",
};

export const userRoleSlice = createSlice({
  name: "userRole",
  initialState,
  reducers: {
    setUserRole: (
      state,
      action: PayloadAction<"Driver" | "Rider" | "Guest">
    ) => {
      state.userRole = action.payload;
    },

    clearUserRole: (state) => {
      state.userRole = "Guest";
    },
  },
});

export const { setUserRole, clearUserRole } = userRoleSlice.actions;
export const userRoleReducer = userRoleSlice.reducer;
