'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import UserNavbar from '@/components/UserNavbar'

export default function UserLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter()

  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)

  useEffect(() => {

    if (!accessToken) {
      router.replace('/user/login')
      return
    }

    if (user?.role !== 'user') {
      router.replace('/admin/dashboard')
    }

  }, [accessToken, user, router])

  /* prevent flicker before auth loads */
  if (!accessToken) return null

  return (
    <div className="flex flex-col min-h-screen">

      {/* Mobile Navbar */}
      <div className="block sticky top-0 z-50">
        <UserNavbar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}