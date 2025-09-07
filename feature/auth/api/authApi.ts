import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ProfileUser, SignInPayload, SignUpPayload } from "./interface";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    signUp: builder.mutation({
      queryFn: async (credentials: SignUpPayload) => {
        try {
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email: credentials.email.trim().toLowerCase(),
              password: credentials.password,
              options: {
                data: {
                  full_name: credentials.full_name.trim(),
                },
              },
            });

          if (authError) {
            return {
              error: { status: "CUSTOM_ERROR", error: authError.message },
            };
          }

          if (authData.user && authData.session) {
            const { error: profileError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: authData.user.id,
                  full_name: credentials.full_name.trim(),
                  email: credentials.email.trim().toLowerCase(),
                  created_at: new Date().toISOString(),
                },
              ]);

            if (profileError) {
              console.error("Profile creation error:", profileError);
            }
          }

          return {
            data: {
              user: authData.user,
              session: authData.session,
            },
          };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error as string } };
        }
      },
      invalidatesTags: ["User", "Profile"],
    }),

    signIn: builder.mutation({
      queryFn: async (credentials: SignInPayload) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          });

          if (error) {
            return { error: { status: "CUSTOM_ERROR", error: error.message } };
          }

          return {
            data: {
              user: data.user,
              session: data.session,
            },
          };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error as string } };
        }
      },
      invalidatesTags: ["User", "Profile"],
    }),

    getProfileUser: builder.query<ProfileUser, string>({
      queryFn: async (userId: string) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }

        return { data: data };
      },
    }),
  }),
});

export const { useSignUpMutation, useSignInMutation, useGetProfileUserQuery } =
  authApi;
