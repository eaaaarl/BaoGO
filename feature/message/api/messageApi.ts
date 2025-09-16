import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Messages", "ChatRooms"],
  endpoints: (builder) => ({
    createChatRoom: builder.mutation<
      any,
      { driverId: string; riderId: string }
    >({
      queryFn: async ({ driverId, riderId }) => {
        try {
          // Create chat room
          const { data: chatRoom, error: roomError } = await supabase
            .from("chat_rooms")
            .insert([
              {
                driver_id: driverId,
                rider_id: riderId,
                status: "active",
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (roomError) throw roomError;

          const { data: systemMessage, error: messageError } = await supabase
            .from("messages")
            .insert([
              {
                chat_room_id: chatRoom.id,
                sender_id: null,
                sender_type: "system",
                message: "Ride confirmed! You can now chat with your driver.",
                sent_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (messageError) throw messageError;

          return { data: { chatRoom, systemMessage } };
        } catch (error: any) {
          console.error("Error creating chat room:", error);
          return { error: error.message };
        }
      },
      invalidatesTags: ["ChatRooms"],
    }),

    sendMessage: builder.mutation<
      any,
      {
        chatRoomId: string;
        message: string;
        senderId: string;
        senderType: "rider" | "driver" | "system";
      }
    >({
      queryFn: async ({ chatRoomId, message, senderId, senderType }) => {
        try {
          const { data, error } = await supabase
            .from("messages")
            .insert([
              {
                chat_room_id: chatRoomId,
                sender_id: senderId,
                sender_type: senderType,
                message: message,
                sent_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          console.error("Error sending message:", error);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Messages"],
    }),

    getChatMessages: builder.query<any[], { chatRoomId: string }>({
      queryFn: async ({ chatRoomId }) => {
        try {
          const { data, error } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles!messages_sender_id_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .eq("chat_room_id", chatRoomId)
            .order("sent_at", { ascending: true });

          if (error) throw error;
          return { data };
        } catch (error: any) {
          console.error("Error getting messages:", error);
          return { error: error.message };
        }
      },
      providesTags: ["Messages"],
    }),

    getChatRoom: builder.query<any, { chatRoomId: string }>({
      queryFn: async ({ chatRoomId }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .select(
              `
              *,
              driver:driver_profiles!chat_rooms_driver_id_fkey(
                id,
                profiles(full_name, avatar_url),
                vehicle_type,
                vehicle_color,
                vehicle_year
              ),
              rider:profiles!chat_rooms_rider_id_fkey(
                id,
                full_name,
                avatar_url
              )
            `
            )
            .eq("id", chatRoomId)
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          console.error("Error getting chat room:", error);
          return { error: error.message };
        }
      },
      providesTags: ["ChatRooms"],
    }),

    updateRideStatus: builder.mutation<
      any,
      { chatRoomId: string; status: string }
    >({
      queryFn: async ({ chatRoomId, status }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .update({
              status: status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", chatRoomId)
            .select()
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          console.error("Error updating ride status:", error);
          return { error: error.message };
        }
      },
      invalidatesTags: ["ChatRooms"],
    }),

    getUserChatRooms: builder.query<
      any[],
      { userId: string; driverId: string }
    >({
      queryFn: async ({ userId, driverId }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .select(
              `
              *,
              driver:driver_profiles!chat_rooms_driver_id_fkey(
                id,
                profiles(full_name, avatar_url),
                vehicle_type,
                vehicle_color
              ),
              rider:profiles!chat_rooms_rider_id_fkey(
                id,
                full_name,
                avatar_url
              ),
              latest_message:messages(
                message,
                sent_at,
                sender_type
              )
            `
            )
            .eq("rider_id", userId)
            .eq("driver_id", driverId)
            .order("updated_at", { ascending: false });

          console.log("rtk query chat rooms", data);

          if (error) throw error;
          return { data };
        } catch (error: any) {
          console.error("Error getting user chat rooms:", error);
          return { error: error.message };
        }
      },
      providesTags: ["ChatRooms"],
    }),
  }),
});

export const {
  useCreateChatRoomMutation,
  useSendMessageMutation,
  useGetChatMessagesQuery,
  useGetChatRoomQuery,
  useUpdateRideStatusMutation,
  useGetUserChatRoomsQuery,
} = messageApi;
