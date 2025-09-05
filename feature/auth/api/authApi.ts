import { supabase } from "@/libs/supabase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { SignUpPayload } from "./interface";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fakeBaseQuery(),
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
    }),
  }),
});

export const { useSignUpMutation } = authApi;
