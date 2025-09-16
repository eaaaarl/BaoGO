import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { AvailableDriver } from "./interface";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["getDriverNearby", "AvailableDrivers"],
  endpoints: (builder) => ({
    getNearbyDrivers: builder.query({
      queryFn: async ({
        userLatitude,
        userLongitude,
        radiusInKm = 5,
      }: {
        userLatitude: number;
        userLongitude: number;
        radiusInKm?: number;
      }) => {
        try {
          const degreeRange = radiusInKm / 50;

          const { data, error } = await supabase
            .from("driver_profiles")
            .select(
              `
              id,
              latitude,
              longitude,
              last_location_update,
              vehicle_type,
              vehicle_color,
              vehicle_year,
              license_number,
              profiles:id (
                full_name,
                avatar_url
              )
            `
            )
            .gte("latitude", userLatitude - degreeRange)
            .lte("latitude", userLatitude + degreeRange)
            .gte("longitude", userLongitude - degreeRange)
            .lte("longitude", userLongitude + degreeRange)
            .not("latitude", "is", null)
            .not("longitude", "is", null)
            .order("last_location_update", { ascending: false });

          if (error) {
            return { error: { status: "CUSTOM_ERROR", error: error.message } };
          }

          return { data: data || [] };
        } catch (error) {
          console.log("💥 Catch error:", error);
          return {
            error: { status: "CUSTOM_ERROR", error: (error as Error).message },
          };
        }
      },
      providesTags: ["getDriverNearby"],
    }),

    getAvailableDrivers: builder.query<AvailableDriver[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("driver_profiles")
            .select(
              `
              id,
              latitude,
              longitude,
              last_location_update,
              vehicle_type,
              vehicle_color,
              vehicle_year,
              license_number,
              is_available,
              profiles!driver_profiles_id_fkey (
                full_name,
                avatar_url
              )
            `
            )
            .eq("is_available", true)
            .not("latitude", "is", null)
            .not("longitude", "is", null)
            .order("last_location_update", { ascending: false });

          console.log("Data Available Drivers", data);

          if (error) {
            console.log(error);
            return { error: { status: "CUSTOM_ERROR", error: error.message } };
          }

          return { data: data as unknown as AvailableDriver[] };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: (error as Error).message },
          };
        }
      },
      providesTags: ["AvailableDrivers"],
    }),
  }),
});

export const { useGetNearbyDriversQuery, useGetAvailableDriversQuery } =
  userApi;
