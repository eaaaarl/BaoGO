import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ChatRoom, CreateChatRoomPayload } from "./inteface";

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["getChatRoom", "getMessages"],
  endpoints: (builder) => ({
    createChatRoom: builder.mutation<any, CreateChatRoomPayload>({
      queryFn: async ({ driverId, riderId }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .insert([
              {
                driver_id: driverId,
                rider_id: riderId,
                status: "Active",
              },
            ])
            .single();

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data: {
              data,
              success: true,
              message: "Chat room created.",
            },
          };
        } catch (error) {
          console.error("Error create chat room:", error);
          return {
            error: { message: "Failed to create a chat room" },
          };
        }
      },
    }),

    getChatRoom: builder.query<ChatRoom[], { rider_id: string }>({
      queryFn: async ({ rider_id }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .select(
              `*,
            driver:driver_profiles!chat_rooms_driver_id_fkey(*, profile:profiles(*)), 
            latest_message:messages(
            message,
            sent_at,
            sender_type)
            `
            )
            .eq("rider_id", rider_id)
            .order("updated_at", { ascending: true });

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: "Data chat room fetched",
            },
          };
        } catch (error) {
          console.error("error get chat room", error);
          return {
            error: {
              message: "Internal Server error",
            },
          };
        }
      },
    }),
  }),
});

export const { useCreateChatRoomMutation, useGetChatRoomQuery } = messageApi;
