


import { useAppDispatch } from '@/libs/redux/hooks'
import { clearAuth, setAuthState } from '@/libs/redux/state/authSlice'
import { supabase } from '@/libs/supabase'
import { router } from 'expo-router'
import React, { useEffect } from 'react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const authSessionListener = async () => {
      const { data, error } = await supabase.auth.getSession()
      //console.log('Initial session', data, error)

      if (data.session?.user) {
        dispatch(setAuthState({ user: data.session.user, session: data.session }))
      } else {
        dispatch(clearAuth())
        router.replace('/(auth)/sign-in')
      }
    }

    authSessionListener()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        //console.log('Auth state changed:', event, session)

        if (session?.user) {
          dispatch(setAuthState({ user: session.user, session: session }))
          if (event === 'SIGNED_IN') {
            router.replace('/(tabs)')
          }
        } else {
          dispatch(clearAuth())
          if (event === 'SIGNED_OUT') {
            router.replace('/(auth)/sign-in')
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch])

  return (
    <>{children}</>
  )
}