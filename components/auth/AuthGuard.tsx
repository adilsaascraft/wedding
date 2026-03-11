'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

type Props = {
  children: React.ReactNode
  role?: 'admin' | 'user'
}

export default function AuthGuard({ children, role }: Props) {

  const router = useRouter()

  const { user, accessToken } = useAuthStore()

  useEffect(() => {

    if (!accessToken) {
      router.replace('/')
      return
    }

    if (role && user?.role !== role) {

      if (user?.role === 'admin') {
        router.replace('/admin/dashboard')
      }

      if (user?.role === 'user') {
        router.replace('/user/dashboard')
      }

    }

  }, [accessToken, user, role, router])

  if (!accessToken) return null

  return <>{children}</>

}