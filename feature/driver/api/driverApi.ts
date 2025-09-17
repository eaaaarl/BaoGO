import { authApi } from "@/feature/auth/api/authApi";
import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DriverProfile,
  Ride,
  UpdateDriverLocationPayload,
  UpdateDriverProfilePayload,
} from "./interface";

export const driverApi = createApi({
  reducerPath: "driverApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["DriverProfile", "DriverLocation", "DriverChatRooms"],
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
    updateDriverLocation: builder.mutation({
      queryFn: async (payload: UpdateDriverLocationPayload) => {
        try {
          const { data, error } = await supabase
            .from("driver_locations")
            .update(payload)
            .eq("id", payload.id);

          if (error) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: error.message,
              },
            };
          }

          return {
            data,
          };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error as string } };
        }
      },
      invalidatesTags: ["DriverLocation"],
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
    }),
  }),
});

export const {
  useUpdateDriverProfileMutation,
  useGetDriverProfileQuery,
  useUpdateDriverLocationMutation,
  useGetDriverChatRoomsQuery,
  useGetRiderRequestRideQuery,
} = driverApi;
