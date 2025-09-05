import { createSlice } from "@reduxjs/toolkit";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      const { user, session } = action.payload;
      state.user = user;
      state.session = session;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
    },
  },
});

export const { setAuthState, setInitialized, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
