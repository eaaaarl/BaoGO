import { authApi } from "@/feature/auth/api/authApi";
import { driverApi } from "@/feature/driver/api/driverApi";
import { messageApi } from "@/feature/message/api/messageApi";
import { rideApi } from "@/feature/ride/api/rideApi";
import { userApi } from "@/feature/user/api/userApi";
import { authReducer } from "@/libs/redux/state/authSlice";
import { driverReducers } from "@/libs/redux/state/driverSlice";
import { locationReducer } from "@/libs/redux/state/locationSlice";
import { rideReducer } from "@/libs/redux/state/rideSlice";
import { userRoleReducer } from "@/libs/redux/state/userRoleSlice";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  // SLICE
  location: locationReducer,
  auth: authReducer,
  driver: driverReducers,
  userRole: userRoleReducer,
  ride: rideReducer,

  // RTK QUERY
  [authApi.reducerPath]: authApi.reducer,
  [driverApi.reducerPath]: driverApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [messageApi.reducerPath]: messageApi.reducer,
  [rideApi.reducerPath]: rideApi.reducer,
});

export const apis = [authApi, driverApi, userApi, messageApi, rideApi];

export const apisReducerPath = apis.map((api) => api.reducerPath);

export default rootReducer;
