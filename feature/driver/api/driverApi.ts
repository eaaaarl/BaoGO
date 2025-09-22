import { authApi } from "@/feature/auth/api/authApi";
import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { DriverProfile, Ride, UpdateDriverProfilePayload } from "./interface";

export const driverApi = createApi({
  reducerPath: "driverApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "DriverProfile",
    "DriverLocation",
    "DriverChatRooms",
    "getRiderRequestRide",
    "getIsAvailableStatus",
  ],
  endpoints: (builder) => ({
    updateDriverProfile: builder.mutation({
      queryFn: async (
        payload: UpdateDriverProfilePayload,
        api,
        extraOptions,
        baseQuery
      ) => {
        try {
          const authUpdateResult = await supabase.auth.updateUser({
            data: {
              full_name: payload.full_name,
              phone: payload.phone,
            },
          });

          if (authUpdateResult.error) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: authUpdateResult.error.message,
              },
            };
          }

          // Update profiles table
          const profilesUpdateResult = await supabase
            .from("profiles")
            .update({
              full_name: payload.full_name,
            })
            .eq("id", payload.id);

          if (profilesUpdateResult.error) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: profilesUpdateResult.error.message,
              },
            };
          }

          const driverProfilesUpsertResult = await supabase
            .from("driver_profiles")
            .upsert({
              id: payload.id,
              vehicle_type: payload.vehicle_type,
              vehicle_color: payload.vehicle_color,
              license_number: payload.vehicle_plate_number,
              vehicle_year: payload.vehicle_year,
            })
            .eq("id", payload.id)
            .select()
            .single();

          if (driverProfilesUpsertResult.error) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: driverProfilesUpsertResult.error.message,
              },
            };
          }

          api.dispatch(authApi.util.invalidateTags(["Profile", "User"]));

          return {
            data: driverProfilesUpsertResult.data,
          };
        } catch (error) {
          console.error("Unexpected error in updateDriverProfile:", error);
          return {
            error: { status: "CUSTOM_ERROR", error: (error as Error).message },
          };
        }
      },
      invalidatesTags: ["DriverProfile"],
    }),
    getDriverProfile: builder.query<DriverProfile, { id: string }>({
      queryFn: async ({ id }) => {
        try {
          const { data, error } = await supabase
            .from("driver_profiles")
            .select("*")
            .eq("id", id)
            .single();

          if (error) {
            return { error: { status: "CUSTOM_ERROR", error: error.message } };
          }

          if (!data) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Driver profile not found",
              },
            };
          }

          return {
            data: data,
          };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error as string } };
        }
      },
      providesTags: ["DriverProfile", "DriverLocation"],
    }),

    getDriverChatRooms: builder.query<any[], { driverId: string }>({
      queryFn: async ({ driverId }) => {
        const { data, error } = await supabase
          .from("chat_rooms")
          .select(
            `*, 
            rider:profiles!chat_rooms_rider_id_fkey(
            id,full_name,
            avatar_url
            ), 
            latest_message:messages(
            message,
            sent_at,
            sender_type
            )`
          )
          .eq("driver_id", driverId)
          .order("updated_at", { ascending: true });

        if (error) {
          console.log("error get driver chat rooms", error);
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }

        return { data };
      },
      providesTags: ["DriverChatRooms"],
    }),

    getRiderRequestRide: builder.query<Ride[], { driverId: string }>({
      queryFn: async ({ driverId }) => {
        try {
          const { data, error } = await supabase
            .from(`request_ride`)
            .select(
              `*,
              driver:driver_profiles!request_ride_driver_id_fkey
              (*, profile:profiles(*))`
            )
            .eq("driver_id", driverId)
            .eq("status", "Pending");

          if (error) {
            return {
              error: { error },
            };
          }

          return { data };
        } catch (error) {
          console.log("Error fetching request ride", error);
          return {
            error,
          };
        }
      },
      providesTags: ["getRiderRequestRide"],
    }),

    declineRiderRequestRide: builder.mutation<any, { requestId: string }>({
      queryFn: async ({ requestId }) => {
        try {
          const { data, error } = await supabase
            .from("request_ride")
            .update({
              status: "Cancel",
            })
            .eq("id", requestId)
            .eq("status", "Pending")
            .select()
            .single();

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          console.log("dt", data);
          console.log("err", error);

          return {
            data: {
              ...data,
              success: true,
              message: "Ride request declined",
            },
          };
        } catch (error) {
          console.error("Error declining ride request:", error);
          return {
            error: { message: "Failed to decline ride request" },
          };
        }
      },
      invalidatesTags: ["getRiderRequestRide"],
    }),
    acceptRiderRequestRide: builder.mutation<
      any,
      { requestId: string; driverId: string }
    >({
      queryFn: async ({ driverId, requestId }) => {
        try {
          const { data: currentRequest, error: fetchError } = await supabase
            .from("request_ride")
            .select("status, rider_id")
            .eq("id", requestId)
            .single();

          if (fetchError || !currentRequest) {
            return {
              error: { message: "Request not found" },
            };
          }

          if (currentRequest.status !== "Pending") {
            return {
              error: { message: "This request is no longer available" },
            };
          }

          const { data, error } = await supabase
            .from("request_ride")
            .update({
              status: "Accepted",
            })
            .eq("id", requestId)
            .eq("status", "Pending")
            .select(
              `
          *,
          rider:profiles!request_ride_rider_id_fkey(*),
          driver:driver_profiles!request_ride_driver_id_fkey(*, profile:profiles(*))
        `
            )
            .single();

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data: {
              ...data,
              success: true,
              message: "Ride request accepted successfully!",
            },
          };
        } catch (error) {
          console.error("Error accepting ride request:", error);
          return {
            error: { message: "Failed to accept ride request" },
          };
        }
      },
      invalidatesTags: ["getRiderRequestRide"],
    }),

    getIsAvailableStatus: builder.query<any, { driver_id: string }>({
      queryFn: async ({ driver_id }) => {
        try {
          const { data, error } = await supabase
            .from("driver_profiles")
            .select("is_available")
            .eq("id", driver_id)
            .single();

          if (error) {
            return {
              error: {
                message: error.message,
              },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: "Fetch is_available status",
            },
          };
        } catch (error) {
          console.error("Error at getIsAvailableStatus", error);
          return {
            error: {
              message: "Error at getIsAvailableStatus",
            },
          };
        }
      },
      providesTags: (result, error, { driver_id }) => [
        { type: "getIsAvailableStatus", id: driver_id },
      ],
    }),

    toggleStatus: builder.mutation<
      { is_available: boolean },
      { is_available: boolean; driver_id: string }
    >({
      queryFn: async ({ is_available, driver_id }) => {
        try {
          const { data, error } = await supabase
            .from("driver_profiles")
            .update({
              is_available,
            })
            .eq("id", driver_id)
            .select()
            .single();

          if (error) {
            return {
              error: {
                message: error.message,
              },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: "Status updated.",
            },
          };
        } catch (error) {
          console.error("Error at toggle status", error);
          return {
            error: {
              message: "Error at toggle status",
            },
          };
        }
      },
      onQueryStarted: async (
        { driver_id, is_available },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          driverApi.util.updateQueryData(
            "getIsAvailableStatus",
            { driver_id },
            (draft) => {
              if (draft) {
                draft.is_available = is_available;
              }
            }
          )
        );
        try {
          // 2. Wait for the real API call
          await queryFulfilled;
          // ✅ Success - cache stays updated
        } catch (error) {
          // ❌ Failed - automatically revert the UI
          patchResult.undo();
          console.error("Toggle failed, UI reverted:", error);
        }
      },
      invalidatesTags: ["getIsAvailableStatus"],
    }),

    updateDriverLocation: builder.mutation<
      any,
      { driver_id: string; driverLatitude: number; driverLongitude: number }
    >({
      queryFn: async ({ driverLatitude, driverLongitude, driver_id }) => {
        try {
          const { data, error } = await supabase
            .from("driver_profiles")
            .update({
              latitude: driverLatitude,
              longitude: driverLongitude,
              last_location_update: new Date(),
            })
            .eq("id", driver_id)
            .select()
            .single();

          if (error) {
            return {
              error: {
                message: error.message,
              },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: "Driver Location Updated.",
            },
          };
        } catch (error) {
          console.error("Error at updateDriverLocation", error);
          return {
            error: {
              message: "Error at updateDriverLocation",
            },
          };
        }
      },
      invalidatesTags: ["DriverLocation"],
    }),
  }),
});

export const {
  useUpdateDriverProfileMutation,
  useGetDriverProfileQuery,
  useUpdateDriverLocationMutation,
  useGetDriverChatRoomsQuery,
  useGetRiderRequestRideQuery,
  useDeclineRiderRequestRideMutation,
  useAcceptRiderRequestRideMutation,
  useGetIsAvailableStatusQuery,
  useToggleStatusMutation,
} = driverApi;
