import { authApi } from "@/feature/auth/api/authApi";
import { setAuthState, setInitialized } from "@/libs/redux/state/authSlice";
import { supabase } from "@/libs/supabase";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (mounted) {
          if (error) {
            console.error("Error getting session:", error);
          }

          dispatch(
            setAuthState({
              user: session?.user || null,
              session,
            })
          );
          dispatch(setInitialized());
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          dispatch(setInitialized());
        }
      }
    };

    initializeAuth();

    // Set up the auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event, session?.user?.email);

      dispatch(
        setAuthState({
          user: session?.user || null,
          session,
        })
      );

      // Invalidate cache when auth changes
      if (event === "SIGNED_IN") {
        dispatch(authApi.util.invalidateTags(["User", "Profile"]));
      } else if (event === "SIGNED_OUT") {
        dispatch(authApi.util.resetApiState());
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  return children;
};
