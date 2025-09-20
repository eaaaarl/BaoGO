import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CancelRidePayload,
  CompleteRidePayload,
  CreateRidePayload,
  StartRidePayload,
} from "./interface";

export const rideApi = createApi({
  reducerPath: "rideApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["getStatusRide"],
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
  }),
});

export const {
  useCreateRidesMutation,
  useStartRideMutation,
  useGetStatusRideQuery,
  useFinishRideMutation,
  useCancelRideMutation,
} = rideApi;
