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
              vehicle_model: payload.vehicle_model,
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
