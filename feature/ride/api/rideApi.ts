import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CancelRidePayload,
  CompleteRidePayload,
  CreateRidePayload,
  Ride,
  StartRidePayload,
} from "./interface";

export const rideApi = createApi({
  reducerPath: "rideApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["getStatusRide", "getRecentsRide"],
  endpoints: (builder) => ({
    createRides: builder.mutation<any, CreateRidePayload>({
      queryFn: async ({
        chat_room_id,
        destination_latitude,
        destination_location,
        destination_longitude,
        driver_id,
        pickup_latitude,
        pickup_location,
        pickup_longitude,
        rider_id,
        status,
        accepted_at,
      }) => {
        const { data, error } = await supabase.from("rides").insert([
          {
            chat_room_id,
            destination_latitude,
            destination_location,
            destination_longitude,
            driver_id,
            pickup_latitude,
            pickup_location,
            pickup_longitude,
            rider_id,
            status,
            accepted_at,
          },
        ]);

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
            message: "Rides created.",
          },
        };
      },
      invalidatesTags: ["getStatusRide"],
    }),

    startRide: builder.mutation<any, StartRidePayload>({
      queryFn: async ({ chat_room_id, driver_id, started_at, status }) => {
        try {
          const { data, error } = await supabase
            .from("rides")
            .update({
              status,
              started_at,
            })
            .eq("driver_id", driver_id)
            .eq("chat_room_id", chat_room_id)
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
              message: "Ride started.",
            },
          };
        } catch (error) {
          console.error("Error at start ride", error);
          return {
            error: {
              message: "Internal Server Error",
            },
          };
        }
      },
      // Optimistic update for start ride
      onQueryStarted: async (
        { chat_room_id, driver_id, status },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          rideApi.util.updateQueryData(
            "getStatusRide",
            { chat_room_id, driver_id, rider_id: "" },
            (draft) => {
              if (draft) {
                draft.status = status;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update if the request failed
          patchResult.undo();
        }
      },
      invalidatesTags: ["getStatusRide"],
    }),

    getStatusRide: builder.query<
      any,
      { chat_room_id: string; driver_id: string; rider_id: string }
    >({
      queryFn: async ({ chat_room_id, driver_id, rider_id }) => {
        try {
          const { data, error } = await supabase
            .from("rides")
            .select(
              "status, started_at, completed_at, cancelled_at, accepted_at"
            )
            .eq("chat_room_id", chat_room_id)
            .eq("driver_id", driver_id)
            .eq("rider_id", rider_id)
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
              message: "Ride status fetched",
            },
          };
        } catch (error) {
          console.error("Error at getStatusRide", error);
          return {
            error: {
              message: "Error at getStatusRide",
            },
          };
        }
      },
      providesTags: ["getStatusRide"],
    }),

    finishRide: builder.mutation<any, CompleteRidePayload>({
      queryFn: async ({ chat_room_id, driver_id, completed_at, status }) => {
        try {
          const { data, error } = await supabase
            .from("rides")
            .update({
              status,
              completed_at,
            })
            .eq("driver_id", driver_id)
            .eq("chat_room_id", chat_room_id)
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
              message: "Ride completed.",
            },
          };
        } catch (error) {
          console.error("Error at finish ride", error);
          return {
            error: {
              message: "Internal Server Error",
            },
          };
        }
      },
      // Optimistic update for finish ride
      onQueryStarted: async (
        { chat_room_id, driver_id, status },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          rideApi.util.updateQueryData(
            "getStatusRide",
            { chat_room_id, driver_id, rider_id: "" },
            (draft) => {
              if (draft) {
                draft.status = status;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update if the request failed
          patchResult.undo();
        }
      },
      invalidatesTags: ["getStatusRide"],
    }),

    cancelRide: builder.mutation<any, CancelRidePayload>({
      queryFn: async ({ chat_room_id, driver_id, cancelled_at, status }) => {
        try {
          const { data, error } = await supabase
            .from("rides")
            .update({
              status,
              cancelled_at,
            })
            .eq("driver_id", driver_id)
            .eq("chat_room_id", chat_room_id)
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
              message: "Ride cancelled.",
            },
          };
        } catch (error) {
          console.error("Error at cancel ride", error);
          return {
            error: {
              message: "Internal Server Error",
            },
          };
        }
      },
      // Optimistic update for cancel ride
      onQueryStarted: async (
        { chat_room_id, driver_id, status },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          rideApi.util.updateQueryData(
            "getStatusRide",
            { chat_room_id, driver_id, rider_id: "" },
            (draft) => {
              if (draft) {
                draft.status = status;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update if the request failed
          patchResult.undo();
        }
      },
      invalidatesTags: ["getStatusRide"],
    }),

    getRecentRides: builder.query<
      { success: boolean; rides: Ride[] },
      { currentUserId: string; userRole: "Rider" | "Driver" | "System" }
    >({
      queryFn: async ({ currentUserId, userRole }) => {
        try {
          let query;

          if (userRole === "Rider") {
            // Get rides where the current user is the rider
            query = supabase
              .from("rides")
              .select(
                `
              *,
              driver:driver_profiles!rides_driver_id_fkey(
                *, profiles:profiles(*)
              )
            `
              )
              .eq("rider_id", currentUserId)
              .in("status", ["completed", "cancelled"])
              .order("created_at", { ascending: false })
              .limit(10);
          } else if (userRole === "Driver") {
            // Get rides where the current user is the driver
            query = supabase
              .from("rides")
              .select(
                `
              *,
              rider:profiles!rides_rider_id_fkey(
                id,
                full_name,
                avatar_url,
                phone_number
              )
            `
              )
              .eq("driver_id", currentUserId)
              .in("status", ["completed", "cancelled"])
              .order("created_at", { ascending: false })
              .limit(10);
          } else if (userRole === "System") {
            // Get all rides for system/admin view
            query = supabase
              .from("rides")
              .select(
                `
              *,
              rider:profiles!rides_rider_id_fkey(
                id,
                full_name,
                avatar_url,
                phone_number
              ),
              driver:profiles!rides_driver_id_fkey(
                id,
                full_name,
                avatar_url,
                phone_number
              )
            `
              )
              .order("created_at", { ascending: false })
              .limit(20);
          }

          if (!query) {
            return {
              error: {
                success: false,
                message: "Invalid user role",
              },
            };
          }

          const { data, error } = await query;

          if (error) {
            console.error("Supabase error:", error);
            return {
              error: {
                success: false,
                message: error.message || "Failed to fetch recent rides",
              },
            };
          }

          return {
            data: {
              success: true,
              rides: data,
            },
          };
        } catch (error) {
          console.error("Error at getRecentRides", error);
          return {
            error: {
              success: false,
              message: "Error at getRecentRides",
            },
          };
        }
      },
      providesTags: ["getRecentsRide"],
    }),
  }),
});

export const {
  useCreateRidesMutation,
  useStartRideMutation,
  useGetStatusRideQuery,
  useFinishRideMutation,
  useCancelRideMutation,
  useGetRecentRidesQuery,
} = rideApi;
