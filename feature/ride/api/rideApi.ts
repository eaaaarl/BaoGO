import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { CreateRidePayload, StartRidePayload } from "./interface";

export const rideApi = createApi({
  reducerPath: "rideApi",
  baseQuery: fakeBaseQuery(),
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
            data: {
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

      onQueryStarted: (arg, api) => {
        console.log("args", arg);
        console.log("api", api);
      },
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
            data: {
              message: "Internal Server Error",
            },
          };
        }
      },
    }),

    getStatusRide: builder.query<
      any,
      { chat_room_id: string; driver_id: string; rider_id: string }
    >({
      queryFn: async ({ chat_room_id, driver_id, rider_id }) => {
        try {
          const { data, error } = await supabase
            .from("rides")
            .select("status")
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
    }),
  }),
});

export const {
  useCreateRidesMutation,
  useStartRideMutation,
  useGetStatusRideQuery,
} = rideApi;
