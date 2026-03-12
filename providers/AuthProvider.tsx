'use client'

import { useAuthStore } from "@/stores/authStore"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const hydrated = useAuthStore((state) => state.hydrated)

  /* prevent app rendering before auth loads */
  if (!hydrated) {
    return null
  }

  return <>{children}</>
}