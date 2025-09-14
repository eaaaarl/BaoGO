import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["getDriverNearby"],
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
          // Add some logging to see what's happening
          console.log("🔍 Looking for drivers near:", {
            userLatitude,
            userLongitude,
            radiusInKm,
          });

          // Make the search area bigger (was causing issues)
          const degreeRange = radiusInKm / 50; // Changed from 111 to 50 for bigger search area

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

          // Log the results
          console.log("📍 Found drivers:", data?.length || 0);
          console.log("❌ Error:", error);

          if (error) {
            return { error: { status: "CUSTOM_ERROR", error: error.message } };
          }

          // Always return an array, even if empty
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
  }),
});

export const { useGetNearbyDriversQuery } = userApi;
