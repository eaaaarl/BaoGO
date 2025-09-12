import { authApi } from "@/feature/auth/api/authApi";
import { driverApi } from "@/feature/driver/api/driverApi";
import { authReducer } from "@/libs/redux/state/authSlice";
import { driverReducers } from "@/libs/redux/state/driverSlice";
import { locationReducer } from "@/libs/redux/state/locationSlice";
import { userRoleReducer } from "@/libs/redux/state/userRoleSlice";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  // SLICE
  location: locationReducer,
  auth: authReducer,
  driver: driverReducers,
  userRole: userRoleReducer,

  // RTK QUERY
  [authApi.reducerPath]: authApi.reducer,
  [driverApi.reducerPath]: driverApi.reducer,
});

export const apis = [authApi, driverApi];

export const apisReducerPath = apis.map((api) => api.reducerPath);

export default rootReducer;
