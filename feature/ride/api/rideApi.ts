import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { CreateRidePayload } from "./interface";

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
  }),
});

export const { useCreateRidesMutation } = rideApi;
