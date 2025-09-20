import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ChatRoom,
  CreateChatRoomPayload,
  SendMessagePayload,
} from "./inteface";

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["getChatRoom", "getMessages", "UserInfo"],
  endpoints: (builder) => ({
    createChatRoom: builder.mutation<any, CreateChatRoomPayload>({
      queryFn: async ({ driverId, riderId }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .upsert(
              [
                {
                  driver_id: driverId,
                  rider_id: riderId,
                  status: "Active",
                },
              ],
              { onConflict: "driver_id,rider_id" }
            )
            .select()
            .single();

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: `Chat rooms created Id: ${data}`,
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

    getChatMessages: builder.query<any, { chatRoomId: string }>({
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

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: "Messages fetched successfully",
            },
          };
        } catch (error) {
          console.error("Error at getChatMessages", error);
          return {
            error: {
              message: "Internal Server Error",
            },
          };
        }
      },
      providesTags: (result, error, arg) => [
        {
          type: "getMessages",
          id: arg.chatRoomId,
        },
      ],
    }),

    getUserInfo: builder.query<
      any,
      { userId: string; userType: "driver" | "rider" }
    >({
      queryFn: async ({ userId, userType }) => {
        try {
          let query;

          if (userType === "driver") {
            query = supabase
              .from("driver_profiles")
              .select(
                `
                *,
                profile:profiles(*),
                vehicle:vehicles(*)
              `
              )
              .eq("id", userId)
              .single();
          } else {
            query = supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();
          }

          const { data, error } = await query;

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: `${userType} info fetched successfully`,
            },
          };
        } catch (error) {
          console.error(`Error getting ${userType} info:`, error);
          return {
            error: {
              message: "Failed to fetch user information",
            },
          };
        }
      },
      providesTags: ["UserInfo"],
    }),

    getChatRoomById: builder.query<ChatRoom, { chatRoomId: string }>({
      queryFn: async ({ chatRoomId }) => {
        try {
          const { data, error } = await supabase
            .from("chat_rooms")
            .select(
              `
              *,
              driver:driver_profiles!chat_rooms_driver_id_fkey(
                *,
                profile:profiles(*)
              ),
              rider:profiles!chat_rooms_rider_id_fkey(*),
              latest_message:messages(
                message,
                sent_at,
                sender_type
              )
            `
            )
            .eq("id", chatRoomId)
            .single(); // This will return a single object, not an array

          if (error) {
            return {
              error: { message: error.message },
            };
          }

          return {
            data,
            meta: {
              success: true,
              message: "Chat room fetched successfully",
            },
          };
        } catch (error) {
          console.error("Error getting chat room:", error);
          return {
            error: { message: "Failed to fetch chat room" },
          };
        }
      },
      providesTags: ["getChatRoom"],
    }),

    sendMessage: builder.mutation<any, SendMessagePayload>({
      queryFn: async ({ chatRoomId, senderId, senderType, message }) => {
        try {
          const { data: messageData, error: messageError } = await supabase
            .from("messages")
            .insert([
              {
                chat_room_id: chatRoomId,
                sender_id: senderId,
                sender_type: senderType,
                message: message.trim(),
                sent_at: new Date().toISOString(),
              },
            ])
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
            .select()
            .single();

          if (messageError) {
            return {
              error: { message: messageError.message },
            };
          }

          // Update the chat room's updated_at timestamp
          const { error: updateError } = await supabase
            .from("chat_rooms")
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq("id", chatRoomId);

          if (updateError) {
            console.warn("Failed to update chat room timestamp:", updateError);
          }

          return {
            data: {
              data: messageData,
              success: true,
              message: "Message sent successfully",
            },
          };
        } catch (error) {
          console.error("Error sending message:", error);
          return {
            error: {
              message: "Failed to send message",
            },
          };
        }
      },

      onQueryStarted: async (
        { chatRoomId, message, senderId, senderType },
        { dispatch, queryFulfilled, getState }
      ) => {
        const state = getState() as any;
        const currentUser = state.auth?.user;

        const optimisticMessage = {
          id: `optimistic-${Date.now()}-${Math.random()}`,
          chat_room_id: chatRoomId,
          sender_id: senderId,
          sender_type: senderType,
          sent_at: new Date().toISOString(),
          message: message.trim(),
          sender: {
            id: senderId,
            full_name: currentUser?.full_name || "You",
            avatar_url: currentUser?.avatar_url || "",
          },
        };

        const patchResult = dispatch(
          messageApi.util.updateQueryData(
            "getChatMessages",
            { chatRoomId },
            (draft) => {
              if (draft) {
                draft.push(optimisticMessage);
              } else {
                console.warn("⚠️ [OPTIMISTIC] Draft is null/undefined!");
              }
            }
          )
        );

        try {
          // Wait for the actual mutation to complete
          const result = await queryFulfilled;

          // Update the cache with the real message, replacing the optimistic one
          dispatch(
            messageApi.util.updateQueryData(
              "getChatMessages",
              { chatRoomId },
              (draft) => {
                if (draft) {
                  const optimisticIndex = draft.findIndex(
                    (msg: any) => msg.id === optimisticMessage.id
                  );
                  if (optimisticIndex !== -1) {
                    draft[optimisticIndex] = result.data;
                  }
                }
              }
            )
          );
        } catch (error) {
          // If the mutation fails, revert the optimistic update
          patchResult.undo();
          console.error("Send message failed:", error);
        }
      },
      invalidatesTags: (result, error, arg) => [
        {
          type: "getMessages",
          id: arg.chatRoomId,
        },
        "getChatRoom",
      ],
    }),
  }),
});

export const {
  useCreateChatRoomMutation,
  useGetChatRoomQuery,
  useGetChatMessagesQuery,
  useGetUserInfoQuery,
  useGetChatRoomByIdQuery,
  useSendMessageMutation,
} = messageApi;
