import { useAppDispatch } from '@/libs/redux/hooks'
import { clearAuth, setAuthState } from '@/libs/redux/state/authSlice'
import { supabase } from '@/libs/supabase'
import { router } from 'expo-router'
import React, { useEffect } from 'react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const authSessionListener = async () => {
      const { data } = await supabase.auth.getSession()
      //console.log('Initial session', data, error)
      if (data.session?.user) {
        dispatch(setAuthState({ user: data.session.user, session: data.session }))
      } else {
        dispatch(clearAuth())
        router.replace('/(auth)')
      }
    }

    authSessionListener()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        //console.log('Auth state changed:', event, session)
        if (session?.user?.user_metadata?.user_role === 'Driver') {
          dispatch(setAuthState({ user: session.user, session: session }))
          router.replace('/(driver)/home')
        } else if (session?.user?.user_metadata?.user_role === 'Rider') {
          dispatch(setAuthState({ user: session.user, session: session }))
          router.replace('/(tabs)/home')
        } else {
          dispatch(clearAuth())
          router.replace('/(auth)/sign-in')
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch])

  return (
    <>{children}</>
  )
}