import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { DriverProfile, UpdateDriverProfilePayload } from "./interface";

export const driverApi = createApi({
  reducerPath: "driverApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    updateDriverProfile: builder.mutation({
      queryFn: async (payload: UpdateDriverProfilePayload) => {
        try {
          // update user metadata
          await supabase.auth.updateUser({
            data: {
              full_name: payload.full_name,
              phone: payload.phone,
            },
          });

          // upsert driver profile
          const { data, error } = await supabase
            .from("driver_profiles")
            .upsert({
              id: payload.id, // primary key (must exist in schema)
              vehicle_type: payload.vehicle_type,
              vehicle_model: payload.vehicle_model,
              vehicle_color: payload.vehicle_color,
              license_number: payload.vehicle_plate_number,
              vehicle_year: payload.vehicle_year,
            })
            .eq("id", payload.id) // ensures we target the same row
            .select()
            .single();

          if (error) {
            return { error: { status: "CUSTOM_ERROR", error: error.message } };
          }

          return {
            data,
          };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error as string } };
        }
      },
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
    }),
  }),
});

export const { useUpdateDriverProfileMutation, useGetDriverProfileQuery } =
  driverApi;
