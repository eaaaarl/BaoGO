import { useAppDispatch } from '@/libs/redux/hooks'
import { clearAuth, setAuthState } from '@/libs/redux/state/authSlice'
import { supabase } from '@/libs/supabase'
import { router } from 'expo-router'
import React, { useEffect } from 'react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  useEffect(() => {

    const checkInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (data.session?.user) {
          const role = data.session.user.user_metadata?.user_role
          dispatch(setAuthState({ user: data.session.user, session: data.session }))

          if (role === 'Driver') {
            router.replace('/(driver)/home')
          } else if (role === 'Rider') {
            router.replace('/(tabs)/home')
          } else {
            router.replace('/(auth)/welcome')
          }
        } else {
          dispatch(clearAuth())
          router.replace('/(auth)/welcome')
        }
      } catch (error) {
        console.error('Error checking initial session:', error)
      }
    }

    checkInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {

        console.log('EVENT', event)
        console.log('SESSION', session)

        if (session?.user) {
          const role = session.user.user_metadata?.user_role
          dispatch(setAuthState({ user: session.user, session }))

          if (role === 'Driver') {
            router.replace('/(driver)/home')
          } else if (role === 'Rider') {
            router.replace('/(tabs)/home')
          } else {
            router.replace('/(auth)/sign-in')
          }
        } else {
          dispatch(clearAuth())
          router.replace('/(auth)')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return <>{children}</>
}